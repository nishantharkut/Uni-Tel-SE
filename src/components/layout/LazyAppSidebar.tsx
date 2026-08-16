import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the AppSidebar component
const AppSidebar = lazy(() => import('./AppSidebar').then(module => ({ default: module.AppSidebar })));

interface LazyAppSidebarProps {
  onToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function LazyAppSidebar({ onToggle, mobileMenuOpen }: LazyAppSidebarProps) {
  return (
    <Suspense fallback={
      <div className="h-full w-full p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    }>
      <AppSidebar onToggle={onToggle} mobileMenuOpen={mobileMenuOpen} />
    </Suspense>
  );
}
