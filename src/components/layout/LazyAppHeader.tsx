import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the AppHeader component
const AppHeader = lazy(() => import('./AppHeader').then(module => ({ default: module.AppHeader })));

interface LazyAppHeaderProps {
  user: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  onSignOut: () => void;
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function LazyAppHeader({ user, onSignOut, onMobileMenuToggle, mobileMenuOpen }: LazyAppHeaderProps) {
  return (
    <Suspense fallback={
      <div className="h-16 w-full border-b border-border/30 bg-background/98 flex items-center justify-between px-4 lg:px-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    }>
      <AppHeader 
        user={user} 
        onSignOut={onSignOut} 
        onMobileMenuToggle={onMobileMenuToggle}
        mobileMenuOpen={mobileMenuOpen}
      />
    </Suspense>
  );
}
