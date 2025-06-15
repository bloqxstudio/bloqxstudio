
import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Component } from '@/core/types';
import { getUserWordPressSites } from '@/core/api/wordpress-sites';

interface UseOptimizedWordPressComponentsProps {
  searchTerm: string;
  selectedCategory: string | null;
  selectedSite: string | null;
}

interface ComponentsPageData {
  components: Component[];
  page: number;
  hasMore: boolean;
  siteId: string;
}

// Otimizado para carregamento ultra-rápido
const INITIAL_COMPONENTS_PER_PAGE = 24; // Aumentado para mostrar mais conteúdo inicial
const SUBSEQUENT_COMPONENTS_PER_PAGE = 32; // Páginas subsequentes maiores

// Helper function para fetch paralelo com retry automático
const fetchWordPressComponentsParallel = async (
  sites: any[],
  page: number = 1,
  perPage: number = INITIAL_COMPONENTS_PER_PAGE,
  categoryId?: string | null
): Promise<ComponentsPageData[]> => {
  console.log(`🚀 Fetching parallel from ${sites.length} sites, page ${page}`);
  
  // Usar Promise.allSettled para não bloquear se um site falhar
  const sitePromises = sites.map(async (site) => {
    const retryFetch = async (retries = 2): Promise<ComponentsPageData> => {
      try {
        let authHeader;
        if (site.api_key.includes(':')) {
          const [username, password] = site.api_key.split(':');
          const basicAuthToken = btoa(`${username}:${password}`);
          authHeader = `Basic ${basicAuthToken}`;
        } else {
          authHeader = `Bearer ${site.api_key}`;
        }

        // Distribuir perPage entre sites para carregamento mais balanceado
        const sitePerPage = Math.ceil(perPage / sites.length);
        let url = `${site.site_url}/wp-json/wp/v2/posts?per_page=${sitePerPage}&page=${page}&status=publish&_fields=id,title,excerpt,content,date,modified,author,slug,categories,link,featured_media,_links`;
        
        if (categoryId && categoryId !== 'null') {
          url += `&categories=${categoryId}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout

        const response = await fetch(url, {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const posts = await response.json();
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
        const hasMore = page < totalPages;

        const siteComponents = posts.map((post: any) => ({
          id: `wp-${site.id}-${post.id}`,
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
          source_site: site.site_name || site.site_url,
          wordpress_site_id: site.id,
          slug: post.slug,
          wordpress_category_id: post.categories?.[0],
          wordpress_category_name: undefined,
          wordpress_post_url: post.link,
        }));

        console.log(`✅ Site ${site.site_name}: ${siteComponents.length} components loaded`);
        
        return {
          components: siteComponents,
          page,
          hasMore,
          siteId: site.id
        };
      } catch (error) {
        if (retries > 0) {
          console.log(`⚠️ Retrying ${site.site_name} (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo delay
          return retryFetch(retries - 1);
        }
        console.error(`❌ Failed to fetch from ${site.site_name}:`, error);
        return {
          components: [],
          page,
          hasMore: false,
          siteId: site.id
        };
      }
    };

    return retryFetch();
  });

  const results = await Promise.allSettled(sitePromises);
  
  return results
    .filter((result): result is PromiseFulfilledResult<ComponentsPageData> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value);
};

// Convert WordPress post to Component format (otimizado)
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

export const useOptimizedWordPressComponents = ({ 
  searchTerm, 
  selectedCategory, 
  selectedSite,
}: UseOptimizedWordPressComponentsProps) => {
  // Fetch WordPress sites com cache agressivo
  const { data: sites = [] } = useQuery({
    queryKey: ['wordpress-sites'],
    queryFn: getUserWordPressSites,
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });

  // Filter sites based on selection
  const sitesToFetch = selectedSite ? sites.filter(s => s.id === selectedSite) : sites;

  console.log('🔧 useOptimizedWordPressComponents filters:', {
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
  } = useInfiniteQuery({
    queryKey: ['wordpress-optimized-components', sitesToFetch.map(s => s.id), selectedCategory],
    queryFn: async ({ pageParam = 1 }) => {
      const currentPage = pageParam as number;
      const currentPageSize = currentPage === 1 ? INITIAL_COMPONENTS_PER_PAGE : SUBSEQUENT_COMPONENTS_PER_PAGE;
      
      console.log(`🚀 Fetching optimized page ${currentPage} with size ${currentPageSize}`);
      
      // Fetch paralelo de todos os sites
      const sitesData = await fetchWordPressComponentsParallel(
        sitesToFetch,
        currentPage,
        currentPageSize,
        selectedCategory
      );
      
      const allComponents = sitesData.flatMap(siteData => siteData.components);
      const hasMorePages = sitesData.some(siteData => siteData.hasMore);
      
      console.log(`✅ Page ${currentPage}: ${allComponents.length} total components fetched from ${sitesData.length} sites`);
      
      return { 
        components: allComponents, 
        page: currentPage,
        hasMore: hasMorePages
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore && allPages.length < 15 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: sitesToFetch.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutos para dados de componentes
    gcTime: 20 * 60 * 1000, // 20 minutos
    refetchOnMount: false, // Não refetch se já tem dados
  });

  // Flatten all pages com memoização
  const allComponents = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.components);
  }, [data]);

  // Apply search filter com memoização otimizada
  const filteredComponents = useMemo(() => {
    if (!searchTerm) return allComponents;
    
    const searchLower = searchTerm.toLowerCase();
    return allComponents.filter(component => {
      const titleMatch = component.title.toLowerCase().includes(searchLower);
      const descriptionMatch = component.description?.toLowerCase().includes(searchLower);
      const sourceMatch = component.source_site?.toLowerCase().includes(searchLower);
      
      return titleMatch || descriptionMatch || sourceMatch;
    });
  }, [allComponents, searchTerm]);

  console.log('🎯 Optimized filter results:', {
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
