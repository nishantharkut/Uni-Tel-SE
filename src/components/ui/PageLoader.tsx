import { Loader2, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandedLoader } from './BrandedLoader';

interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  variant?: 'default' | 'minimal' | 'fullscreen';
  size?: 'sm' | 'md' | 'lg';
  useBranded?: boolean;
}

export function PageLoader({ 
  message = "Loading...", 
  subMessage,
  variant = 'default',
  size = 'md',
  useBranded = true
}: PageLoaderProps) {
  // Use branded loader for fullscreen by default
  if (useBranded && variant === 'fullscreen') {
    return <BrandedLoader message={message} subMessage={subMessage} variant="fullscreen" />;
  }
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinnerSize = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <Loader2 className={cn("animate-spin text-academic-primary", spinnerSize)} />
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </div>
    );
  }

  if (variant === 'fullscreen' && !useBranded) {
    return (
      <BrandedLoader message={message} subMessage={subMessage} variant="fullscreen" />
    );
  }

  // Default variant - use branded inline loader
  if (useBranded) {
    return <BrandedLoader message={message} subMessage={subMessage} variant="inline" />;
  }

  // Fallback to simple spinner if branded is disabled
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="relative mx-auto mb-6" style={{ width: sizeClasses[size], height: sizeClasses[size] }}>
            <div className={cn(
              "animate-spin rounded-full border-3 border-academic-primary/20 border-t-academic-primary absolute inset-0",
              spinnerSize
            )}></div>
            <div className={cn(
              "absolute inset-0 rounded-full border-3 border-transparent border-t-academic-primary/40 animate-spin [animation-direction:reverse] [animation-duration:1.5s]",
              spinnerSize
            )}></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">{message}</p>
            {subMessage && (
              <p className="text-sm text-muted-foreground">{subMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComponentLoader({ 
  message = "Loading component...",
  size = 'sm',
  useBranded = false
}: PageLoaderProps) {
  if (useBranded) {
    return <BrandedLoader message={message} variant="compact" />;
  }
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className={cn(
            "animate-spin text-academic-primary",
            size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12'
          )} />
        </div>
        <span className="text-sm text-muted-foreground animate-pulse">{message}</span>
      </div>
    </div>
  );
}
