
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { OptimizedComponentSearch } from '@/components/filters/OptimizedComponentSearch';

interface ContentHeaderProps {
  onSearchChange?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  selectedSiteId?: string | null;
  sites?: any[];
  selectedCategory?: string | null;
  categories?: any[];
}

export const ContentHeader: React.FC<ContentHeaderProps> = ({
  onSearchChange,
  searchPlaceholder = "Search components...",
  selectedSiteId,
  sites = [],
  selectedCategory,
  categories = []
}) => {
  // Get the current site name
  const getCurrentSiteName = () => {
    if (selectedSiteId) {
      const site = sites.find(s => s.id === selectedSiteId);
      return site?.site_name || site?.site_url || 'WordPress Site';
    }
    return 'All Components';
  };

  // Get category name if selected
  const getCategoryName = () => {
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      return category?.name;
    }
    return null;
  };

  const siteName = getCurrentSiteName();
  const categoryName = getCategoryName();

  return (
    <div className="bg-white border-b border-border p-6">
      <div className="flex items-center justify-between">
        {/* Left: Site Name and Category */}
        <div>
          <h1 className="text-2xl font-semibold">{siteName}</h1>
          {categoryName && (
            <p className="text-sm text-muted-foreground mt-1">{categoryName}</p>
          )}
        </div>

        {/* Right: Search Bar Only */}
        <div className="flex items-center">
          {/* Search Bar */}
          <div className="w-80">
            {onSearchChange ? (
              <OptimizedComponentSearch
                onSearchChange={onSearchChange}
                placeholder={searchPlaceholder}
                className="w-full"
              />
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="pl-10 h-10 text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
