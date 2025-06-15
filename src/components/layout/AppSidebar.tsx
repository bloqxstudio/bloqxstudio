
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Globe, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { getUserWordPressCategories } from '@/core/api/wordpress-categories';
import { getUserWordPressSites, syncWordPressSiteCategories } from '@/core/api/wordpress-sites';
import { WordPressCategory } from '@/core/api/wordpress-categories';

interface AppSidebarProps {
  selectedCategory?: string | null;
  selectedSite?: string | null;
  onCategoryChange?: (category: string | null) => void;
  onSiteChange?: (site: string | null) => void;
}

export function AppSidebar({
  selectedCategory = null,
  selectedSite = null,
  onCategoryChange = () => {},
  onSiteChange = () => {}
}: AppSidebarProps) {
  const { data: categories = [], isLoading: loadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['wordpress-categories'],
    queryFn: getUserWordPressCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['wordpress-sites'],
    queryFn: getUserWordPressSites,
  });

  const handleSyncCategories = async () => {
    try {
      toast.promise(
        Promise.all(sites.map(site => syncWordPressSiteCategories(site.id))),
        {
          loading: 'Syncing categories from WordPress sites...',
          success: 'Categories synced successfully!',
          error: 'Error syncing categories',
        }
      );
      
      // Refresh categories after sync
      setTimeout(() => refetchCategories(), 1000);
    } catch (error) {
      console.error('Error syncing categories:', error);
    }
  };

  // Safely handle categories array - ensure it's always an array before using reduce
  const categoriesArray = Array.isArray(categories) ? categories : [];
  
  // Group categories by site
  const categoriesBySite = categoriesArray.reduce((acc, category) => {
    const siteKey = category.wordpress_site_id;
    if (!acc[siteKey]) {
      acc[siteKey] = {
        site: sites.find(s => s.id === siteKey),
        categories: []
      };
    }
    acc[siteKey].categories.push(category);
    return acc;
  }, {} as Record<string, { site: any; categories: WordPressCategory[] }>);

  // Safely calculate total post count
  const totalPostCount = categoriesArray.reduce((sum, cat) => sum + (cat.post_count || 0), 0);

  console.log('🎯 AppSidebar state:', {
    selectedCategory,
    selectedSite,
    categoriesCount: categoriesArray.length,
    sitesCount: sites.length,
    categoriesBySite: Object.keys(categoriesBySite),
  });

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filtros</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSyncCategories}
            disabled={sites.length === 0}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    console.log('🔄 Clearing all filters');
                    onCategoryChange(null);
                    onSiteChange(null);
                  }}
                  isActive={!selectedCategory && !selectedSite}
                >
                  <span>Todos os Componentes</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    ({totalPostCount})
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {sites.length === 0 ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="text-center text-muted-foreground text-sm py-8 px-4">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum site WordPress conectado</p>
                <p className="text-xs mt-1">Conecte um site para ver categorias</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <div className="space-y-4">
            {Object.entries(categoriesBySite).map(([siteId, { site, categories: siteCategories }]) => (
              <SidebarGroup key={siteId}>
                <SidebarGroupLabel>
                  <button
                    onClick={() => {
                      console.log('🔄 Site filter clicked:', siteId, selectedSite === siteId ? 'deselecting' : 'selecting');
                      onSiteChange(selectedSite === siteId ? null : siteId);
                      onCategoryChange(null);
                    }}
                    className={cn(
                      "flex items-center gap-2 w-full text-left hover:text-primary transition-colors",
                      selectedSite === siteId && "text-primary font-medium"
                    )}
                  >
                    <Globe className="h-3 w-3" />
                    <span className="truncate flex-1">
                      {site?.site_name || site?.site_url || 'WordPress Site'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {siteCategories.reduce((sum, cat) => sum + (cat.post_count || 0), 0)}
                    </span>
                  </button>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {loadingCategories ? (
                      Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))
                    ) : (
                      siteCategories.map((category) => (
                        <SidebarMenuItem key={category.id}>
                          <SidebarMenuButton
                            onClick={() => {
                              console.log('🔄 Category filter clicked:', category.category_id, category.name);
                              onCategoryChange(category.category_id.toString());
                            }}
                            isActive={selectedCategory === category.category_id.toString()}
                            className="w-full justify-between"
                          >
                            <span className="truncate">{category.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({category.post_count || 0})
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </div>
        )}

        {sites.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="text-xs text-muted-foreground border-t pt-4 px-2">
                <p>Categorias sincronizadas dos seus sites WordPress.</p>
                <p className="mt-1">Clique no ícone de atualização para sincronizar.</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
