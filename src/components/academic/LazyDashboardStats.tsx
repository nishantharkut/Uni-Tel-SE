import { lazy, Suspense } from 'react';
import { SkeletonStats } from '@/components/ui/skeleton';

// Lazy load the DashboardStats component
const DashboardStats = lazy(() => import('./DashboardStats').then(module => ({ default: module.DashboardStats })));

export function LazyDashboardStats() {
  return (
    <Suspense fallback={<SkeletonStats />}>
      <DashboardStats />
    </Suspense>
  );
}
