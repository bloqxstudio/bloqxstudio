
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserMenu } from './UserMenu';
import { OptimizedComponentSearch } from '@/components/filters/OptimizedComponentSearch';

interface ContentHeaderProps {
  title?: string;
  subtitle?: string;
  onSearchChange?: (searchTerm: string) => void;
  searchPlaceholder?: string;
}

export const ContentHeader: React.FC<ContentHeaderProps> = ({
  title = "The Vault",
  subtitle = "Basic Custom Cursor",
  onSearchChange,
  searchPlaceholder = "Search components..."
}) => {
  return (
    <div className="bg-white border-b border-border p-6">
      <div className="flex items-center justify-between mb-6">
        {/* Breadcrumb */}
        <div>
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <span>{title}</span>
            <span className="mx-2">/</span>
            <span>{subtitle}</span>
          </div>
          <h1 className="text-2xl font-semibold">Component Library</h1>
        </div>

        {/* User Menu */}
        <UserMenu />
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
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
              className="pl-10 h-12 text-base"
            />
          </div>
        )}
      </div>
    </div>
  );
};
