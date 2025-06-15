
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sidebar,
  SidebarContent,
} from '@/components/ui/sidebar';
import { toast } from 'sonner';
import { getUserWordPressCategories } from '@/core/api/wordpress-categories';
import { getUserWordPressSites, syncWordPressSiteCategories } from '@/core/api/wordpress-sites';
import { WordPressCategory } from '@/core/api/wordpress-categories';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SidebarNavigation } from './sidebar/SidebarNavigation';
import { SidebarSiteSection } from './sidebar/SidebarSiteSection';
import { SidebarFooter } from './sidebar/SidebarFooter';

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

  const handleClearFilters = () => {
    onCategoryChange(null);
    onSiteChange(null);
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
      <SidebarHeader 
        onSync={handleSyncCategories}
        sitesCount={sites.length}
      />

      <SidebarContent>
        <SidebarNavigation
          selectedCategory={selectedCategory}
          selectedSite={selectedSite}
          totalPostCount={totalPostCount}
          onClearFilters={handleClearFilters}
        />

        {sites.length === 0 ? (
          <SidebarFooter sitesCount={0} />
        ) : (
          <div className="space-y-4">
            {Object.entries(categoriesBySite).map(([siteId, { site, categories: siteCategories }]) => (
              <SidebarSiteSection
                key={siteId}
                siteId={siteId}
                site={site}
                categories={siteCategories}
                selectedSite={selectedSite}
                selectedCategory={selectedCategory}
                isLoadingCategories={loadingCategories}
                onSiteChange={onSiteChange}
                onCategoryChange={onCategoryChange}
              />
            ))}
          </div>
        )}

        {sites.length > 0 && (
          <SidebarFooter sitesCount={sites.length} />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
