
import React from 'react';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { WordPressCategory } from '@/core/api/wordpress-categories';

interface SidebarSiteSectionProps {
  siteId: string;
  site: any;
  categories: WordPressCategory[];
  selectedSite: string | null;
  selectedCategory: string | null;
  isLoadingCategories: boolean;
  onSiteChange: (siteId: string | null) => void;
  onCategoryChange: (categoryId: string) => void;
}

export function SidebarSiteSection({
  siteId,
  site,
  categories,
  selectedSite,
  selectedCategory,
  isLoadingCategories,
  onSiteChange,
  onCategoryChange,
}: SidebarSiteSectionProps) {
  const totalSitePostCount = categories.reduce((sum, cat) => sum + (cat.post_count || 0), 0);

  return (
    <SidebarGroup key={siteId}>
      <SidebarGroupLabel>
        <button
          onClick={() => {
            console.log('🔄 Site filter clicked:', siteId, selectedSite === siteId ? 'deselecting' : 'selecting');
            onSiteChange(selectedSite === siteId ? null : siteId);
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
            {totalSitePostCount}
          </span>
        </button>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoadingCategories ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))
          ) : (
            categories.map((category) => (
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
  );
}
