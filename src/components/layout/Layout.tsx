
import { ReactNode, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LazyAppSidebar } from './LazyAppSidebar';
import { LazyAppHeader } from './LazyAppHeader';
import { PageLoader } from '@/components/ui/PageLoader';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Auto-collapse mobile sidebar when navigating
  useEffect(() => {
    // Check if we're on mobile (screen width < 1024px)
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      // Close mobile sidebar when navigating
      setMobileMenuOpen(false);
    }
  }, [location.pathname]); // Only depend on location.pathname

  if (loading) {
    return (
      <PageLoader 
        message="Loading UNI-TEL" 
        subMessage="Connecting to your academic hub..."
        variant="fullscreen"
        size="lg"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <LazyAppSidebar onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileMenuOpen={false} />
      </div>
      
      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <LazyAppSidebar onToggle={handleMobileMenuClose} mobileMenuOpen={mobileMenuOpen} />
      </div>
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        !sidebarCollapsed ? 'lg:ml-72' : 'lg:ml-24'
      } ml-0`}>
        <LazyAppHeader 
          user={{
            full_name: user.user_metadata?.full_name || user.email || '',
            email: user.email || '',
            avatar_url: user.user_metadata?.avatar_url
          }}
          onSignOut={handleSignOut}
          onMobileMenuToggle={handleMobileMenuToggle}
          mobileMenuOpen={mobileMenuOpen}
        />
        <main className="flex-1 overflow-auto bg-background/50">
          <div className="min-h-full p-3 sm:p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
