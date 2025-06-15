
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

// Reduzido para carregamento ultra-rápido
const INITIAL_COMPONENTS_PER_PAGE = 10;
const SUBSEQUENT_COMPONENTS_PER_PAGE = 20;

// Helper function to fetch WordPress posts with pagination
const fetchWordPressComponentsPage = async (
  siteId: string, 
  siteUrl: string, 
  apiKey: string, 
  page: number = 1,
  perPage: number = INITIAL_COMPONENTS_PER_PAGE
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
  pageSize = INITIAL_COMPONENTS_PER_PAGE
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
      const currentPage = pageParam as number;
      
      // Use smaller page size for first load, larger for subsequent loads
      const currentPageSize = currentPage === 1 ? INITIAL_COMPONENTS_PER_PAGE : SUBSEQUENT_COMPONENTS_PER_PAGE;
      
      for (const site of sitesToFetch) {
        try {
          console.log(`🔄 Fetching page ${currentPage} from ${site.site_name} (${currentPageSize} items)...`);
          const { posts, hasMore } = await fetchWordPressComponentsPage(
            site.id, 
            site.site_url, 
            site.api_key, 
            currentPage,
            Math.ceil(currentPageSize / sitesToFetch.length) // Distribute pageSize among sites
          );
          
          const siteComponents = posts.map(post => 
            convertWordPressPostToComponent(post, site.id, site.site_name || site.site_url)
          );
          allComponents.push(...siteComponents);
        } catch (error) {
          console.error(`❌ Error fetching from ${site.site_name}:`, error);
        }
      }
      
      console.log(`✅ Page ${currentPage}: ${allComponents.length} components fetched (ultra-fast mode)`);
      return { components: allComponents, page: currentPage };
    },
    getNextPageParam: (lastPage, allPages) => {
      // Continue loading until we have enough content or hit limit
      return allPages.length < 15 ? allPages.length + 1 : undefined; // Increased limit since pages are smaller
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
