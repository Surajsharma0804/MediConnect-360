import React, { useState } from 'react';
import {
  Shield,
  CreditCard,
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Building2,
  ChevronRight,
  Loader2,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery';
import { insuranceAPI, type InsuranceCard, type InsuranceClaim } from '../services/insurance.api';

// ─── Status Badge ─────────────────────────────────────────────────────────────

const ClaimStatus: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    submitted: { color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: <Clock className="h-3 w-3" />, label: 'Submitted' },
    under_review: { color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Clock className="h-3 w-3" />, label: 'Under Review' },
    approved: { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Approved' },
    rejected: { color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3 w-3" />, label: 'Rejected' },
    paid: { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: <DollarSign className="h-3 w-3" />, label: 'Paid' },
  };

  const { color, icon, label } = config[status] || config.submitted;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {icon} {label}
    </span>
  );
};

// ─── Insurance Card Display ───────────────────────────────────────────────────

const InsuranceCardDisplay: React.FC<{ card: InsuranceCard }> = ({ card }) => {
  const [showDetails, setShowDetails] = useState(false);

  const maskNumber = (num: string) => {
    if (!num) return '—';
    if (showDetails) return num;
    return '••••' + num.slice(-4);
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-wider font-medium">Insurance Provider</p>
            <h3 className="text-xl font-bold mt-0.5">{card.providerName || card.insurerName}</h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(card.policyNumber)}
              className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-blue-200 text-xs uppercase tracking-wider">Policy Number</p>
          <p className="text-lg font-mono font-bold tracking-wider mt-0.5">{maskNumber(card.policyNumber)}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-wider">Member</p>
            <p className="font-medium text-sm mt-0.5">{card.memberName || '—'}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-wider">Group</p>
            <p className="font-medium text-sm mt-0.5">{card.groupNumber || '—'}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-wider">Valid Until</p>
            <p className="font-medium text-sm mt-0.5">
              {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        {/* Coverage Type */}
        {card.planType && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">{card.planType}</span>
            {card.isActive && (
              <span className="ml-2 px-3 py-1 bg-emerald-500/30 rounded-full text-xs font-medium">Active</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Claim Row ────────────────────────────────────────────────────────────────

const ClaimRow: React.FC<{ claim: InsuranceClaim }> = ({ claim }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4">
    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
      <FileText className="h-5 w-5 text-blue-500" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">{claim.description || claim.treatmentType}</h3>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(claim.submittedAt || claim.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        {claim.providerName && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {claim.providerName}
          </span>
        )}
      </div>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="font-semibold text-slate-900 dark:text-slate-100">
        ₹{(claim.claimAmount || 0).toLocaleString()}
      </p>
      {claim.approvedAmount !== undefined && claim.approvedAmount !== null && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          Approved: ₹{claim.approvedAmount.toLocaleString()}
        </p>
      )}
    </div>
    <ClaimStatus status={claim.status} />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const InsurancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cards' | 'claims'>('cards');

  const { data: cards, isLoading: cardsLoading, error: cardsError, refetch: refetchCards } = useApiQuery<InsuranceCard[]>(
    'insurance-cards',
    () => insuranceAPI.getCards()
  );

  const { data: claims, isLoading: claimsLoading, error: claimsError, refetch: refetchClaims } = useApiQuery<InsuranceClaim[]>(
    'insurance-claims',
    () => insuranceAPI.getClaims(),
    { enabled: activeTab === 'claims' }
  );

  // Stats
  const totalClaimed = claims?.reduce((sum, c) => sum + (c.claimAmount || 0), 0) || 0;
  const totalApproved = claims?.filter(c => c.status === 'approved' || c.status === 'paid')
    .reduce((sum, c) => sum + (c.approvedAmount || c.claimAmount || 0), 0) || 0;
  const pendingCount = claims?.filter(c => c.status === 'submitted' || c.status === 'under_review').length || 0;

  const tabs = [
    { id: 'cards' as const, label: 'Insurance Cards', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'claims' as const, label: 'Claims', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Insurance</h1>
          <p className="text-indigo-100 mt-1">Manage your insurance cards and track claims</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 rounded-t-lg mt-6">
          <nav className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {/* ═══ CARDS TAB ═══ */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              {cardsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl p-6 h-48 animate-pulse" />
                  ))}
                </div>
              ) : cardsError ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-500 mb-4">Failed to load insurance cards</p>
                  <button onClick={() => refetchCards()} className="btn-primary text-sm">Retry</button>
                </div>
              ) : cards && cards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cards.map(card => (
                    <InsuranceCardDisplay key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <CreditCard className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Insurance Cards</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">Add your insurance card to manage coverage and file claims</p>
                  <button className="btn-primary text-sm flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" /> Add Insurance Card
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══ CLAIMS TAB ═══ */}
          {activeTab === 'claims' && (
            <div className="space-y-6">
              {/* Stats */}
              {claims && claims.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹{totalClaimed.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">Total Claimed</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{totalApproved.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">Approved</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Pending</p>
                  </div>
                </div>
              )}

              {claimsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl animate-pulse flex gap-4">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : claimsError ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-500 mb-4">Failed to load claims</p>
                  <button onClick={() => refetchClaims()} className="btn-primary text-sm">Retry</button>
                </div>
              ) : claims && claims.length > 0 ? (
                <div className="space-y-3">
                  {claims.map(claim => (
                    <ClaimRow key={claim.id} claim={claim} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Claims</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">Your insurance claims will appear here</p>
                  <button className="btn-primary text-sm flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" /> File New Claim
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsurancePage;
