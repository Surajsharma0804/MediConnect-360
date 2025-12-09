import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  requiresAuth?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  link, 
  color,
  requiresAuth = false
}) => {
  const { prefersReducedMotion } = useTheme();
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (requiresAuth) {
      navigate('/login', { state: { from: link } });
    }
  };
  
  return (
    <div 
      className={`card group ${prefersReducedMotion ? '' : 'hover:translate-y-[-5px]'} transition-all duration-300`}
      onClick={requiresAuth ? handleClick : undefined}
    >
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      
      <p className="text-slate-400 mb-4">
        {description}
      </p>
      
      {requiresAuth ? (
        <button 
          className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium"
        >
          <span>Sign in to access</span>
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      ) : (
        <Link 
          to={link}
          className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-medium"
        >
          <span>Explore</span>
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
};

export default FeatureCard;