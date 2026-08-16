import { lazy, Suspense } from 'react';
import { SkeletonAttendanceCard } from '@/components/ui/skeleton';

// Lazy load the heavy ActiveAttendanceCard component
const ActiveAttendanceCard = lazy(() => import('./ActiveAttendanceCard').then(module => ({ default: module.ActiveAttendanceCard })));

interface LazyActiveAttendanceCardProps {
  records: any[];
}

export function LazyActiveAttendanceCard({ records }: LazyActiveAttendanceCardProps) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <SkeletonAttendanceCard />
        <SkeletonAttendanceCard />
        <SkeletonAttendanceCard />
      </div>
    }>
      <ActiveAttendanceCard records={records} />
    </Suspense>
  );
}
