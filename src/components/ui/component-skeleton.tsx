
import { Skeleton } from "@/components/ui/skeleton";

export const ComponentCardSkeleton = () => {
  return (
    <div className="group border border-border/50 rounded-lg overflow-hidden">
      {/* Preview skeleton mais limpo */}
      <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100">
        <Skeleton className="w-full h-full rounded-t-lg" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and source badge */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        
        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        
        {/* Tags skeleton */}
        <div className="flex gap-1.5 flex-wrap">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const ComponentsGridSkeleton = ({ count = 10 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ComponentCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
};

// Skeleton para carregamento incremental durante scroll
export const InfiniteLoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header skeleton pequeno */}
      <div className="flex justify-center py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      
      {/* Grid skeleton para carregamento incremental - 3 colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <ComponentCardSkeleton key={`infinite-skeleton-${index}`} />
        ))}
      </div>
    </div>
  );
};
