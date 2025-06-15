
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, Database, Globe, Layers, Users, Video } from 'lucide-react';
import { getUserWordPressCategories } from '@/core/api/wordpress-categories';
import { getUserWordPressSites } from '@/core/api/wordpress-sites';

interface MainSidebarProps {
  selectedCategory?: string | null;
  selectedSite?: string | null;
  onCategoryChange?: (category: string | null) => void;
  onSiteChange?: (site: string | null) => void;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({
  selectedCategory = null,
  selectedSite = null,
  onCategoryChange = () => {},
  onSiteChange = () => {}
}) => {
  const location = useLocation();
  const [sitesExpanded, setSitesExpanded] = React.useState(true);

  const { data: categories = [] } = useQuery({
    queryKey: ['wordpress-categories'],
    queryFn: getUserWordPressCategories,
    staleTime: 15 * 60 * 1000,
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['wordpress-sites'],
    queryFn: getUserWordPressSites,
    staleTime: 15 * 60 * 1000,
  });

  // Group categories by site
  const categoriesBySite = React.useMemo(() => {
    return Array.isArray(categories) ? categories.reduce((acc, category) => {
      const siteKey = category.wordpress_site_id;
      if (!acc[siteKey]) {
        acc[siteKey] = {
          site: sites.find(s => s.id === siteKey),
          categories: []
        };
      }
      acc[siteKey].categories.push(category);
      return acc;
    }, {} as Record<string, { site: any; categories: any[] }>) : {};
  }, [categories, sites]);

  const totalComponents = React.useMemo(() => {
    return Array.isArray(categories) ? categories.reduce((sum, cat) => sum + (cat.post_count || 0), 0) : 0;
  }, [categories]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-80 bg-white border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link to="/components" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Layers className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Superelements</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            <Button
              variant={isActive('/components') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                onCategoryChange(null);
                onSiteChange(null);
              }}
            >
              <Database className="h-4 w-4 mr-3" />
              All Components
              <span className="ml-auto text-xs text-muted-foreground">
                {totalComponents}
              </span>
            </Button>
          </div>

          {/* WordPress Sites Section */}
          {sites.length > 0 && (
            <div className="mt-8">
              <Collapsible open={sitesExpanded} onOpenChange={setSitesExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-0 h-8 font-medium text-sm">
                    <ChevronRight className={cn("h-4 w-4 mr-2 transition-transform", sitesExpanded && "rotate-90")} />
                    WordPress Sites
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2">
                  {Object.entries(categoriesBySite).map(([siteId, { site, categories: siteCategories }]) => (
                    <div key={siteId} className="ml-4">
                      {/* Site Header */}
                      <Button
                        variant={selectedSite === siteId ? 'secondary' : 'ghost'}
                        className="w-full justify-start text-sm mb-1"
                        onClick={() => {
                          onSiteChange(selectedSite === siteId ? null : siteId);
                          onCategoryChange(null);
                        }}
                      >
                        <Globe className="h-3 w-3 mr-2" />
                        <span className="truncate flex-1 text-left">
                          {site?.site_name || site?.site_url || 'WordPress Site'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {siteCategories.reduce((sum, cat) => sum + (cat.post_count || 0), 0)}
                        </span>
                      </Button>

                      {/* Categories */}
                      <div className="ml-4 space-y-0.5">
                        {siteCategories.map((category) => (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? 'secondary' : 'ghost'}
                            className="w-full justify-start text-xs h-7"
                            onClick={() => onCategoryChange(category.id)}
                          >
                            <span className="truncate flex-1 text-left">{category.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {category.post_count}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Coming Soon Features */}
          <div className="mt-8 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              disabled
            >
              <Users className="h-4 w-4 mr-3" />
              Agents
              <Badge variant="secondary" className="ml-auto text-xs">
                coming soon
              </Badge>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              disabled
            >
              <Video className="h-4 w-4 mr-3" />
              Videos
              <Badge variant="secondary" className="ml-auto text-xs">
                coming soon
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {sites.length} site{sites.length !== 1 ? 's' : ''} connected
        </div>
      </div>
    </div>
  );
};
