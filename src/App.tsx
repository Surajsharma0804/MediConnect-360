import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import StarfieldBackground from './components/common/StarfieldBackground';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastProvider from './components/common/ToastProvider';
import SkeletonLoader from './components/common/SkeletonLoader';
import { useAuth } from './hooks/useAuth';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SymptomCheckerPage = lazy(() => import('./pages/SymptomCheckerPage'));
const VirtualConsultPage = lazy(() => import('./pages/VirtualConsultPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <SkeletonLoader className="w-32 h-32" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider />
        <Router>
          <div className="app-container relative min-h-screen w-full overflow-hidden">
            <StarfieldBackground />
            <div className="relative z-10">
              {isAuthenticated && <Navbar />}
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <SkeletonLoader className="w-64 h-32" />
                </div>
              }>
                <Routes>
                  <Route 
                    path="/login" 
                    element={
                      isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
                    } 
                  />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route 
                    path="/" 
                    element={
                      isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />
                    } 
                  />
                  <Route 
                    path="/symptom-checker" 
                    element={
                      <ProtectedRoute>
                        <SymptomCheckerPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/virtual-consult" 
                    element={
                      <ProtectedRoute>
                        <VirtualConsultPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/pricing" 
                    element={
                      <ProtectedRoute>
                        <PricingPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;