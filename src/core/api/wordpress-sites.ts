
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
  component_count?: number; // Added this property
  created_at: string;
  updated_at: string;
}

export interface WordPressSiteCreateRequest {
  site_url: string;
  api_key: string;
  site_name?: string;
  username?: string;
}

export interface WordPressSiteValidationResponse {
  is_valid: boolean;
  site_name?: string;
  wordpress_version?: string;
  elementor_active?: boolean;
  rest_api_enabled?: boolean;
  error?: string;
  auth_method?: string;
}

// Helper function to encode credentials for Basic Auth
const encodeBasicAuth = (username: string, password: string): string => {
  return btoa(`${username}:${password}`);
};

// Helper function to test REST API availability
const testRestApiAvailability = async (site_url: string): Promise<boolean> => {
  try {
    const cleanUrl = site_url.replace(/\/$/, '');
    const response = await fetch(`${cleanUrl}/wp-json/wp/v2/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('REST API test failed:', error);
    return false;
  }
};

// Validate WordPress site connection with multiple auth methods
export const validateWordPressSite = async (
  site_url: string, 
  api_key: string,
  username?: string
): Promise<WordPressSiteValidationResponse> => {
  try {
    // Clean and format URL
    const cleanUrl = site_url.replace(/\/$/, '');
    
    // First, test if REST API is available
    const restApiAvailable = await testRestApiAvailability(cleanUrl);
    if (!restApiAvailable) {
      return {
        is_valid: false,
        error: 'WordPress REST API não está disponível ou está desabilitada',
      };
    }

    // Get basic site info (public endpoint)
    const siteInfoResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/`);
    if (!siteInfoResponse.ok) {
      return {
        is_valid: false,
        error: 'Não foi possível acessar as informações do site WordPress',
      };
    }
    const siteInfo = await siteInfoResponse.json();

    // Try different authentication methods
    let authSuccess = false;
    let authMethod = '';
    let userResponse;

    // Method 1: Basic Auth with username:password (Application Password)
    if (username && api_key) {
      try {
        const basicAuthToken = encodeBasicAuth(username, api_key);
        userResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${basicAuthToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userResponse.ok) {
          authSuccess = true;
          authMethod = 'Basic Auth (Application Password)';
        }
      } catch (error) {
        console.error('Basic Auth failed:', error);
      }
    }

    // Method 2: Try Bearer token (in case it's a JWT or custom token)
    if (!authSuccess) {
      try {
        userResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${api_key}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userResponse.ok) {
          authSuccess = true;
          authMethod = 'Bearer Token';
        }
      } catch (error) {
        console.error('Bearer token failed:', error);
      }
    }

    // Method 3: Try as Application Password without username (some setups)
    if (!authSuccess && !username) {
      try {
        // Try to extract username from email format or use 'admin' as fallback
        const fallbackUsername = 'admin';
        const basicAuthToken = encodeBasicAuth(fallbackUsername, api_key);
        userResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${basicAuthToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userResponse.ok) {
          authSuccess = true;
          authMethod = 'Basic Auth (fallback username)';
        }
      } catch (error) {
        console.error('Fallback auth failed:', error);
      }
    }

    if (!authSuccess) {
      return {
        is_valid: false,
        error: 'Falha na autenticação. Verifique se a Application Password está correta e se o usuário tem permissões adequadas.',
        rest_api_enabled: true,
      };
    }

    // Check if Elementor is active (requires authentication)
    let elementor_active = false;
    try {
      const pluginsResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/plugins`, {
        headers: userResponse.headers.get('Authorization') ? 
          { 'Authorization': userResponse.headers.get('Authorization')! } :
          { 'Authorization': `Basic ${encodeBasicAuth(username || 'admin', api_key)}` },
      });

      if (pluginsResponse.ok) {
        const plugins = await pluginsResponse.json();
        elementor_active = plugins.some((plugin: any) => 
          plugin.plugin && plugin.plugin.includes('elementor') && plugin.status === 'active'
        );
      }
    } catch (error) {
      console.error('Plugin check failed:', error);
      // Not critical, continue without this info
    }

    return {
      is_valid: true,
      site_name: siteInfo.name || 'WordPress Site',
      wordpress_version: siteInfo.version,
      elementor_active,
      rest_api_enabled: true,
      auth_method: authMethod,
    };

  } catch (error) {
    console.error('WordPress validation error:', error);
    return {
      is_valid: false,
      error: error instanceof Error ? error.message : 'Erro de conexão. Verifique a URL e tente novamente.',
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
    const validation = await validateWordPressSite(
      siteData.site_url, 
      siteData.api_key,
      siteData.username
    );
    
    if (!validation.is_valid) {
      throw new Error(validation.error || 'Site validation failed');
    }

    // Store the complete auth info (username:password for Basic Auth)
    const authInfo = siteData.username ? 
      `${siteData.username}:${siteData.api_key}` : 
      siteData.api_key;

    const { data, error } = await supabase
      .from('wordpress_sites')
      .insert({
        user_id: user.id,
        site_url: siteData.site_url.replace(/\/$/, ''),
        site_name: siteData.site_name || validation.site_name,
        api_key: authInfo,
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

    // Parse stored auth info
    let username, password;
    if (site.api_key.includes(':')) {
      [username, password] = site.api_key.split(':');
    } else {
      password = site.api_key;
    }

    return await validateWordPressSite(site.site_url, password, username);
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

    // Parse auth info and prepare headers
    let authHeader;
    if (site.api_key.includes(':')) {
      const [username, password] = site.api_key.split(':');
      const basicAuthToken = encodeBasicAuth(username, password);
      authHeader = `Basic ${basicAuthToken}`;
    } else {
      authHeader = `Bearer ${site.api_key}`;
    }

    // Import to WordPress via REST API
    const importUrl = `${site.site_url}/wp-json/elementor/v1/template-library/import`;
    const response = await fetch(importUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
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

// Export the sync function from wordpress-categories
export { syncWordPressSiteCategories } from './wordpress-categories';
