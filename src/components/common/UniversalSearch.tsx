import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Stethoscope,
  FileText,
  Calendar,
  Pill,
  MessageCircle,
  Activity,
  Video,
  TestTube,
  Shield,
  Users,
  AlertTriangle,
  LayoutDashboard,
  Settings,
  ArrowRight,
  Clock,
  Command,
} from 'lucide-react';

// ─── Search Item Types ────────────────────────────────────────────────────────

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  route: string;
  category: string;
}

// ─── Static Navigation Items ──────────────────────────────────────────────────

const navItems: SearchItem[] = [
  { id: 'nav-dashboard', title: 'Dashboard', subtitle: 'Health overview & metrics', icon: <LayoutDashboard className="h-4 w-4" />, route: '/dashboard', category: 'Navigation' },
  { id: 'nav-doctors', title: 'Find Doctors', subtitle: 'Search & compare doctors', icon: <Stethoscope className="h-4 w-4" />, route: '/doctors', category: 'Navigation' },
  { id: 'nav-appointments', title: 'Appointments', subtitle: 'Manage your bookings', icon: <Calendar className="h-4 w-4" />, route: '/appointments', category: 'Navigation' },
  { id: 'nav-messages', title: 'Messages', subtitle: 'Chat with providers', icon: <MessageCircle className="h-4 w-4" />, route: '/messages', category: 'Navigation' },
  { id: 'nav-records', title: 'Medical Records', subtitle: 'Upload & manage documents', icon: <FileText className="h-4 w-4" />, route: '/medical-records', category: 'Navigation' },
  { id: 'nav-lab', title: 'Lab Results', subtitle: 'View test results', icon: <TestTube className="h-4 w-4" />, route: '/lab-results', category: 'Navigation' },
  { id: 'nav-pharmacy', title: 'Pharmacy & Medications', subtitle: 'Prescriptions & refills', icon: <Pill className="h-4 w-4" />, route: '/pharmacy', category: 'Navigation' },
  { id: 'nav-insurance', title: 'Insurance', subtitle: 'Cards & claims', icon: <Shield className="h-4 w-4" />, route: '/insurance', category: 'Navigation' },
  { id: 'nav-family', title: 'Family Health', subtitle: 'Manage family members', icon: <Users className="h-4 w-4" />, route: '/family', category: 'Navigation' },
  { id: 'nav-symptom', title: 'Symptom Checker', subtitle: 'AI-powered analysis', icon: <Activity className="h-4 w-4" />, route: '/symptom-checker', category: 'Tools' },
  { id: 'nav-consult', title: 'Virtual Consultation', subtitle: 'Video call with doctor', icon: <Video className="h-4 w-4" />, route: '/virtual-consult', category: 'Tools' },
  { id: 'nav-emergency', title: 'Emergency SOS', subtitle: 'One-tap emergency alert', icon: <AlertTriangle className="h-4 w-4" />, route: '/emergency', category: 'Tools' },
  { id: 'nav-settings', title: 'Settings', subtitle: 'Account & preferences', icon: <Settings className="h-4 w-4" />, route: '/settings', category: 'Account' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const UniversalSearch: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mc360_recent_searches') || '[]');
    } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Filter results
  const results = query.trim()
    ? navItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : navItems.slice(0, 6); // Show top items when no query

  // Group by category
  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      selectItem(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIndex]);

  const selectItem = (item: SearchItem) => {
    // Save to recent
    const updated = [item.title, ...recentSearches.filter(s => s !== item.title)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('mc360_recent_searches', JSON.stringify(updated));
    
    navigate(item.route);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-slate-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, features, tools..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 border-0 focus:outline-none focus:ring-0"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-0.5 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="px-3 pb-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-2 py-1">Recent</p>
              {recentSearches.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
                >
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {term}
                </button>
              ))}
              <hr className="border-slate-100 dark:border-slate-700 mt-2" />
            </div>
          )}

          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="px-3 pb-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-2 py-1">{category}</p>
              {items.map((item, idx) => {
                const flatIdx = results.indexOf(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => selectItem(item)}
                    onMouseEnter={() => setSelectedIndex(flatIdx)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors ${
                      flatIdx === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${flatIdx === selectedIndex ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">{item.subtitle}</span>
                      )}
                    </div>
                    {flatIdx === selectedIndex && (
                      <ArrowRight className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {query && results.length === 0 && (
            <div className="py-8 text-center">
              <Search className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No results for "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">↵</kbd> select</span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="h-3 w-3" />K to search
          </span>
        </div>
      </div>
    </div>
  );
};

export default UniversalSearch;
