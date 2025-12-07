import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

const HeroSection: React.FC = () => {
  const { prefersReducedMotion } = useTheme();
  const { isAuthenticated } = useAuth();
  const spaceshipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (spaceshipRef.current) {
        // Move spaceship slightly based on scroll
        spaceshipRef.current.style.transform = `translateY(${scrollTop * 0.1}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prefersReducedMotion]);
  
  return (
    <div className="relative overflow-hidden py-20 md:py-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Planet background */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
        <div className="absolute right-0 top-1/3 transform translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-700 via-purple-700 to-transparent blur-xl"></div>
      </div>
      
      {/* Animated spaceship */}
      {!prefersReducedMotion && (
        <div 
          ref={spaceshipRef}
          className="absolute bottom-1/4 left-1/3 transform -translate-x-1/2 pointer-events-none animate-float"
        >
          <div className="w-16 h-16 md:w-24 md:h-24 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-10 md:w-8 md:h-12 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-full"></div>
            <div className="absolute top-6 md:top-8 left-1/2 transform -translate-x-1/2 w-12 h-6 md:w-16 md:h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-t-lg"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-4 md:w-24 md:h-6 bg-gradient-to-b from-slate-400 to-slate-500 rounded-b-lg"></div>
            <div className="absolute bottom-1 left-1/4 w-1 h-3 bg-yellow-500 animate-pulse"></div>
            <div className="absolute bottom-1 right-1/4 w-1 h-3 bg-yellow-500 animate-pulse"></div>
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-slate-600 rounded-full"></div>
          </div>
        </div>
      )}
      
      <div className="text-center max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Your Health, Connected
          </span>
          <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Across the Universe
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Experience the future of healthcare with MediConnect 360 — where cutting-edge technology meets compassionate care in a seamless, secure environment.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
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
        
        {/* Floating badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="glass-panel px-4 py-2 flex items-center space-x-2 animate-float" style={{animationDelay: '0.5s'}}>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium">HIPAA Compliant</span>
          </div>
          <div className="glass-panel px-4 py-2 flex items-center space-x-2 animate-float" style={{animationDelay: '1s'}}>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium">End-to-End Encrypted</span>
          </div>
          <div className="glass-panel px-4 py-2 flex items-center space-x-2 animate-float" style={{animationDelay: '1.5s'}}>
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm font-medium">AI-Powered Insights</span>
          </div>
        </div>
      </div>
      
      {/* Subtle divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
    </div>
  );
};

export default HeroSection;