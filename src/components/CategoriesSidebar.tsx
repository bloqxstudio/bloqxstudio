
import React from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/core/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Category } from '@/core/types/database';

interface CategoriesSidebarProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 60 * 1000,
  });

  return (
    <div className="pr-4 md:pr-6 min-w-[200px]">
      <h3 className="font-medium text-lg mb-4">Browse</h3>
      
      <div className="space-y-1 mb-6">
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors",
            !selectedCategory && "bg-accent/50 font-medium"
          )}
        >
          All
        </button>
        <button
          className={cn(
            "w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors",
          )}
        >
          Free
        </button>
      </div>
      
      <h3 className="font-medium text-lg mb-4">Categories</h3>
      
      <div className="space-y-1">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))
        ) : (
          (categories as Category[]).map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors",
                selectedCategory === category.id && "bg-accent/50 font-medium"
              )}
            >
              {category.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoriesSidebar;
