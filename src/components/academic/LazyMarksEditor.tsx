import { lazy, Suspense } from 'react';
import { SkeletonCard, SkeletonList } from '@/components/ui/skeleton';

// Lazy load the heavy MarksEditor component
const MarksEditor = lazy(() => import('./MarksEditor').then(module => ({ default: module.MarksEditor })));

interface LazyMarksEditorProps {
  semesterId?: string;
}

export function LazyMarksEditor({ semesterId }: LazyMarksEditorProps) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonList items={3} />
      </div>
    }>
      <MarksEditor semesterId={semesterId} />
    </Suspense>
  );
}
