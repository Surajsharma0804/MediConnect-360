import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Star,
  MapPin,
  Shield,
  CheckCircle2,
  XCircle,
  Award,
  Stethoscope,
  Video,
  Building,
  Clock,
  ArrowLeft,
  Loader2,
  Trophy,
  Heart,
  Globe,
} from 'lucide-react';
import { useApiQuery } from '../hooks/useApiQuery';
import { providersAPI, type Provider } from '../services/providers.api';

// ─── Score Computation ────────────────────────────────────────────────────────

const computeScore = (provider: Provider): number => {
  let score = 50;
  if (provider.rating >= 4.5) score += 20;
  else if (provider.rating >= 4) score += 15;
  else if (provider.rating >= 3.5) score += 10;
  if (provider.isVerified) score += 10;
  if (provider.totalReviews > 100) score += 10;
  else if (provider.totalReviews > 50) score += 5;
  if (provider.offersVideoConsultation) score += 5;
  if (provider.specializations?.length > 3) score += 5;
  return Math.min(score, 100);
};

// ─── Score Bar ────────────────────────────────────────────────────────────────

const ScoreBar: React.FC<{ score: number; label: string; maxScore?: number }> = ({ score, label, maxScore = 100 }) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const getColor = (p: number) => {
    if (p >= 80) return 'bg-emerald-500';
    if (p >= 60) return 'bg-blue-500';
    if (p >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getLabel = (p: number) => {
    if (p >= 80) return 'EXCELLENT';
    if (p >= 60) return 'VERY GOOD';
    if (p >= 40) return 'GOOD';
    return 'FAIR';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className={`text-xs font-bold ${
          percentage >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
          percentage >= 60 ? 'text-blue-600 dark:text-blue-400' :
          percentage >= 40 ? 'text-amber-600 dark:text-amber-400' :
          'text-red-600 dark:text-red-400'
        }`}>
          {getLabel(percentage)}
        </span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ─── Check/X Icon ─────────────────────────────────────────────────────────────

const BoolCheck: React.FC<{ value: boolean }> = ({ value }) =>
  value
    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    : <XCircle className="h-5 w-5 text-slate-300 dark:text-slate-600" />;

// ─── Main Component ───────────────────────────────────────────────────────────

const DoctorComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  // Fetch all providers being compared
  const queries = ids.map(id =>
    useApiQuery<Provider>(
      `compare-provider-${id}`,
      () => providersAPI.getById(id),
      { enabled: !!id }
    )
  );

  const isLoading = queries.some(q => q.isLoading);
  const providers = queries.map(q => q.data).filter(Boolean) as Provider[];
  const scores = useMemo(() => providers.map(computeScore), [providers]);

  // Determine winner
  const bestIndex = useMemo(() => {
    if (scores.length === 0) return -1;
    return scores.indexOf(Math.max(...scores));
  }, [scores]);

  if (ids.length < 2) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Select at least 2 providers to compare</h2>
          <Link to="/doctors" className="btn-primary text-sm">← Go to Directory</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Link to="/doctors" className="text-blue-200 hover:text-white text-sm flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Directory
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Provider Comparison
          </h1>
          <p className="text-blue-100 mt-1">
            Side-by-side comparison of {providers.length} healthcare providers
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Headers */}
        <div className={`grid gap-4 mb-8 ${providers.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {providers.map((provider, index) => (
            <div key={provider.id} className={`bg-white dark:bg-slate-800 border rounded-xl p-5 text-center relative ${
              index === bestIndex 
                ? 'border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-800' 
                : 'border-slate-200 dark:border-slate-700'
            }`}>
              {/* Best Overall Badge */}
              {index === bestIndex && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                    <Trophy className="h-3 w-3" /> BEST OVERALL
                  </span>
                </div>
              )}

              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                {provider.profileImage ? (
                  <img src={provider.profileImage} alt={provider.firstName} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <Stethoscope className="h-8 w-8 text-white" />
                )}
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                {provider.title || 'Dr.'} {provider.firstName} {provider.lastName}
              </h3>
              
              {provider.city && (
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" /> {provider.city}
                </p>
              )}

              {/* Score */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-blue-700 dark:text-blue-300 text-lg">{scores[index]}</span>
                <span className="text-xs text-blue-500 dark:text-blue-400">/100</span>
              </div>

              {/* Reason badge for best */}
              {index === bestIndex && (
                <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    {provider.rating >= 4.5 ? 'Highest rated provider' :
                     provider.totalReviews > 100 ? 'Most reviewed provider' :
                     provider.yearsOfExperience > 15 ? 'Most experienced provider' :
                     'Best overall score'}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <Link
                  to={`/doctors/${provider.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          {/* ─── MediConnect Score ─────────────────────────────────────── */}
          <CompareRow label="MediConnect Score" icon={<Shield className="h-4 w-4" />} highlight>
            {providers.map((_, index) => (
              <div key={index}>
                <ScoreBar score={scores[index]} label="" />
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 block">{scores[index]}/100</span>
              </div>
            ))}
          </CompareRow>

          {/* ─── Rating ───────────────────────────────────────────────── */}
          <CompareRow label="Patient Rating" icon={<Star className="h-4 w-4" />}>
            {providers.map((p, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(p.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                  ))}
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{p.rating?.toFixed(1) || '—'}</span>
                <span className="text-xs text-slate-500">({p.totalReviews})</span>
              </div>
            ))}
          </CompareRow>

          {/* ─── Experience ───────────────────────────────────────────── */}
          <CompareRow label="Years of Experience" icon={<Award className="h-4 w-4" />}>
            {providers.map((p, index) => (
              <span key={index} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {p.yearsOfExperience || '—'} years
              </span>
            ))}
          </CompareRow>

          {/* ─── Specializations ──────────────────────────────────────── */}
          <CompareRow label="Specializations" icon={<Stethoscope className="h-4 w-4" />}>
            {providers.map((p, index) => (
              <div key={index} className="flex flex-wrap gap-1">
                {p.specializations?.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            ))}
          </CompareRow>

          {/* ─── Consultation Fee ─────────────────────────────────────── */}
          <CompareRow label="Consultation Fee" icon={<Clock className="h-4 w-4" />}>
            {providers.map((p, index) => (
              <span key={index} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {p.consultationFee ? `₹${p.consultationFee.toLocaleString()}` : '—'}
              </span>
            ))}
          </CompareRow>

          {/* ─── Verified ─────────────────────────────────────────────── */}
          <CompareRow label="Verified Provider" icon={<CheckCircle2 className="h-4 w-4" />}>
            {providers.map((p, index) => (
              <BoolCheck key={index} value={p.isVerified} />
            ))}
          </CompareRow>

          {/* ─── Video Consult ────────────────────────────────────────── */}
          <CompareRow label="Video Consultation" icon={<Video className="h-4 w-4" />}>
            {providers.map((p, index) => (
              <BoolCheck key={index} value={p.offersVideoConsultation} />
            ))}
          </CompareRow>

          {/* ─── In-Person ────────────────────────────────────────────── */}
          <CompareRow label="In-Person Visit" icon={<Building className="h-4 w-4" />}>
            {providers.map((p, index) => (
              <BoolCheck key={index} value={p.offersInPersonConsultation} />
            ))}
          </CompareRow>

          {/* ─── Accepting New Patients ───────────────────────────────── */}
          <CompareRow label="Accepting New Patients" icon={<Heart className="h-4 w-4" />}>
            {providers.map((p, index) => (
              <BoolCheck key={index} value={p.acceptsNewPatients} />
            ))}
          </CompareRow>

          {/* ─── Languages ────────────────────────────────────────────── */}
          <CompareRow label="Languages" icon={<Globe className="h-4 w-4" />}>
            {providers.map((p, index) => (
              <span key={index} className="text-sm text-slate-700 dark:text-slate-300">
                {p.languages?.join(', ') || '—'}
              </span>
            ))}
          </CompareRow>

          {/* ─── Total Consultations ──────────────────────────────────── */}
          <CompareRow label="Total Consultations" icon={<Stethoscope className="h-4 w-4" />}>
            {providers.map((p, index) => (
              <span key={index} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {p.totalConsultations?.toLocaleString() || '0'}
              </span>
            ))}
          </CompareRow>
        </div>

        {/* Verdict Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Our Verdict</h2>
          <div className={`grid gap-4 ${providers.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {providers.map((provider, index) => (
              <div key={provider.id} className={`bg-white dark:bg-slate-800 border rounded-xl p-5 ${
                index === bestIndex ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-700'
              }`}>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Choose {provider.title || 'Dr.'} {provider.lastName} if you want:
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {provider.rating >= 4.5 && <li>✓ Top-rated patient experience</li>}
                  {provider.yearsOfExperience > 15 && <li>✓ Extensive clinical experience</li>}
                  {provider.offersVideoConsultation && <li>✓ Convenient video consultations</li>}
                  {provider.acceptsNewPatients && <li>✓ Open to new patients</li>}
                  {provider.consultationFee && provider.consultationFee < 1000 && <li>✓ Affordable consultation fees</li>}
                  {provider.specializations?.length > 3 && <li>✓ Wide range of specializations</li>}
                  {provider.totalConsultations > 500 && <li>✓ Highly experienced with many consults</li>}
                  {provider.languages && provider.languages.length > 2 && <li>✓ Multilingual communication</li>}
                </ul>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/doctors/${provider.id}`}
                    className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/virtual-consult?providerId=${provider.id}`}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Book Consult
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Comparison Row Component ─────────────────────────────────────────────────

const CompareRow: React.FC<{
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
  children: React.ReactNode;
}> = ({ label, icon, highlight, children }) => {
  const childArray = React.Children.toArray(children);

  return (
    <div className={`border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
      highlight ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
    }`}>
      <div className={`grid ${childArray.length === 2 ? 'grid-cols-[200px_1fr_1fr]' : 'grid-cols-[200px_1fr_1fr_1fr]'} items-center`}>
        {/* Label */}
        <div className="px-5 py-4 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <span className="text-slate-400 dark:text-slate-500">{icon}</span>
          {label}
        </div>

        {/* Values */}
        {childArray.map((child, i) => (
          <div key={i} className="px-5 py-4 border-l border-slate-100 dark:border-slate-700">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorComparePage;
