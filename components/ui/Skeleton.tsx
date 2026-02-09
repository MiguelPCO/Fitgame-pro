import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('animate-pulse rounded-lg bg-background-lighter/50', className)} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-background-card rounded-xl p-4 space-y-3', className)}>
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-8 w-full" />
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 p-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
    {/* XP Bar */}
    <Skeleton className="h-3 w-full rounded-full" />
    {/* Stats row */}
    <div className="grid grid-cols-3 gap-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    {/* Calendar */}
    <Skeleton className="h-16 w-full rounded-xl" />
    {/* Workout card */}
    <SkeletonCard className="h-32" />
    {/* Last session */}
    <SkeletonCard className="h-24" />
  </div>
);

export const ProgressSkeleton: React.FC = () => (
  <div className="space-y-6 p-4">
    <Skeleton className="h-7 w-32" />
    {/* Streak card */}
    <SkeletonCard className="h-20" />
    {/* Heatmap */}
    <div className="bg-background-card rounded-xl p-4 space-y-2">
      <Skeleton className="h-5 w-40" />
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 60 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-4 rounded-sm" />
        ))}
      </div>
    </div>
    {/* PRs */}
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} className="h-16" />
      ))}
    </div>
  </div>
);

export const HistorySkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-7 w-48" />
    {/* Search bar */}
    <Skeleton className="h-10 w-full rounded-lg" />
    {/* Filter pills */}
    <div className="flex gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
    {/* Session cards */}
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonCard key={i} className="h-28" />
    ))}
  </div>
);
