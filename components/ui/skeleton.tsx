import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = ({ className = "", ...props }: SkeletonProps) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} {...props} />
);

export const SkeletonCard = () => (
  <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-4 w-20" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

export const SkeletonChart = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-64 w-full" />
  </div>
);
