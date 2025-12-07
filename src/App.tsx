import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import StarfieldBackground from './components/common/StarfieldBackground';
import Navbar from './components/common/Navbar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import VirtualConsultPage from './pages/VirtualConsultPage';
import DashboardPage from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastProvider from './components/common/ToastProvider';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider />
        <Router>
          <div className="app-container relative min-h-screen w-full overflow-hidden">
            <StarfieldBackground />
            <div className="relative z-10">
              {isAuthenticated && <Navbar />}
              <Routes>
                <Route path="/login" element={
                  isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
                } />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/" element={
                  isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />
                } />
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
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;