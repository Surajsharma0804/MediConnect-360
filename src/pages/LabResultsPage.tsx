import React, { useState } from 'react';
import {
  TestTube,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  ChevronDown,
  Loader2,
  FileText,
  Calendar,
  MapPin,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useApiQuery } from '../hooks/useApiQuery';
import { labAPI, type LabTestOrder, type LabTestResult } from '../services/lab.api';

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    pending: { color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Clock className="h-3 w-3" /> },
    collected: { color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: <TestTube className="h-3 w-3" /> },
    processing: { color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    completed: { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: <CheckCircle2 className="h-3 w-3" /> },
    cancelled: { color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: <AlertCircle className="h-3 w-3" /> },
  };

  const { color, icon } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Result Indicator ─────────────────────────────────────────────────────────

const ResultIndicator: React.FC<{ value: number; referenceMin?: number; referenceMax?: number; unit: string }> = ({
  value, referenceMin, referenceMax, unit
}) => {
  const isLow = referenceMin !== undefined && value < referenceMin;
  const isHigh = referenceMax !== undefined && value > referenceMax;
  const isNormal = !isLow && !isHigh;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-bold ${
        isNormal ? 'text-emerald-600 dark:text-emerald-400' :
        isLow ? 'text-blue-600 dark:text-blue-400' :
        'text-red-600 dark:text-red-400'
      }`}>
        {value}
      </span>
      <span className="text-xs text-slate-500">{unit}</span>
      {isLow && <TrendingDown className="h-4 w-4 text-blue-500" />}
      {isHigh && <TrendingUp className="h-4 w-4 text-red-500" />}
      {isNormal && <Minus className="h-4 w-4 text-emerald-500" />}
      {referenceMin !== undefined && referenceMax !== undefined && (
        <span className="text-xs text-slate-400">
          ({referenceMin}–{referenceMax})
        </span>
      )}
    </div>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────

const OrderCard: React.FC<{ order: LabTestOrder; onViewResults: (id: string) => void }> = ({ order, onViewResults }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{order.testName}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Order #{order.id.slice(-8).toUpperCase()}
        </p>
      </div>
      <StatusBadge status={order.status} />
    </div>

    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
        <Calendar className="h-3.5 w-3.5 text-slate-400" />
        <span>Ordered: {new Date(order.orderedAt || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
      {order.collectedAt && (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <TestTube className="h-3.5 w-3.5 text-slate-400" />
          <span>Collected: {new Date(order.collectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      )}
      {order.labName && (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <span>{order.labName}</span>
        </div>
      )}
      {order.orderedBy && (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span>By: {order.orderedBy}</span>
        </div>
      )}
    </div>

    {order.status === 'completed' && (
      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={() => onViewResults(order.id)}
          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <FileText className="h-4 w-4" /> View Results
        </button>
        <button
          onClick={() => labAPI.downloadReport(order.id)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    )}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const LabResultsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'results'>('orders');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders, isLoading, error, refetch } = useApiQuery<LabTestOrder[]>(
    'lab-orders',
    () => labAPI.getOrders()
  );

  const { data: results, isLoading: resultsLoading } = useApiQuery<LabTestResult[]>(
    `lab-results-${selectedOrderId}`,
    () => labAPI.getResults(selectedOrderId!),
    { enabled: !!selectedOrderId }
  );

  const filteredOrders = (orders || []).filter(order => {
    if (filterStatus && order.status !== filterStatus) return false;
    if (searchQuery) {
      return order.testName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.labName?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const pendingCount = orders?.filter(o => o.status === 'pending' || o.status === 'processing').length || 0;
  const completedCount = orders?.filter(o => o.status === 'completed').length || 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Lab Results</h1>
          <p className="text-emerald-100 mt-1">Track your lab orders and view results</p>

          <div className="flex gap-6 mt-4">
            <div className="text-white">
              <span className="text-2xl font-bold">{orders?.length || 0}</span>
              <span className="text-emerald-200 ml-1 text-sm">total orders</span>
            </div>
            <div className="text-white">
              <span className="text-2xl font-bold">{pendingCount}</span>
              <span className="text-emerald-200 ml-1 text-sm">pending</span>
            </div>
            <div className="text-white">
              <span className="text-2xl font-bold">{completedCount}</span>
              <span className="text-emerald-200 ml-1 text-sm">completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tests..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="collected">Collected</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Results View */}
        {selectedOrderId && results ? (
          <div className="mb-8">
            <button
              onClick={() => setSelectedOrderId(null)}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline mb-4 flex items-center gap-1"
            >
              ← Back to Orders
            </button>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Test Results</h2>
              </div>
              {resultsLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
                </div>
              ) : results.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {results.map(result => (
                    <div key={result.id} className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">{result.testName || result.parameterName}</h4>
                        {result.methodology && (
                          <p className="text-xs text-slate-400 mt-0.5">Method: {result.methodology}</p>
                        )}
                      </div>
                      <ResultIndicator
                        value={result.value}
                        referenceMin={result.referenceMin}
                        referenceMax={result.referenceMax}
                        unit={result.unit}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">No results available yet</div>
              )}
            </div>
          </div>
        ) : null}

        {/* Orders Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-500 mb-4">Failed to load lab orders</p>
            <button onClick={() => refetch()} className="btn-primary text-sm flex items-center gap-2 mx-auto">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onViewResults={(id) => setSelectedOrderId(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <TestTube className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Lab Orders</h3>
            <p className="text-slate-500 dark:text-slate-400">
              Your lab orders and results will appear here when ordered by your provider.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabResultsPage;
