
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type?: 'messages' | 'conversations' | 'profile';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'messages', 
  count = 3 
}) => {
  if (type === 'conversations') {
    return (
      <div className="space-y-4 p-4">
        {[...Array(count)].map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  // Default: messages skeleton
  return (
    <div className="space-y-4 p-4">
      {[...Array(count)].map((_, index) => (
        <div 
          key={index} 
          className={`flex items-end gap-2 ${
            index % 2 === 0 ? 'justify-start' : 'justify-end'
          }`}
        >
          {index % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
          <div className="space-y-2">
            <Skeleton className={`h-16 rounded-lg ${
              index % 2 === 0 ? 'w-64' : 'w-48'
            }`} />
          </div>
          {index % 2 === 1 && <Skeleton className="h-8 w-8 rounded-full" />}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
