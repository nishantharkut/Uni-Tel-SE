import { lazy, Suspense } from 'react';
import { ComponentLoader } from '@/components/ui/PageLoader';

// Lazy load the heavy ActiveMarksCard component
const ActiveMarksCard = lazy(() => import('./ActiveMarksCard').then(module => ({ default: module.ActiveMarksCard })));

interface LazyActiveMarksCardProps {
  records: any[];
}

export function LazyActiveMarksCard({ records }: LazyActiveMarksCardProps) {
  return (
    <Suspense fallback={<ComponentLoader message="Loading marks records..." />}>
      <ActiveMarksCard records={records} />
    </Suspense>
  );
}
