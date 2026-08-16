import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandedLoaderProps {
  message?: string;
  subMessage?: string;
  variant?: 'fullscreen' | 'inline' | 'compact';
  showLogo?: boolean;
}

export function BrandedLoader({ 
  message = "Loading UNI-TEL", 
  subMessage,
  variant = 'fullscreen',
  showLogo = true
}: BrandedLoaderProps) {
  const [logoError, setLogoError] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Check if logo exists
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLogoLoaded(true);
    img.onerror = () => setLogoError(true);
    img.src = '/logo.png';
  }, []);

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {showLogo && !logoError && logoLoaded ? (
              <img 
                src="/logo.png" 
                alt="UNI-TEL" 
                className="h-6 w-6 animate-pulse object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <GraduationCap className="h-6 w-6 text-academic-primary animate-pulse" />
            )}
          </div>
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-6">
          {/* Animated background glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-academic-primary/20 via-academic-secondary/20 to-academic-primary/20 animate-pulse blur-2xl scale-150"></div>
          
          {/* Logo container */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {showLogo && !logoError && logoLoaded ? (
              <>
                <img 
                  src="/logo.png" 
                  alt="UNI-TEL" 
                  className="h-20 w-20 object-contain animate-bounce [animation-duration:2s] drop-shadow-lg"
                  onError={() => setLogoError(true)}
                />
                {/* Rotating ring around logo */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-academic-primary/30 animate-spin [animation-duration:3s]"></div>
              </>
            ) : (
              <div className="relative">
                <GraduationCap className="h-16 w-16 text-academic-primary animate-bounce [animation-duration:2s]" />
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-academic-primary/30 animate-spin [animation-duration:3s]"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Brand name with gradient */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-academic-primary via-academic-secondary to-academic-primary bg-clip-text text-transparent animate-pulse">
            UNI-TEL
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">Academic Hub</p>
        </div>

        {/* Spinner rings */}
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-3 border-academic-primary/20 border-t-academic-primary animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-academic-secondary/40 animate-spin [animation-direction:reverse] [animation-duration:1.5s]"></div>
        </div>

        {/* Messages */}
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">{message}</p>
          {subMessage && (
            <p className="text-sm text-muted-foreground">{subMessage}</p>
          )}
        </div>

        {/* Animated icons */}
        <div className="flex items-center gap-4 mt-6">
          <BookOpen className="h-4 w-4 text-academic-primary animate-bounce [animation-delay:0s] [animation-duration:1.5s]" />
          <TrendingUp className="h-4 w-4 text-academic-secondary animate-bounce [animation-delay:0.3s] [animation-duration:1.5s]" />
          <GraduationCap className="h-4 w-4 text-academic-primary animate-bounce [animation-delay:0.6s] [animation-duration:1.5s]" />
        </div>
      </div>
    );
  }

  // Fullscreen variant (default)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-academic-primary/5 rounded-full blur-3xl animate-pulse [animation-duration:4s]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-academic-secondary/5 rounded-full blur-3xl animate-pulse [animation-duration:4s] [animation-delay:2s]"></div>
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-md px-4">
        {/* Main logo with animations */}
        <div className="relative mx-auto">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-academic-primary/30 via-academic-secondary/30 to-academic-primary/30 animate-pulse blur-2xl scale-150"></div>
          
          {/* Logo container */}
          <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
            {showLogo && !logoError && logoLoaded ? (
              <>
                <img 
                  src="/logo.png" 
                  alt="UNI-TEL" 
                  className="h-28 w-28 object-contain animate-bounce [animation-duration:2.5s] drop-shadow-2xl relative z-10"
                  onError={() => setLogoError(true)}
                />
                {/* Rotating decorative rings */}
                <div className="absolute inset-0 rounded-full border-3 border-dashed border-academic-primary/20 animate-spin [animation-duration:4s]"></div>
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-academic-secondary/30 animate-spin [animation-direction:reverse] [animation-duration:3s]"></div>
              </>
            ) : (
              <div className="relative">
                <GraduationCap className="h-28 w-28 text-academic-primary animate-bounce [animation-duration:2.5s] drop-shadow-2xl" />
                <div className="absolute inset-0 rounded-full border-3 border-dashed border-academic-primary/20 animate-spin [animation-duration:4s]"></div>
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-academic-secondary/30 animate-spin [animation-direction:reverse] [animation-duration:3s]"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Brand name with gradient animation */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-academic-primary via-academic-secondary to-academic-primary bg-clip-text text-transparent animate-pulse bg-[length:200%_auto] [animation-duration:3s]">
            UNI-TEL
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">Academic Hub</p>
        </div>

        {/* Dual spinner rings */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-academic-primary/20 border-t-academic-primary animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-academic-secondary/50 animate-spin [animation-direction:reverse] [animation-duration:1.5s]"></div>
          <div className="absolute inset-2 rounded-full border-2 border-academic-primary/10 border-t-academic-primary/30 animate-spin [animation-duration:2s]"></div>
        </div>

        {/* Messages */}
        <div className="space-y-3">
          <p className="text-lg sm:text-xl font-semibold text-foreground animate-pulse">{message}</p>
          {subMessage && (
            <p className="text-sm sm:text-base text-muted-foreground">{subMessage}</p>
          )}
        </div>

        {/* Animated icon row */}
        <div className="flex items-center justify-center gap-6 pt-4">
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="h-5 w-5 text-academic-primary animate-bounce [animation-delay:0s] [animation-duration:1.8s]" />
            <div className="h-1 w-1 rounded-full bg-academic-primary animate-pulse [animation-delay:0s]"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="h-5 w-5 text-academic-secondary animate-bounce [animation-delay:0.4s] [animation-duration:1.8s]" />
            <div className="h-1 w-1 rounded-full bg-academic-secondary animate-pulse [animation-delay:0.4s]"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <GraduationCap className="h-5 w-5 text-academic-primary animate-bounce [animation-delay:0.8s] [animation-duration:1.8s]" />
            <div className="h-1 w-1 rounded-full bg-academic-primary animate-pulse [animation-delay:0.8s]"></div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="h-2 w-2 rounded-full bg-academic-primary animate-bounce [animation-delay:0s] [animation-duration:1.2s]"></div>
          <div className="h-2 w-2 rounded-full bg-academic-secondary animate-bounce [animation-delay:0.2s] [animation-duration:1.2s]"></div>
          <div className="h-2 w-2 rounded-full bg-academic-primary animate-bounce [animation-delay:0.4s] [animation-duration:1.2s]"></div>
        </div>
      </div>
    </div>
  );
}




