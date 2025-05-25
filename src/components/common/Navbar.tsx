import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, Activity, Video, UserCircle, Settings, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/symptom-checker', label: 'Symptom Checker', icon: <Activity size={18} /> },
    { path: '/virtual-consult', label: 'Virtual Consult', icon: <Video size={18} /> },
    { path: '/dashboard', label: 'Dashboard', icon: <UserCircle size={18} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel bg-opacity-80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <Activity size={20} className="text-white" />
              </div>
              MediConnect 360
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1
                    ${location.pathname === link.path 
                      ? 'bg-indigo-800/30 text-white' 
                      : 'text-slate-300 hover:bg-indigo-700/20 hover:text-white'
                    }`}
                  onClick={closeMenu}
                >
                  {link.icon && <span>{link.icon}</span>}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <button
              className="p-2 rounded-full text-slate-300 hover:text-white focus:outline-none"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {isAuthenticated ? (
              <div className="relative group">
                <button
                  className="flex items-center px-3 py-2 rounded-full bg-indigo-700/20 hover:bg-indigo-700/40 transition-colors"
                >
                  <span className="text-sm font-medium mr-2">Dr. Smith</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-medium">DS</span>
                  </div>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 glass-panel hidden group-hover:block origin-top-right">
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm hover:bg-indigo-700/20 transition-colors"
                    >
                      <UserCircle size={16} className="mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm hover:bg-indigo-700/20 transition-colors"
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-indigo-700/20 transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-full text-slate-300 hover:text-white focus:outline-none"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={toggleMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-panel">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium flex items-center
                ${location.pathname === link.path 
                  ? 'bg-indigo-800/30 text-white' 
                  : 'text-slate-300 hover:bg-indigo-700/20 hover:text-white'
                }`}
              onClick={closeMenu}
            >
              {link.icon && <span className="mr-2">{link.icon}</span>}
              {link.label}
            </Link>
          ))}
          
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-indigo-700/20 hover:text-white flex items-center"
            >
              <LogOut size={18} className="mr-2" />
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-indigo-700/20 hover:text-white"
              onClick={closeMenu}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;