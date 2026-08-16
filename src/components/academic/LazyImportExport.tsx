import { lazy, Suspense } from 'react';
import { SkeletonCard } from '@/components/ui/skeleton';

// Lazy load the ImportExport component
const ImportExport = lazy(() => import('./ImportExport').then(module => ({ default: module.ImportExport })));

export function LazyImportExport() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <ImportExport />
    </Suspense>
  );
}
