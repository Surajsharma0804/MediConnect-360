import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const StarfieldBackground: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      {/* Clean professional gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: theme === 'light' 
            ? 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        }}
      />
      
      {/* Subtle medical cross pattern */}
      <div 
        className="absolute inset-0"
        style={{
          opacity: theme === 'light' ? 0.02 : 0.05,
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 50px, ${theme === 'light' ? '#2563eb' : '#3b82f6'} 50px, ${theme === 'light' ? '#2563eb' : '#3b82f6'} 51px),
            repeating-linear-gradient(90deg, transparent, transparent 50px, ${theme === 'light' ? '#2563eb' : '#3b82f6'} 50px, ${theme === 'light' ? '#2563eb' : '#3b82f6'} 51px)
          `
        }}
      />
      
      {/* Subtle accent shapes for visual interest */}
      {theme === 'light' ? (
        <>
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-100 rounded-full opacity-20 blur-3xl" />
        </>
      ) : (
        <>
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-900 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-900 rounded-full opacity-10 blur-3xl" />
        </>
      )}
    </div>
  );
};

export default StarfieldBackground;