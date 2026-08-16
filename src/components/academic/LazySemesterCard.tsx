import { lazy, Suspense } from 'react';
import { SkeletonSemesterCard } from '@/components/ui/skeleton';

// Lazy load the SemesterCard component
const SemesterCard = lazy(() => import('./SemesterCard').then(module => ({ default: module.SemesterCard })));

interface LazySemesterCardProps {
  semester: any;
}

export function LazySemesterCard({ semester }: LazySemesterCardProps) {
  return (
    <Suspense fallback={<SkeletonSemesterCard />}>
      <SemesterCard semester={semester} />
    </Suspense>
  );
}
