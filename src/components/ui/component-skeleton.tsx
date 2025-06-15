
import { Skeleton } from "@/components/ui/skeleton";

export const ComponentCardSkeleton = () => {
  return (
    <div className="group border border-border/50 rounded-lg overflow-hidden animate-pulse">
      {/* Preview skeleton com shimmer effect */}
      <div className="aspect-video bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%]">
        <Skeleton className="w-full h-full rounded-t-lg" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    </div>
  );
};

export const ComponentsGridSkeleton = ({ count = 10 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ComponentCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
};

// Skeleton para loading incremental durante scroll
export const InfiniteLoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header skeleton menor */}
      <div className="flex justify-center py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      {/* Grid skeleton menor para carregamento incremental */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <ComponentCardSkeleton key={`infinite-skeleton-${index}`} />
        ))}
      </div>
    </div>
  );
};
