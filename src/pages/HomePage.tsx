import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Video, Brain, Stethoscope, BarChart, Heart, Shield, Users,
  Loader2, FileText, TestTube, MessageCircle, AlertTriangle,
} from 'lucide-react';
import FeatureCard from '../components/home/FeatureCard';
import HeroSection from '../components/home/HeroSection';
import { useAuth } from '../hooks/useAuth';
import { useApiQuery } from '../hooks/useApiQuery';
import api from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformStats {
  totalProviders: number;
  totalPatients: number;
  satisfactionRate: number;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

const AnimatedStat: React.FC<{ 
  value: string; 
  label: string; 
  color: string;
  isLoading: boolean;
}> = ({ value, label, color, isLoading }) => (
  <div className="text-center">
    <div className={`text-3xl font-bold ${color}`}>
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
        </span>
      ) : value}
    </div>
    <p className="mt-2 text-slate-600 dark:text-slate-400">{label}</p>
  </div>
);

// ─── Format Number ────────────────────────────────────────────────────────────

const formatCount = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K+`;
  return `${num}+`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Fetch platform stats from API
  const { data: stats, isLoading: statsLoading } = useApiQuery<PlatformStats>(
    'platform-stats',
    async () => {
      try {
        // Try the analytics endpoint first
        return await api.get<PlatformStats>('/analytics/platform-stats', { skipAuth: true, timeout: 5000 });
      } catch {
        // Fallback: try to get counts from health check or root endpoint
        try {
          const healthData = await api.get<any>('/health', { skipAuth: true, timeout: 5000 });
          return {
            totalProviders: healthData?.stats?.providers || 0,
            totalPatients: healthData?.stats?.patients || 0,
            satisfactionRate: healthData?.stats?.satisfaction || 0,
          };
        } catch {
          // Return zeros — UI will handle gracefully
          return { totalProviders: 0, totalPatients: 0, satisfactionRate: 0 };
        }
      }
    },
    { cacheDuration: 10 * 60 * 1000 } // Cache 10 min
  );

  const features = [
    {
      title: "AI Symptom Checker",
      description: "Describe your symptoms and get AI-powered preliminary analysis with triage recommendations.",
      icon: <Brain className="h-6 w-6 text-indigo-600" />,
      link: "/symptom-checker",
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Virtual Consultations",
      description: "Connect with doctors through secure, high-quality video appointments from anywhere.",
      icon: <Video className="h-6 w-6 text-blue-600" />,
      link: "/virtual-consult",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Find & Compare Doctors",
      description: "Search verified specialists, compare MediConnect Scores, and book appointments instantly.",
      icon: <Stethoscope className="h-6 w-6 text-cyan-600" />,
      link: "/doctors",
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "Medical Records",
      description: "Upload, organize, and securely store all your medical documents with AI-powered analysis.",
      icon: <FileText className="h-6 w-6 text-emerald-600" />,
      link: "/medical-records",
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Lab Results",
      description: "Track lab orders, view results with reference range indicators, and download reports.",
      icon: <TestTube className="h-6 w-6 text-teal-600" />,
      link: "/lab-results",
      color: "from-teal-500 to-emerald-500"
    },
    {
      title: "Secure Messaging",
      description: "Message your healthcare providers with read receipts, file sharing, and quick responses.",
      icon: <MessageCircle className="h-6 w-6 text-blue-600" />,
      link: "/messages",
      color: "from-blue-500 to-sky-500"
    },
    {
      title: "Insurance Management",
      description: "Store insurance cards, file claims, and track approvals — all in one place.",
      icon: <Shield className="h-6 w-6 text-purple-600" />,
      link: "/insurance",
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "Family Health",
      description: "Manage health records for your entire family — parents, children, and dependents.",
      icon: <Users className="h-6 w-6 text-pink-600" />,
      link: "/family",
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Emergency SOS",
      description: "One-touch emergency alert with GPS location sharing, Medical ID, and emergency contacts.",
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      link: "/emergency",
      color: "from-red-500 to-orange-500"
    },
  ];

  // Derive display values from API data
  const providerCount = stats?.totalProviders ? formatCount(stats.totalProviders) : '—';
  const patientCount = stats?.totalPatients ? formatCount(stats.totalPatients) : '—';
  const satisfactionRate = stats?.satisfactionRate ? `${stats.satisfactionRate}%` : '—';

  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Emergency SOS Button */}
      <div className="relative">
        <div className="absolute top-0 right-4 md:right-8 -mt-6 md:-mt-8 z-20">
          <Link 
            to="/emergency"
            className="flex items-center justify-center px-4 py-2 md:px-6 md:py-3 rounded-full bg-red-600 text-white font-bold shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <Heart className="h-5 w-5 mr-2" fill="white" />
            Emergency SOS
          </Link>
        </div>
      </div>
      
      {/* Stats Section — Data from API */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 glass-panel mt-4 mx-4 sm:mx-8 lg:mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatedStat
            value={providerCount}
            label="Active Healthcare Providers"
            color="text-blue-600 dark:text-blue-400"
            isLoading={statsLoading}
          />
          <AnimatedStat
            value={patientCount}
            label="Patients Served"
            color="text-emerald-600 dark:text-emerald-400"
            isLoading={statsLoading}
          />
          <AnimatedStat
            value={satisfactionRate}
            label="Patient Satisfaction"
            color="text-indigo-600 dark:text-indigo-400"
            isLoading={statsLoading}
          />
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Comprehensive Healthcare Services
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover how MediConnect 360 is revolutionizing healthcare with technology and compassionate care.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              link={feature.link}
              color={feature.color}
              requiresAuth={isAuthenticated ? false : true}
            />
          ))}
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 glass-panel mx-4 sm:mx-8 lg:mx-auto max-w-7xl my-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Join thousands of patients and providers who are already experiencing modern healthcare with MediConnect 360.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="btn-primary text-lg px-8 py-3"
              >
                Get Started
              </Link>
            )}
            <Link
              to="/doctors"
              className="btn-secondary text-lg px-8 py-3"
            >
              Find a Doctor
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                <Activity size={24} />
                MediConnect 360
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Modern healthcare through innovative technology and compassionate care.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Services</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/symptom-checker" className="hover:text-blue-600 dark:hover:text-blue-400">AI Symptom Checker</Link></li>
                <li><Link to="/virtual-consult" className="hover:text-blue-600 dark:hover:text-blue-400">Virtual Consultations</Link></li>
                <li><Link to="/doctors" className="hover:text-blue-600 dark:hover:text-blue-400">Find Doctors</Link></li>
                <li><Link to="/emergency" className="hover:text-blue-600 dark:hover:text-blue-400">Emergency SOS</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Platform</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Health Dashboard</Link></li>
                <li><Link to="/medical-records" className="hover:text-blue-600 dark:hover:text-blue-400">Medical Records</Link></li>
                <li><Link to="/lab-results" className="hover:text-blue-600 dark:hover:text-blue-400">Lab Results</Link></li>
                <li><Link to="/insurance" className="hover:text-blue-600 dark:hover:text-blue-400">Insurance</Link></li>
                <li><Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Account</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link to="/messages" className="hover:text-blue-600 dark:hover:text-blue-400">Messages</Link></li>
                <li><Link to="/family" className="hover:text-blue-600 dark:hover:text-blue-400">Family Health</Link></li>
                <li><Link to="/settings" className="hover:text-blue-600 dark:hover:text-blue-400">Settings</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} MediConnect 360. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
