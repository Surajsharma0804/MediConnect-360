import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import StarfieldBackground from './components/common/StarfieldBackground';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastProvider from './components/common/ToastProvider';
import { Skeleton } from './components/common/SkeletonLoader';
import UniversalSearch from './components/common/UniversalSearch';
import { useAuth } from './hooks/useAuth';
import { usePageTitle, useScrollToTop } from './hooks/usePageTitle';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SymptomCheckerPage = lazy(() => import('./pages/SymptomCheckerPage'));
const VirtualConsultPage = lazy(() => import('./pages/VirtualConsultPage'));
const CameraTestPage = lazy(() => import('./pages/CameraTestPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AuthSuccessPage = lazy(() => import('./pages/AuthSuccessPage'));
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'));
const DoctorProfilePage = lazy(() => import('./pages/DoctorProfilePage'));
const DoctorComparePage = lazy(() => import('./pages/DoctorComparePage'));
const EmergencyPage = lazy(() => import('./pages/EmergencyPage'));
const MedicalRecordsPage = lazy(() => import('./pages/MedicalRecordsPage'));
const LabResultsPage = lazy(() => import('./pages/LabResultsPage'));
const MessagingPage = lazy(() => import('./pages/MessagingPage'));
const InsurancePage = lazy(() => import('./pages/InsurancePage'));
const FamilyPage = lazy(() => import('./pages/FamilyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const PharmacyPage = lazy(() => import('./pages/PharmacyPage'));

// SEO & UX wrapper — runs inside Router
const PageMeta: React.FC = () => { usePageTitle(); useScrollToTop(); return null; };

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  // ⌘K / Ctrl+K keyboard shortcut for universal search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <p className="text-blue-300 text-sm font-medium">Loading MediConnect...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider />
        <Router>
          <PageMeta />
          <div className="app-container relative min-h-screen w-full overflow-hidden">
            <StarfieldBackground />
            <div className="relative z-10">
              {isAuthenticated && <Navbar />}
              {isAuthenticated && <UniversalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <Skeleton className="w-64 h-32" variant="rectangular" />
                </div>
              }>
                <Routes>
                  <Route 
                    path="/login" 
                    element={
                      isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
                    } 
                  />
                  <Route path="/auth/callback" element={<AuthSuccessPage />} />
                  <Route path="/auth/success" element={<AuthSuccessPage />} />
                  <Route 
                    path="/" 
                    element={
                      isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />
                    } 
                  />
                  {/* Public Discovery Pages (no auth required for SEO) */}
                  <Route path="/doctors" element={<DoctorsPage />} />
                  <Route path="/doctors/compare" element={<DoctorComparePage />} />
                  <Route path="/doctors/:id" element={<DoctorProfilePage />} />
                  <Route 
                    path="/emergency" 
                    element={
                      <ProtectedRoute>
                        <EmergencyPage />
                      </ProtectedRoute>
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
                    path="/camera-test" 
                    element={
                      <ProtectedRoute>
                        <CameraTestPage />
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
                    element={<PricingPage />} 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/medical-records" 
                    element={
                      <ProtectedRoute>
                        <MedicalRecordsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lab-results" 
                    element={
                      <ProtectedRoute>
                        <LabResultsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/messages" 
                    element={
                      <ProtectedRoute>
                        <MessagingPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/insurance" 
                    element={
                      <ProtectedRoute>
                        <InsurancePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/family" 
                    element={
                      <ProtectedRoute>
                        <FamilyPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/appointments" 
                    element={
                      <ProtectedRoute>
                        <AppointmentsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/pharmacy" 
                    element={
                      <ProtectedRoute>
                        <PharmacyPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={isAuthenticated ? <NotFoundPage /> : <Navigate to="/login" replace />} />
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