import { lazy, Suspense } from 'react';
import { SkeletonCard } from '@/components/ui/skeleton';

// Lazy load the PerformanceTrends component
const PerformanceTrends = lazy(() => import('./PerformanceTrends').then(module => ({ default: module.PerformanceTrends })));

export function LazyPerformanceTrends() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <PerformanceTrends />
    </Suspense>
  );
}
