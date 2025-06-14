
import { supabase } from '@/integrations/supabase/client';

export interface WordPressSite {
  id: string;
  user_id: string;
  site_url: string;
  site_name?: string;
  api_key: string;
  wordpress_version?: string;
  elementor_active?: boolean;
  last_sync_at?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface WordPressSiteCreateRequest {
  site_url: string;
  api_key: string;
  site_name?: string;
}

export interface WordPressSiteValidationResponse {
  is_valid: boolean;
  site_name?: string;
  wordpress_version?: string;
  elementor_active?: boolean;
  rest_api_enabled?: boolean;
  error?: string;
}

// Validate WordPress site connection
export const validateWordPressSite = async (
  site_url: string, 
  api_key: string
): Promise<WordPressSiteValidationResponse> => {
  try {
    // Clean and format URL
    const cleanUrl = site_url.replace(/\/$/, '');
    const restApiUrl = `${cleanUrl}/wp-json/wp/v2/users/me`;
    
    const response = await fetch(restApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check if WordPress REST API is accessible
    const siteInfoResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/`);
    const siteInfo = await siteInfoResponse.json();

    // Check if Elementor is active
    const pluginsResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/plugins`, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
      },
    });

    let elementor_active = false;
    if (pluginsResponse.ok) {
      const plugins = await pluginsResponse.json();
      elementor_active = plugins.some((plugin: any) => 
        plugin.plugin && plugin.plugin.includes('elementor') && plugin.status === 'active'
      );
    }

    return {
      is_valid: true,
      site_name: siteInfo.name || 'WordPress Site',
      wordpress_version: siteInfo.version,
      elementor_active,
      rest_api_enabled: true,
    };

  } catch (error) {
    console.error('WordPress validation error:', error);
    return {
      is_valid: false,
      error: error instanceof Error ? error.message : 'Conexão falhou',
    };
  }
};

// Create WordPress site connection
export const createWordPressSite = async (
  siteData: WordPressSiteCreateRequest
): Promise<WordPressSite> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First validate the site
    const validation = await validateWordPressSite(siteData.site_url, siteData.api_key);
    if (!validation.is_valid) {
      throw new Error(validation.error || 'Site validation failed');
    }

    const { data, error } = await supabase
      .from('wordpress_sites')
      .insert({
        user_id: user.id,
        site_url: siteData.site_url.replace(/\/$/, ''),
        site_name: siteData.site_name || validation.site_name,
        api_key: siteData.api_key,
        wordpress_version: validation.wordpress_version,
        elementor_active: validation.elementor_active,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating WordPress site:', error);
    throw error;
  }
};

// Get user's WordPress sites
export const getUserWordPressSites = async (): Promise<WordPressSite[]> => {
  try {
    const { data, error } = await supabase
      .from('wordpress_sites')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching WordPress sites:', error);
    throw error;
  }
};

// Update WordPress site
export const updateWordPressSite = async (
  id: string, 
  updates: Partial<WordPressSite>
): Promise<WordPressSite> => {
  try {
    const { data, error } = await supabase
      .from('wordpress_sites')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating WordPress site:', error);
    throw error;
  }
};

// Delete WordPress site
export const deleteWordPressSite = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('wordpress_sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting WordPress site:', error);
    throw error;
  }
};

// Test connection for existing site
export const testWordPressSiteConnection = async (id: string): Promise<WordPressSiteValidationResponse> => {
  try {
    const { data: site, error } = await supabase
      .from('wordpress_sites')
      .select('site_url, api_key')
      .eq('id', id)
      .single();

    if (error || !site) throw new Error('Site not found');

    return await validateWordPressSite(site.site_url, site.api_key);
  } catch (error) {
    console.error('Error testing WordPress connection:', error);
    return {
      is_valid: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    };
  }
};

// Import component to WordPress
export const importComponentToWordPress = async (
  wordpressSiteId: string,
  componentId: string
): Promise<void> => {
  try {
    // Log the sync attempt
    const { error: syncError } = await supabase
      .from('component_syncs')
      .insert({
        wordpress_site_id: wordpressSiteId,
        component_id: componentId,
        sync_type: 'import',
        status: 'pending',
      });

    if (syncError) {
      console.error('Error logging sync:', syncError);
    }

    // Get WordPress site info
    const { data: site, error: siteError } = await supabase
      .from('wordpress_sites')
      .select('site_url, api_key')
      .eq('id', wordpressSiteId)
      .single();

    if (siteError || !site) throw new Error('WordPress site not found');

    // Get component data
    const { data: component, error: componentError } = await supabase
      .from('components')
      .select('*')
      .eq('id', componentId)
      .single();

    if (componentError || !component) throw new Error('Component not found');

    // Import to WordPress via REST API
    const importUrl = `${site.site_url}/wp-json/elementor/v1/template-library/import`;
    const response = await fetch(importUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${site.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: component.title,
        content: component.json_code || component.code,
        type: 'page',
        source: 'superelements',
      }),
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }

    // Update sync status to success
    await supabase
      .from('component_syncs')
      .update({ status: 'success' })
      .eq('wordpress_site_id', wordpressSiteId)
      .eq('component_id', componentId)
      .eq('sync_type', 'import');

  } catch (error) {
    console.error('Error importing component to WordPress:', error);
    
    // Update sync status to failed
    await supabase
      .from('component_syncs')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Import failed',
      })
      .eq('wordpress_site_id', wordpressSiteId)
      .eq('component_id', componentId)
      .eq('sync_type', 'import');

    throw error;
  }
};
