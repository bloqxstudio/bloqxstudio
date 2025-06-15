
import { supabase } from '@/integrations/supabase/client';

export interface WordPressCategory {
  id: string;
  wordpress_site_id: string;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
  last_sync_at: string;
  created_at: string;
  updated_at: string;
  // Joined data from wordpress_sites
  site_name?: string;
  site_url?: string;
}

export interface WordPressCategoryCreateRequest {
  wordpress_site_id: string;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  post_count?: number;
}

// Get all WordPress categories for current user
export const getUserWordPressCategories = async (): Promise<WordPressCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('wordpress_categories')
      .select(`
        *,
        wordpress_sites!inner(site_name, site_url)
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      site_name: item.wordpress_sites?.site_name,
      site_url: item.wordpress_sites?.site_url,
    }));
  } catch (error) {
    console.error('Error fetching WordPress categories:', error);
    throw error;
  }
};

// Get categories for a specific WordPress site
export const getWordPressSiteCategories = async (siteId: string): Promise<WordPressCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('wordpress_categories')
      .select(`
        *,
        wordpress_sites!inner(site_name, site_url)
      `)
      .eq('wordpress_site_id', siteId)
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      site_name: item.wordpress_sites?.site_name,
      site_url: item.wordpress_sites?.site_url,
    }));
  } catch (error) {
    console.error('Error fetching site categories:', error);
    throw error;
  }
};

// Sync categories from WordPress site
export const syncWordPressSiteCategories = async (siteId: string): Promise<void> => {
  try {
    // Get WordPress site info
    const { data: site, error: siteError } = await supabase
      .from('wordpress_sites')
      .select('site_url, api_key')
      .eq('id', siteId)
      .single();

    if (siteError || !site) throw new Error('WordPress site not found');

    // Parse auth info and prepare headers
    let authHeader;
    if (site.api_key.includes(':')) {
      const [username, password] = site.api_key.split(':');
      const basicAuthToken = btoa(`${username}:${password}`);
      authHeader = `Basic ${basicAuthToken}`;
    } else {
      authHeader = `Bearer ${site.api_key}`;
    }

    // Fetch categories from WordPress REST API
    const categoriesUrl = `${site.site_url}/wp-json/wp/v2/categories?per_page=100`;
    const response = await fetch(categoriesUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const wpCategories = await response.json();

    // Sync categories to database
    for (const wpCategory of wpCategories) {
      const categoryData = {
        wordpress_site_id: siteId,
        category_id: wpCategory.id,
        name: wpCategory.name,
        slug: wpCategory.slug,
        description: wpCategory.description || null,
        post_count: wpCategory.count || 0,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Upsert category (insert or update if exists)
      const { error: upsertError } = await supabase
        .from('wordpress_categories')
        .upsert(categoryData, {
          onConflict: 'wordpress_site_id,category_id',
        });

      if (upsertError) {
        console.error('Error upserting category:', upsertError);
      }
    }

    // Update site's last sync time
    await supabase
      .from('wordpress_sites')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', siteId);

  } catch (error) {
    console.error('Error syncing WordPress categories:', error);
    throw error;
  }
};

// Create or update WordPress category
export const createWordPressCategory = async (
  categoryData: WordPressCategoryCreateRequest
): Promise<WordPressCategory> => {
  try {
    const { data, error } = await supabase
      .from('wordpress_categories')
      .upsert({
        ...categoryData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'wordpress_site_id,category_id',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating WordPress category:', error);
    throw error;
  }
};

// Delete WordPress category
export const deleteWordPressCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('wordpress_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting WordPress category:', error);
    throw error;
  }
};
