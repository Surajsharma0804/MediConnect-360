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
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
        }}
      />
      
      {/* Subtle medical cross pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 50px, #2563eb 50px, #2563eb 51px),
            repeating-linear-gradient(90deg, transparent, transparent 50px, #2563eb 50px, #2563eb 51px)
          `
        }}
      />
      
      {/* Subtle accent shapes for visual interest */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-100 rounded-full opacity-20 blur-3xl" />
    </div>
  );
};

export default StarfieldBackground;