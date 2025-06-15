
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Component } from '@/core/types';
import { getUserWordPressSites } from '@/core/api/wordpress-sites';

interface UseWordPressDirectComponentsProps {
  searchTerm: string;
  selectedCategory: string | null;
  selectedSite: string | null;
}

// Helper function to fetch WordPress posts directly
const fetchWordPressComponents = async (siteId: string, siteUrl: string, apiKey: string, page: number = 1): Promise<any[]> => {
  let authHeader;
  if (apiKey.includes(':')) {
    const [username, password] = apiKey.split(':');
    const basicAuthToken = btoa(`${username}:${password}`);
    authHeader = `Basic ${basicAuthToken}`;
  } else {
    authHeader = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${siteUrl}/wp-json/wp/v2/posts?per_page=100&page=${page}&status=publish`, {
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.statusText}`);
  }

  const posts = await response.json();
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
  
  // If there are more pages, fetch them recursively
  if (page < totalPages) {
    const nextPagePosts = await fetchWordPressComponents(siteId, siteUrl, apiKey, page + 1);
    return [...posts, ...nextPagePosts];
  }
  
  return posts;
};

// Convert WordPress post to Component format
const convertWordPressPostToComponent = (post: any, siteId: string, siteName: string): Component => {
  return {
    id: `wp-${siteId}-${post.id}`,
    title: post.title.rendered || 'Untitled',
    description: post.excerpt.rendered?.replace(/<[^>]*>/g, '') || '',
    category: 'wordpress',
    code: post.content.rendered || '',
    json_code: post.content.rendered || '',
    preview_image: post.featured_media ? `${post._links?.['wp:featuredmedia']?.[0]?.href}` : undefined,
    tags: [],
    type: 'elementor' as const,
    visibility: 'public' as const,
    created_at: post.date,
    updated_at: post.modified,
    created_by: post.author?.toString() || '',
    source: 'wordpress' as const,
    source_site: siteName,
    wordpress_site_id: siteId,
    slug: post.slug,
    wordpress_category_id: post.categories?.[0],
    wordpress_category_name: undefined,
  };
};

export const useWordPressDirectComponents = ({ 
  searchTerm, 
  selectedCategory, 
  selectedSite 
}: UseWordPressDirectComponentsProps) => {
  // Fetch WordPress sites
  const { data: sites = [] } = useQuery({
    queryKey: ['wordpress-sites'],
    queryFn: getUserWordPressSites,
  });

  // Fetch components from all or selected sites
  const sitesToFetch = selectedSite ? sites.filter(s => s.id === selectedSite) : sites;

  const { data: allComponents = [], isLoading, error } = useQuery({
    queryKey: ['wordpress-direct-components', sitesToFetch.map(s => s.id)],
    queryFn: async () => {
      const components: Component[] = [];
      
      for (const site of sitesToFetch) {
        try {
          console.log(`🔄 Fetching components from ${site.site_name}...`);
          const posts = await fetchWordPressComponents(site.id, site.site_url, site.api_key);
          console.log(`✅ Fetched ${posts.length} posts from ${site.site_name}`);
          
          const siteComponents = posts.map(post => 
            convertWordPressPostToComponent(post, site.id, site.site_name || site.site_url)
          );
          components.push(...siteComponents);
        } catch (error) {
          console.error(`❌ Error fetching from ${site.site_name}:`, error);
          // Continue with other sites even if one fails
        }
      }
      
      console.log(`🎯 Total components fetched: ${components.length}`);
      return components;
    },
    enabled: sitesToFetch.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter components based on search and category
  const filteredComponents = useMemo(() => {
    return allComponents.filter(component => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const titleMatch = component.title.toLowerCase().includes(searchLower);
        const descriptionMatch = component.description?.toLowerCase().includes(searchLower);
        const sourceMatch = component.source_site?.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !descriptionMatch && !sourceMatch) {
          return false;
        }
      }

      // Site filter is already handled in the query above
      
      // Category filter (for WordPress categories)
      if (selectedCategory && component.wordpress_category_id?.toString() !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [allComponents, searchTerm, selectedCategory]);

  return {
    components: allComponents,
    filteredComponents,
    isLoading,
    error,
  };
};
