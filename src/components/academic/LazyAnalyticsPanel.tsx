import { lazy, Suspense } from 'react';
import { SkeletonCard, SkeletonStats } from '@/components/ui/skeleton';

// Lazy load the heavy AnalyticsPanel component
const AnalyticsPanel = lazy(() => import('./AnalyticsPanel').then(module => ({ default: module.AnalyticsPanel })));

export function LazyAnalyticsPanel() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    }>
      <AnalyticsPanel />
    </Suspense>
  );
}
