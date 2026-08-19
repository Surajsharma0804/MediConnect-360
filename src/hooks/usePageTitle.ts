import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const APP_NAME = 'MediConnect 360';

/**
 * Route-based page titles for SEO
 */
const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/login': 'Sign In',
  '/dashboard': 'Dashboard',
  '/doctors': 'Find Doctors',
  '/appointments': 'Appointments',
  '/messages': 'Messages',
  '/medical-records': 'Medical Records',
  '/lab-results': 'Lab Results',
  '/pharmacy': 'Pharmacy & Medications',
  '/insurance': 'Insurance',
  '/family': 'Family Health',
  '/symptom-checker': 'AI Symptom Checker',
  '/virtual-consult': 'Virtual Consultation',
  '/emergency': 'Emergency SOS',
  '/settings': 'Settings',
  '/pricing': 'Pricing',
};

/**
 * Hook to set page title based on current route.
 * Also handles dynamic titles for detail pages.
 */
export function usePageTitle(customTitle?: string) {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title: string;

    if (customTitle) {
      title = `${customTitle} | ${APP_NAME}`;
    } else if (pageTitles[path]) {
      title = `${pageTitles[path]} | ${APP_NAME}`;
    } else if (path.startsWith('/doctors/compare')) {
      title = `Compare Doctors | ${APP_NAME}`;
    } else if (path.startsWith('/doctors/')) {
      title = `Doctor Profile | ${APP_NAME}`;
    } else {
      title = APP_NAME;
    }

    document.title = title;

    // Also update meta description based on route
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const descriptions: Record<string, string> = {
        '/': 'MediConnect 360 — India\'s smartest healthcare platform. Compare doctors, manage records, book appointments.',
        '/doctors': 'Find and compare verified doctors across specialties with MediConnect Scores.',
        '/appointments': 'Manage your healthcare appointments — schedule, reschedule, or cancel.',
        '/emergency': 'Emergency SOS — one-tap alert with GPS location sharing and medical ID.',
      };
      metaDesc.setAttribute('content', descriptions[path] || `${pageTitles[path] || 'Healthcare'} — ${APP_NAME}`);
    }
  }, [location.pathname, customTitle]);
}

/**
 * Hook to scroll to top on route change
 */
export function useScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);
}
