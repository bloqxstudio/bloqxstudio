
import React from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getUserWordPressCategories } from '@/core/api/wordpress-categories';
import { getUserWordPressSites, syncWordPressSiteCategories } from '@/core/api/wordpress-sites';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { WordPressCategory } from '@/core/api/wordpress-categories';

interface WordPressCategoriesSidebarProps {
  selectedCategory: string | null;
  selectedSite: string | null;
  onCategoryChange: (category: string | null) => void;
  onSiteChange: (site: string | null) => void;
}

const WordPressCategoriesSidebar: React.FC<WordPressCategoriesSidebarProps> = ({
  selectedCategory,
  selectedSite,
  onCategoryChange,
  onSiteChange
}) => {
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

  // Group categories by site
  const categoriesBySite = categories.reduce((acc, category) => {
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

  return (
    <div className="w-64 bg-white border-r border-border p-4 h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Browse Categories</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSyncCategories}
            disabled={sites.length === 0}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* All Categories */}
        <div className="space-y-1">
          <button
            onClick={() => {
              onCategoryChange(null);
              onSiteChange(null);
            }}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors",
              !selectedCategory && !selectedSite && "bg-accent/50 font-medium"
            )}
          >
            All Components ({categories.reduce((sum, cat) => sum + cat.post_count, 0)})
          </button>
        </div>

        {/* Sites and Categories */}
        {sites.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No WordPress sites connected</p>
            <p className="text-xs mt-1">Connect a site to see categories</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(categoriesBySite).map(([siteId, { site, categories: siteCategories }]) => (
              <div key={siteId} className="space-y-2">
                {/* Site Header */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSiteChange(selectedSite === siteId ? null : siteId);
                      onCategoryChange(null);
                    }}
                    className={cn(
                      "text-sm font-medium text-left hover:text-primary transition-colors flex-1",
                      selectedSite === siteId && "text-primary"
                    )}
                  >
                    <Globe className="h-3 w-3 inline mr-1" />
                    {site?.site_name || site?.site_url || 'WordPress Site'}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {siteCategories.reduce((sum, cat) => sum + cat.post_count, 0)}
                  </span>
                </div>

                {/* Categories for this site */}
                <div className="ml-4 space-y-1">
                  {loadingCategories ? (
                    Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))
                  ) : (
                    siteCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => onCategoryChange(category.id)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm flex justify-between items-center",
                          selectedCategory === category.id && "bg-accent/50 font-medium"
                        )}
                      >
                        <span className="truncate flex-1">{category.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({category.post_count})
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sync Info */}
        {sites.length > 0 && (
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>Categories are synced from your connected WordPress sites.</p>
            <p className="mt-1">Click the refresh button to update.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordPressCategoriesSidebar;
