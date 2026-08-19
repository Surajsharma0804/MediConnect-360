import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  Building2,
  Shield,
  Filter,
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  ArrowUpDown,
  CheckCircle2,
  Bed,
  Stethoscope,
  Heart,
  RefreshCw,
} from 'lucide-react';
import { useApiQuery } from '../hooks/useApiQuery';
import { providersAPI, type Provider, type ProviderSearchFilters } from '../services/providers.api';

// ─── MediConnect Score Badge ──────────────────────────────────────────────────

const MediConnectScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (s: number) => {
    if (s >= 85) return 'bg-emerald-500 text-white';
    if (s >= 70) return 'bg-blue-500 text-white';
    if (s >= 50) return 'bg-amber-500 text-white';
    return 'bg-slate-400 text-white';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Very Good';
    if (s >= 50) return 'Good';
    return 'Fair';
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getScoreColor(score)}`}>
      <Shield className="h-3 w-3" />
      {score}/100 · {getScoreLabel(score)}
    </div>
  );
};

// ─── Hospital Card ────────────────────────────────────────────────────────────

const HospitalCard: React.FC<{
  provider: Provider;
  isSelected: boolean;
  onToggleCompare: (id: string) => void;
}> = ({ provider, isSelected, onToggleCompare }) => {
  // Compute a MediConnect Score from available data
  const mediConnectScore = useMemo(() => {
    let score = 50; // base score
    if (provider.rating >= 4.5) score += 20;
    else if (provider.rating >= 4) score += 15;
    else if (provider.rating >= 3.5) score += 10;
    if (provider.isVerified) score += 10;
    if (provider.totalReviews > 100) score += 10;
    else if (provider.totalReviews > 50) score += 5;
    if (provider.offersVideoConsultation) score += 5;
    if (provider.specializations?.length > 3) score += 5;
    return Math.min(score, 100);
  }, [provider]);

  return (
    <div className={`bg-white dark:bg-slate-800 border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${
      isSelected ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-slate-200 dark:border-slate-700'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            {provider.profileImage ? (
              <img src={provider.profileImage} alt={provider.firstName} className="w-full h-full rounded-lg object-cover" />
            ) : (
              <Building2 className="h-7 w-7 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {provider.title ? `${provider.title} ` : ''}{provider.firstName} {provider.lastName}
            </h3>
            {provider.city && (
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                {provider.city}{provider.state ? `, ${provider.state}` : ''}
              </p>
            )}
          </div>
        </div>
        <MediConnectScoreBadge score={mediConnectScore} />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          <span className="ml-1 font-medium text-slate-900 dark:text-slate-100">{provider.rating?.toFixed(1) || '—'}</span>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {provider.totalReviews > 0 ? `${provider.totalReviews.toLocaleString()} reviews` : 'No reviews yet'}
        </span>
        {provider.isVerified && (
          <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Verified
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {provider.specializations?.slice(0, 3).map((spec, i) => (
          <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
            {spec}
          </span>
        ))}
        {provider.offersVideoConsultation && (
          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full font-medium">
            Video Consult
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
        {provider.yearsOfExperience > 0 && (
          <span className="flex items-center gap-1">
            <Stethoscope className="h-3.5 w-3.5" />
            {provider.yearsOfExperience}y exp
          </span>
        )}
        {provider.consultationFee && (
          <span className="flex items-center gap-1">
            ₹{provider.consultationFee?.toLocaleString()}
          </span>
        )}
        {provider.totalConsultations > 0 && (
          <span className="flex items-center gap-1">
            {provider.totalConsultations.toLocaleString()} consults
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleCompare(provider.id)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">Compare</span>
        </label>

        <Link
          to={`/doctors/${provider.id}`}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
        >
          View Profile <ChevronRight className="h-4 w-4 ml-0.5" />
        </Link>
      </div>
    </div>
  );
};

// ─── Comparison Drawer ────────────────────────────────────────────────────────

const ComparisonDrawer: React.FC<{
  selectedIds: string[];
  providers: Provider[];
  onRemove: (id: string) => void;
  onClear: () => void;
}> = ({ selectedIds, providers, onRemove, onClear }) => {
  if (selectedIds.length === 0) return null;

  const selected = providers.filter(p => selectedIds.includes(p.id));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-2xl px-4 py-3 animate-slide-up">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Compare ({selectedIds.length}/3):
          </span>
          {selected.map(p => (
            <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full whitespace-nowrap">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {p.firstName} {p.lastName}
              </span>
              <button onClick={() => onRemove(p.id)} className="text-blue-400 hover:text-blue-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Clear All
          </button>
          <Link
            to={`/doctors/compare?ids=${selectedIds.join(',')}`}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedIds.length >= 2
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const DoctorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('rating');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch providers
  const { data: providers, isLoading, error, refetch } = useApiQuery<Provider[]>(
    `providers-${selectedSpecialization}-${selectedCity}`,
    () => providersAPI.search({
      specialization: selectedSpecialization || undefined,
      limit: 50,
      offset: 0,
    }),
    { deps: [selectedSpecialization, selectedCity] }
  );

  // Fetch specializations for filter
  const { data: specializations } = useApiQuery<string[]>(
    'specializations',
    () => providersAPI.getSpecializations(),
    { cacheDuration: 30 * 60 * 1000 }
  );

  // Filter and sort
  const filteredProviders = useMemo(() => {
    let result = providers || [];

    // Client-side search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.specializations?.some(s => s.toLowerCase().includes(q)) ||
        p.city?.toLowerCase().includes(q)
      );
    }

    // City filter
    if (selectedCity) {
      result = result.filter(p => p.city?.toLowerCase() === selectedCity.toLowerCase());
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'experience') return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
      if (sortBy === 'fee') return (a.consultationFee || 0) - (b.consultationFee || 0);
      return 0;
    });

    return result;
  }, [providers, searchQuery, selectedCity, sortBy]);

  // Unique cities for filter
  const cities = useMemo(() => {
    if (!providers) return [];
    const citySet = new Set(providers.map(p => p.city).filter(Boolean) as string[]);
    return Array.from(citySet).sort();
  }, [providers]);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, id];
    });
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Find & Compare Healthcare Providers
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl">
            Search from our network of verified doctors, specialists, and healthcare facilities.
            Compare profiles, ratings, and book appointments.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search doctors, specializations, or hospitals..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border-0 focus:ring-2 focus:ring-blue-300 shadow-lg text-base"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Specialization Filter */}
          <div className="relative">
            <select
              value={selectedSpecialization}
              onChange={e => setSelectedSpecialization(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Specializations</option>
              {(specializations || []).map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* City Filter */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'rating' | 'experience' | 'fee')}
              className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="rating">Sort: Top Rated</option>
              <option value="experience">Sort: Most Experienced</option>
              <option value="fee">Sort: Lowest Fee</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Active filters */}
          {(selectedSpecialization || selectedCity) && (
            <button
              onClick={() => { setSelectedSpecialization(''); setSelectedCity(''); }}
              className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}

          <div className="ml-auto text-sm text-slate-500 dark:text-slate-400">
            {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">Failed to load providers</p>
            <button onClick={() => refetch()} className="btn-primary text-sm">
              <RefreshCw className="h-4 w-4 mr-2 inline" /> Retry
            </button>
          </div>
        ) : filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map(provider => (
              <HospitalCard
                key={provider.id}
                provider={provider}
                isSelected={compareIds.includes(provider.id)}
                onToggleCompare={toggleCompare}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Stethoscope className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Providers Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : 'No providers match your current filters. Try adjusting your criteria.'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedSpecialization(''); setSelectedCity(''); }}
              className="btn-primary text-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Comparison Drawer */}
      <ComparisonDrawer
        selectedIds={compareIds}
        providers={filteredProviders}
        onRemove={(id) => setCompareIds(prev => prev.filter(i => i !== id))}
        onClear={() => setCompareIds([])}
      />
    </div>
  );
};

export default DoctorsPage;
