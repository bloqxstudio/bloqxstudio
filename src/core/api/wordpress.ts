import { supabase } from '@/integrations/supabase/client';
import { Component, Category } from '@/core/types';
import { extractCompleteStyles } from '@/utils/elementor/styleExtractor';

export interface WordPressApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
  meta?: {
    version: string;
    timestamp: string;
  };
}

export interface WordPressComponent extends Omit<Component, 'created_by'> {
  elementor_json: string;
  download_url: string;
  copy_code: string;
  wordpress_compatible: boolean;
}

export interface WordPressFilters {
  category?: string;
  tags?: string[];
  alignment?: string;
  columns?: string;
  elements?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

// Get public components for WordPress integration
export const getWordPressComponents = async (filters: WordPressFilters = {}): Promise<WordPressApiResponse<WordPressComponent[]>> => {
  try {
    const {
      category,
      tags,
      alignment,
      columns,
      elements,
      search,
      page = 1,
      limit = 20
    } = filters;

    let query = supabase
      .from('components')
      .select('*')
      .eq('visibility', 'public');

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    if (alignment) {
      query = query.eq('alignment', alignment);
    }

    if (columns) {
      query = query.eq('columns', columns);
    }

    if (elements && elements.length > 0) {
      query = query.overlaps('elements', elements);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const { count } = await supabase
      .from('components')
      .select('*', { count: 'exact', head: true })
      .eq('visibility', 'public');

    // Apply pagination and ordering
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching WordPress components:', error);
      throw error;
    }

    // Transform components for WordPress format with enhanced style extraction
    const wordpressComponents: WordPressComponent[] = await Promise.all((data || []).map(async component => {
      // Cast to include optional content property
      const componentWithContent = component as Component;
      let enhancedJsonCode = componentWithContent.json_code || componentWithContent.code;
      
      // Extract and merge styles if HTML content is available
      const htmlContent = componentWithContent.content || componentWithContent.code;
      if (htmlContent && enhancedJsonCode) {
        try {
          const styleData = extractCompleteStyles(htmlContent);
          
          // If we extracted meaningful style data, enhance the JSON
          if (Object.keys(styleData.colors).length > 0 || 
              Object.keys(styleData.typography).length > 0 || 
              Object.keys(styleData.spacing).length > 0) {
            
            const { mergeStylesIntoJson } = await import('@/utils/elementor/styleExtractor');
            enhancedJsonCode = mergeStylesIntoJson(enhancedJsonCode, styleData);
          }
        } catch (styleError) {
          console.warn('Error extracting styles for component:', componentWithContent.id, styleError);
          // Continue with original JSON if style extraction fails
        }
      }

      // Ensure proper source marking for WordPress components
      const source = componentWithContent.slug && componentWithContent.slug.startsWith('wp-') ? 'wordpress' : 'manual';

      return {
        ...componentWithContent,
        source, // Mark WordPress components correctly
        visibility: componentWithContent.visibility as 'public' | 'private',
        alignment: componentWithContent.alignment as 'left' | 'center' | 'right' | 'full' | undefined,
        columns: componentWithContent.columns as '1' | '2' | '3+' | undefined,
        elements: componentWithContent.elements as ('button' | 'video' | 'image' | 'list' | 'heading')[] | undefined,
        elementor_json: enhancedJsonCode, // Use enhanced JSON with styles
        download_url: `/wordpress-api/components/${componentWithContent.id}/download`,
        copy_code: enhancedJsonCode, // Use enhanced JSON for copying
        wordpress_compatible: true,
      };
    }));

    const totalCount = count || 0;
    const hasNext = offset + limit < totalCount;

    return {
      success: true,
      data: wordpressComponents,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasNext,
      },
      meta: {
        version: '1.0',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error in getWordPressComponents:', error);
    throw error;
  }
};

// Get single component for WordPress
export const getWordPressComponent = async (id: string): Promise<WordPressApiResponse<WordPressComponent>> => {
  try {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', id)
      .eq('visibility', 'public')
      .single();

    if (error) {
      console.error('Error fetching WordPress component:', error);
      throw error;
    }

    // Cast to include optional content property
    const componentWithContent = data as Component;
    let enhancedJsonCode = componentWithContent.json_code || componentWithContent.code;
    
    // Extract and merge styles if HTML content is available
    const htmlContent = componentWithContent.content || componentWithContent.code;
    if (htmlContent && enhancedJsonCode) {
      try {
        const styleData = extractCompleteStyles(htmlContent);
        
        if (Object.keys(styleData.colors).length > 0 || 
            Object.keys(styleData.typography).length > 0 || 
            Object.keys(styleData.spacing).length > 0) {
          
          const { mergeStylesIntoJson } = await import('@/utils/elementor/styleExtractor');
          enhancedJsonCode = mergeStylesIntoJson(enhancedJsonCode, styleData);
        }
      } catch (styleError) {
        console.warn('Error extracting styles for component:', componentWithContent.id, styleError);
      }
    }

    // Ensure proper source marking
    const source = componentWithContent.slug && componentWithContent.slug.startsWith('wp-') ? 'wordpress' : 'manual';

    const wordpressComponent: WordPressComponent = {
      ...componentWithContent,
      source, // Mark WordPress components correctly
      visibility: componentWithContent.visibility as 'public' | 'private',
      alignment: componentWithContent.alignment as 'left' | 'center' | 'right' | 'full' | undefined,
      columns: componentWithContent.columns as '1' | '2' | '3+' | undefined,
      elements: componentWithContent.elements as ('button' | 'video' | 'image' | 'list' | 'heading')[] | undefined,
      elementor_json: enhancedJsonCode,
      download_url: `/wordpress-api/components/${componentWithContent.id}/download`,
      copy_code: enhancedJsonCode,
      wordpress_compatible: true,
    };

    return {
      success: true,
      data: wordpressComponent,
      meta: {
        version: '1.0',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error in getWordPressComponent:', error);
    throw error;
  }
};

// Get categories for WordPress
export const getWordPressCategories = async (): Promise<WordPressApiResponse<Category[]>> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching WordPress categories:', error);
      throw error;
    }

    return {
      success: true,
      data: data || [],
      meta: {
        version: '1.0',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error in getWordPressCategories:', error);
    throw error;
  }
};

// Bulk download components
export const bulkDownloadWordPressComponents = async (componentIds: string[]): Promise<WordPressApiResponse<{ download_url: string; components: WordPressComponent[] }>> => {
  try {
    if (componentIds.length === 0) {
      throw new Error('No component IDs provided');
    }

    if (componentIds.length > 50) {
      throw new Error('Maximum 50 components allowed per bulk download');
    }

    const { data, error } = await supabase
      .from('components')
      .select('*')
      .in('id', componentIds)
      .eq('visibility', 'public');

    if (error) {
      console.error('Error fetching components for bulk download:', error);
      throw error;
    }

    const wordpressComponents: WordPressComponent[] = (data || []).map(component => ({
      ...component,
      visibility: component.visibility as 'public' | 'private',
      alignment: component.alignment as 'left' | 'center' | 'right' | 'full' | undefined,
      columns: component.columns as '1' | '2' | '3+' | undefined,
      elements: component.elements as ('button' | 'video' | 'image' | 'list' | 'heading')[] | undefined,
      elementor_json: component.json_code || component.code,
      download_url: `/wordpress-api/components/${component.id}/download`,
      copy_code: component.json_code || component.code,
      wordpress_compatible: true,
    }));

    return {
      success: true,
      data: {
        download_url: `/wordpress-api/download/bulk?ids=${componentIds.join(',')}`,
        components: wordpressComponents,
      },
      meta: {
        version: '1.0',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error in bulkDownloadWordPressComponents:', error);
    throw error;
  }
};
