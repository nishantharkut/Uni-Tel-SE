import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the QuickActions component
const QuickActions = lazy(() => import('./QuickActions').then(module => ({ default: module.QuickActions })));

export function LazyQuickActions() {
  return (
    <Suspense fallback={
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    }>
      <QuickActions />
    </Suspense>
  );
}
