
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hora
const RATE_LIMIT_MAX = 100; // 100 requisições por hora

function getRealIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // Primeira requisição ou janela expirou
    const resetTime = now + RATE_LIMIT_WINDOW;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetTime: entry.resetTime };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/wordpress-api/', '');
    
    // Rate limiting
    const clientIP = getRealIP(req);
    const rateLimitResult = checkRateLimit(clientIP);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded. Try again later.' 
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    // Log da requisição
    console.log(`WordPress API Request: ${req.method} ${path} from ${clientIP}`);

    if (path === 'components' && req.method === 'GET') {
      // GET /wordpress-api/components
      const category = url.searchParams.get('category');
      const tags = url.searchParams.get('tags')?.split(',').filter(Boolean);
      const alignment = url.searchParams.get('alignment');
      const columns = url.searchParams.get('columns');
      const elements = url.searchParams.get('elements')?.split(',').filter(Boolean);
      const search = url.searchParams.get('search');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

      let query = supabase
        .from('components')
        .select('*')
        .eq('visibility', 'public');

      // Apply filters
      if (category) query = query.eq('category', category);
      if (tags && tags.length > 0) query = query.overlaps('tags', tags);
      if (alignment) query = query.eq('alignment', alignment);
      if (columns) query = query.eq('columns', columns);
      if (elements && elements.length > 0) query = query.overlaps('elements', elements);
      if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

      // Get total count
      const { count } = await supabase
        .from('components')
        .select('*', { count: 'exact', head: true })
        .eq('visibility', 'public');

      // Apply pagination
      const offset = (page - 1) * limit;
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const components = (data || []).map(component => ({
        ...component,
        elementor_json: component.json_code || component.code,
        download_url: `${url.origin}/wordpress-api/components/${component.id}/download`,
        copy_code: component.json_code || component.code,
        wordpress_compatible: true,
      }));

      return new Response(
        JSON.stringify({
          success: true,
          data: components,
          pagination: {
            page,
            limit,
            total: count || 0,
            hasNext: offset + limit < (count || 0),
          },
          meta: {
            version: '1.0',
            timestamp: new Date().toISOString(),
          },
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          },
        }
      );
    }

    if (path.startsWith('components/') && path.endsWith('/download') && req.method === 'GET') {
      // GET /wordpress-api/components/{id}/download
      const componentId = path.split('/')[1];
      
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', componentId)
        .eq('visibility', 'public')
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Component not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const elementorJson = data.json_code || data.code;
      const filename = `${data.title.toLowerCase().replace(/\s+/g, '-')}.json`;

      return new Response(elementorJson, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    if (path.startsWith('components/') && req.method === 'GET') {
      // GET /wordpress-api/components/{id}
      const componentId = path.split('/')[1];
      
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', componentId)
        .eq('visibility', 'public')
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Component not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const component = {
        ...data,
        elementor_json: data.json_code || data.code,
        download_url: `${url.origin}/wordpress-api/components/${data.id}/download`,
        copy_code: data.json_code || data.code,
        wordpress_compatible: true,
      };

      return new Response(
        JSON.stringify({
          success: true,
          data: component,
          meta: {
            version: '1.0',
            timestamp: new Date().toISOString(),
          },
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          },
        }
      );
    }

    if (path === 'categories' && req.method === 'GET') {
      // GET /wordpress-api/categories
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          data: data || [],
          meta: {
            version: '1.0',
            timestamp: new Date().toISOString(),
          },
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          },
        }
      );
    }

    if (path === 'download/bulk' && req.method === 'GET') {
      // GET /wordpress-api/download/bulk?ids=id1,id2,id3
      const idsParam = url.searchParams.get('ids');
      if (!idsParam) {
        return new Response(
          JSON.stringify({ success: false, error: 'Component IDs required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const componentIds = idsParam.split(',').filter(Boolean);
      if (componentIds.length === 0 || componentIds.length > 50) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid number of component IDs (max 50)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('components')
        .select('*')
        .in('id', componentIds)
        .eq('visibility', 'public');

      if (error) throw error;

      // Create a ZIP-like JSON structure with all components
      const components = (data || []).map(component => ({
        filename: `${component.title.toLowerCase().replace(/\s+/g, '-')}.json`,
        content: component.json_code || component.code,
        component_data: {
          ...component,
          elementor_json: component.json_code || component.code,
          wordpress_compatible: true,
        }
      }));

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            components,
            download_info: {
              total_components: components.length,
              format: 'json_bundle',
              timestamp: new Date().toISOString(),
            }
          },
          meta: {
            version: '1.0',
            timestamp: new Date().toISOString(),
          },
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          },
        }
      );
    }

    if (path === 'stats' && req.method === 'GET') {
      // GET /wordpress-api/stats
      const { data: components, error: componentsError } = await supabase
        .from('components')
        .select('*')
        .eq('visibility', 'public');

      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (componentsError || categoriesError) {
        throw componentsError || categoriesError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            total_components: components?.length || 0,
            total_categories: categories?.length || 0,
            public_components: components?.length || 0,
            last_updated: new Date().toISOString(),
          },
          meta: {
            version: '1.0',
            timestamp: new Date().toISOString(),
          },
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          },
        }
      );
    }

    // 404 para rotas não encontradas
    return new Response(
      JSON.stringify({ success: false, error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('WordPress API Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
