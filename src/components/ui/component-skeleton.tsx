
import { Skeleton } from "@/components/ui/skeleton";

export const ComponentCardSkeleton = () => {
  return (
    <div className="group border border-border/50 rounded-lg overflow-hidden">
      {/* Preview skeleton */}
      <div className="aspect-video bg-gray-50">
        <Skeleton className="w-full h-full rounded-t-lg" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-1 mb-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
      
      {/* Footer skeleton */}
      <div className="p-4 pt-0">
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    </div>
  );
};

export const ComponentsGridSkeleton = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ComponentCardSkeleton key={index} />
      ))}
    </div>
  );
};
