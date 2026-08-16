
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PageLoader } from '@/components/ui/PageLoader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthRedirectWrapper from '@/components/AuthRedirectWrapper';

// Lazy load all pages
const Landing = lazy(() => import('@/pages/Landing'));
const AuthPage = lazy(() => import('@/components/auth/AuthPage'));
const Index = lazy(() => import('@/pages/Index'));
const Semesters = lazy(() => import('@/pages/Semesters'));
const Attendance = lazy(() => import('@/pages/Attendance'));
const Marks = lazy(() => import('@/pages/Marks'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Settings = lazy(() => import('@/pages/Settings'));
const ComingSoon = lazy(() => import('@/pages/ComingSoon'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={
                <AuthRedirectWrapper>
                  <AuthPage />
                </AuthRedirectWrapper>
              } />
              
              {/* Protected Routes - Main Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Index />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/semesters" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Semesters />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/attendance" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Attendance />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/marks" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Marks />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Analytics />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <Settings />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/coming-soon" element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<PageLoader />}>
                      <ComingSoon />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
