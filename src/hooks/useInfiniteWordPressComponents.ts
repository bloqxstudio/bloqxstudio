
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
  hasMore: boolean;
}

// Reduzido para carregamento ultra-rápido
const INITIAL_COMPONENTS_PER_PAGE = 12;
const SUBSEQUENT_COMPONENTS_PER_PAGE = 24;

// Helper function to fetch WordPress posts with pagination
const fetchWordPressComponentsPage = async (
  siteId: string, 
  siteUrl: string, 
  apiKey: string, 
  page: number = 1,
  perPage: number = INITIAL_COMPONENTS_PER_PAGE,
  categoryId?: string | null
): Promise<{ posts: any[], hasMore: boolean, totalPages: number }> => {
  let authHeader;
  if (apiKey.includes(':')) {
    const [username, password] = apiKey.split(':');
    const basicAuthToken = btoa(`${username}:${password}`);
    authHeader = `Basic ${basicAuthToken}`;
  } else {
    authHeader = `Bearer ${apiKey}`;
  }

  // Build URL with category filter if provided
  let url = `${siteUrl}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&status=publish`;
  if (categoryId && categoryId !== 'null') {
    url += `&categories=${categoryId}`;
  }

  const response = await fetch(url, {
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
    wordpress_post_url: post.link,
  };
};

export const useInfiniteWordPressComponents = ({ 
  searchTerm, 
  selectedCategory, 
  selectedSite,
  pageSize = INITIAL_COMPONENTS_PER_PAGE
}: UseInfiniteWordPressComponentsProps) => {
  // Fetch WordPress sites
  const { data: sites = [] } = useQuery({
    queryKey: ['wordpress-sites'],
    queryFn: getUserWordPressSites,
  });

  // Filter sites based on selection
  const sitesToFetch = selectedSite ? sites.filter(s => s.id === selectedSite) : sites;

  console.log('🔧 useInfiniteWordPressComponents filters:', {
    searchTerm,
    selectedCategory,
    selectedSite,
    sitesToFetch: sitesToFetch.length,
  });

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
      const currentPage = pageParam as number;
      
      // Use smaller page size for first load, larger for subsequent loads
      const currentPageSize = currentPage === 1 ? INITIAL_COMPONENTS_PER_PAGE : SUBSEQUENT_COMPONENTS_PER_PAGE;
      
      let hasMorePages = false;
      
      for (const site of sitesToFetch) {
        try {
          console.log(`🔄 Fetching page ${currentPage} from ${site.site_name} (category: ${selectedCategory})...`);
          const { posts, hasMore } = await fetchWordPressComponentsPage(
            site.id, 
            site.site_url, 
            site.api_key, 
            currentPage,
            Math.ceil(currentPageSize / sitesToFetch.length), // Distribute pageSize among sites
            selectedCategory // Pass category filter to API
          );
          
          const siteComponents = posts.map(post => 
            convertWordPressPostToComponent(post, site.id, site.site_name || site.site_url)
          );
          allComponents.push(...siteComponents);
          
          if (hasMore) {
            hasMorePages = true;
          }
        } catch (error) {
          console.error(`❌ Error fetching from ${site.site_name}:`, error);
        }
      }
      
      console.log(`✅ Page ${currentPage}: ${allComponents.length} components fetched`);
      return { 
        components: allComponents, 
        page: currentPage,
        hasMore: hasMorePages
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      // Continue if the last page had content and we haven't hit the limit
      return lastPage.hasMore && allPages.length < 10 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: sitesToFetch.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten all pages
  const allComponents = useMemo(() => {
    if (!data?.pages) return [];
    
    return data.pages.flatMap(page => page.components);
  }, [data]);

  // Apply search filter (category filter is now applied at API level)
  const filteredComponents = useMemo(() => {
    if (!searchTerm) return allComponents;
    
    return allComponents.filter(component => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = component.title.toLowerCase().includes(searchLower);
      const descriptionMatch = component.description?.toLowerCase().includes(searchLower);
      const sourceMatch = component.source_site?.toLowerCase().includes(searchLower);
      
      return titleMatch || descriptionMatch || sourceMatch;
    });
  }, [allComponents, searchTerm]);

  console.log('🎯 Final filter results:', {
    totalComponents: allComponents.length,
    filteredComponents: filteredComponents.length,
    hasNextPage,
    isFetchingNextPage,
  });

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
