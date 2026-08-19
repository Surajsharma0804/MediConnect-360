import React, { useState } from 'react';
import {
  Pill,
  Search,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MapPin,
  DollarSign,
  ShoppingCart,
  Package,
  ChevronDown,
  Loader2,
  Plus,
  Bell,
  Calendar,
} from 'lucide-react';
import { useApiQuery } from '../hooks/useApiQuery';
import { pharmacyAPI, type Prescription, type Pharmacy } from '../services/pharmacy.api';

// ─── Prescription Card ────────────────────────────────────────────────────────

const PrescriptionCard: React.FC<{ rx: Prescription }> = ({ rx }) => {
  const refillsLeft = rx.refillsRemaining ?? rx.totalRefills;
  const isLowRefill = refillsLeft !== undefined && refillsLeft <= 1;
  const isExpiring = rx.expiryDate && new Date(rx.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{rx.medicationName || rx.drugName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{rx.dosage} • {rx.frequency}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          rx.status === 'active'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
        }`}>
          {rx.status === 'active' ? 'Active' : rx.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        {rx.prescribedBy && (
          <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <span className="text-slate-400">Prescribed by:</span> {rx.prescribedBy}
          </div>
        )}
        {rx.prescribedDate && (
          <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {new Date(rx.prescribedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>

      {/* Warnings */}
      {(isLowRefill || isExpiring) && (
        <div className="flex gap-2 mb-3">
          {isLowRefill && (
            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {refillsLeft === 0 ? 'No refills left' : `${refillsLeft} refill left`}
            </span>
          )}
          {isExpiring && (
            <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg flex items-center gap-1">
              <Clock className="h-3 w-3" /> Expiring soon
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
        <button className="flex-1 px-3 py-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 font-medium flex items-center justify-center gap-1">
          <RefreshCw className="h-3.5 w-3.5" /> Request Refill
        </button>
        <button className="flex-1 px-3 py-2 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-medium flex items-center justify-center gap-1">
          <Bell className="h-3.5 w-3.5" /> Set Reminder
        </button>
      </div>
    </div>
  );
};

// ─── Pharmacy Card ────────────────────────────────────────────────────────────

const PharmacyCard: React.FC<{ pharmacy: Pharmacy }> = ({ pharmacy }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4">
    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
      <Package className="h-5 w-5 text-emerald-600" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">{pharmacy.name}</h3>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {pharmacy.address || pharmacy.location}
        </span>
        {pharmacy.distance && (
          <span className="text-xs text-blue-500">{pharmacy.distance}</span>
        )}
      </div>
    </div>
    <div className="text-right flex-shrink-0">
      {pharmacy.isOpen !== undefined && (
        <span className={`text-xs font-medium ${pharmacy.isOpen ? 'text-emerald-500' : 'text-red-500'}`}>
          {pharmacy.isOpen ? 'Open' : 'Closed'}
        </span>
      )}
      {pharmacy.rating && (
        <p className="text-xs text-amber-500 mt-0.5">★ {pharmacy.rating}</p>
      )}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const PharmacyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'pharmacies'>('prescriptions');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: prescriptions, isLoading: rxLoading, error: rxError, refetch: refetchRx } = useApiQuery<Prescription[]>(
    'prescriptions',
    () => pharmacyAPI.getPrescriptions()
  );

  const { data: pharmacies, isLoading: pharmaLoading } = useApiQuery<Pharmacy[]>(
    'nearby-pharmacies',
    () => pharmacyAPI.getNearbyPharmacies(),
    { enabled: activeTab === 'pharmacies' }
  );

  const filteredRx = (prescriptions || []).filter(rx => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return rx.medicationName?.toLowerCase().includes(q) || rx.drugName?.toLowerCase().includes(q);
  });

  const activeCount = prescriptions?.filter(rx => rx.status === 'active').length || 0;

  const tabs = [
    { id: 'prescriptions' as const, label: 'Prescriptions', icon: <Pill className="h-4 w-4" /> },
    { id: 'pharmacies' as const, label: 'Nearby Pharmacies', icon: <MapPin className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Pharmacy & Medications</h1>
          <p className="text-violet-100 mt-1">Manage prescriptions, refills, and find nearby pharmacies</p>
          <div className="flex gap-6 mt-3">
            <div className="text-white">
              <span className="text-2xl font-bold">{prescriptions?.length || 0}</span>
              <span className="text-violet-200 ml-1 text-sm">prescriptions</span>
            </div>
            <div className="text-white">
              <span className="text-2xl font-bold">{activeCount}</span>
              <span className="text-violet-200 ml-1 text-sm">active</span>
            </div>
          </div>
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
                    ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-violet-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search medications..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {rxLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : rxError ? (
                <div className="text-center py-16">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-500 mb-4">Failed to load prescriptions</p>
                  <button onClick={() => refetchRx()} className="btn-primary text-sm">Retry</button>
                </div>
              ) : filteredRx.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRx.map(rx => <PrescriptionCard key={rx.id} rx={rx} />)}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <Pill className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Prescriptions</h3>
                  <p className="text-slate-500 dark:text-slate-400">Your prescriptions will appear here when prescribed by your doctor.</p>
                </div>
              )}
            </>
          )}

          {/* Pharmacies Tab */}
          {activeTab === 'pharmacies' && (
            <>
              {pharmaLoading ? (
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
              ) : pharmacies && pharmacies.length > 0 ? (
                <div className="space-y-3">
                  {pharmacies.map(p => <PharmacyCard key={p.id} pharmacy={p} />)}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <MapPin className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Nearby Pharmacies</h3>
                  <p className="text-slate-500 dark:text-slate-400">Enable location to find pharmacies near you.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyPage;
