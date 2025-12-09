import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Lock, Activity } from 'lucide-react';

const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="relative overflow-hidden py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
          Your Health, Connected
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
          Experience modern healthcare with MediConnect 360 — where technology meets compassionate care in a secure environment.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="btn-primary text-lg px-8 py-3"
              >
                Get Started
              </Link>
              <Link
                to="/how-it-works"
                className="btn-secondary text-lg px-8 py-3"
              >
                Learn More
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="btn-primary text-lg px-8 py-3"
              >
                My Dashboard
              </Link>
              <Link
                to="/virtual-consult"
                className="btn-secondary text-lg px-8 py-3"
              >
                Start Consultation
              </Link>
            </>
          )}
        </div>
        
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span className="font-medium">HIPAA Compliant</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <Lock className="h-5 w-5 text-blue-600" />
            <span className="font-medium">End-to-End Encrypted</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span className="font-medium">24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
