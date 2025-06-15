
import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Component } from '@/core/types';
import { getUserWordPressSites } from '@/core/api/wordpress-sites';
import { useQuery } from '@tanstack/react-query';

interface UseInfiniteWordPressComponentsProps {
  searchTerm: string;
  selectedCategory: string | null;
  selectedSite: string | null;
  pageSize?: number;
}

interface ComponentsPageData {
  components: Component[];
  page: number;
}

const COMPONENTS_PER_PAGE = 24;

// Helper function to fetch WordPress posts with pagination
const fetchWordPressComponentsPage = async (
  siteId: string, 
  siteUrl: string, 
  apiKey: string, 
  page: number = 1,
  perPage: number = COMPONENTS_PER_PAGE
): Promise<{ posts: any[], hasMore: boolean, totalPages: number }> => {
  let authHeader;
  if (apiKey.includes(':')) {
    const [username, password] = apiKey.split(':');
    const basicAuthToken = btoa(`${username}:${password}`);
    authHeader = `Basic ${basicAuthToken}`;
  } else {
    authHeader = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${siteUrl}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&status=publish`, {
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
  const hasMore = page < totalPages;
  
  return { posts, hasMore, totalPages };
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

export const useInfiniteWordPressComponents = ({ 
  searchTerm, 
  selectedCategory, 
  selectedSite,
  pageSize = COMPONENTS_PER_PAGE
}: UseInfiniteWordPressComponentsProps) => {
  // Fetch WordPress sites
  const { data: sites = [] } = useQuery({
    queryKey: ['wordpress-sites'],
    queryFn: getUserWordPressSites,
  });

  // Filter sites based on selection
  const sitesToFetch = selectedSite ? sites.filter(s => s.id === selectedSite) : sites;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery<ComponentsPageData, Error>({
    queryKey: ['wordpress-infinite-components', sitesToFetch.map(s => s.id), searchTerm, selectedCategory],
    queryFn: async ({ pageParam = 1 }): Promise<ComponentsPageData> => {
      const allComponents: Component[] = [];
      
      for (const site of sitesToFetch) {
        try {
          console.log(`🔄 Fetching page ${pageParam} from ${site.site_name}...`);
          const { posts, hasMore } = await fetchWordPressComponentsPage(
            site.id, 
            site.site_url, 
            site.api_key, 
            pageParam as number,
            Math.ceil(pageSize / sitesToFetch.length) // Distribute pageSize among sites
          );
          
          const siteComponents = posts.map(post => 
            convertWordPressPostToComponent(post, site.id, site.site_name || site.site_url)
          );
          allComponents.push(...siteComponents);
        } catch (error) {
          console.error(`❌ Error fetching from ${site.site_name}:`, error);
        }
      }
      
      console.log(`✅ Page ${pageParam}: ${allComponents.length} components fetched`);
      return { components: allComponents, page: pageParam as number };
    },
    getNextPageParam: (lastPage, allPages) => {
      // Simple pagination - in a real scenario you'd check if there are more pages per site
      return allPages.length < 10 ? allPages.length + 1 : undefined; // Limit to 10 pages for now
    },
    initialPageParam: 1,
    enabled: sitesToFetch.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Flatten all pages and apply filters
  const allComponents = useMemo(() => {
    if (!data?.pages) return [];
    
    return data.pages.flatMap(page => page.components);
  }, [data]);

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

      // Category filter
      if (selectedCategory && component.wordpress_category_id?.toString() !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [allComponents, searchTerm, selectedCategory]);

  return {
    components: allComponents,
    filteredComponents,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  };
};
