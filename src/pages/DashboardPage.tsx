import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Pill, 
  Heart, 
  LineChart, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Bookmark,
  StepForward,
  RefreshCw,
  FileText,
  Upload,
  Droplets,
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApiQuery } from '../hooks/useApiQuery';
import { appointmentsAPI, type Appointment } from '../services/appointments.api';
import { healthTrackingAPI, type HealthTracking, type TrackingType } from '../services/health-tracking.api';
import { pharmacyAPI } from '../services/pharmacy.api';
import { documentsAPI, type MedicalDocument } from '../services/documents.api';
import { remindersAPI, type Reminder } from '../services/reminders.api';

// ─── Helper: Format Date ──────────────────────────────────────────────────────

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// ─── Helper: Trend Icon ───────────────────────────────────────────────────────

const TrendIcon: React.FC<{ trend: 'increasing' | 'decreasing' | 'stable' }> = ({ trend }) => {
  if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-blue-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
};

// ─── Helper: Loading Skeleton ─────────────────────────────────────────────────

const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg animate-pulse">
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full mt-4" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mt-2" />
  </div>
);

// ─── Helper: Error State ──────────────────────────────────────────────────────

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-center">
    <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
    <p className="text-sm text-red-600 dark:text-red-400 mb-3">{message}</p>
    <button onClick={onRetry} className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center justify-center gap-1 mx-auto">
      <RefreshCw className="h-3 w-3" /> Retry
    </button>
  </div>
);

// ─── Helper: Empty State ──────────────────────────────────────────────────────

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string; actionLabel?: string; actionLink?: string }> = 
  ({ icon, title, description, actionLabel, actionLink }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl text-center">
    <div className="mx-auto mb-3 text-slate-400 dark:text-slate-500">{icon}</div>
    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p>
    {actionLabel && actionLink && (
      <Link to={actionLink} className="btn-primary text-sm inline-block">{actionLabel}</Link>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // ─── Data Fetching (ALL from API, ZERO hardcoded) ─────────────────────

  // Safe wrapper: returns fallback on API failure (new users have no data)
  const safeFetch = <T,>(fn: () => Promise<T>, fallback: T): () => Promise<T> => {
    return async () => {
      try {
        return await fn();
      } catch {
        return fallback;
      }
    };
  };

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const nowISO = now.toISOString();

  const { 
    data: appointments, 
    isLoading: appointmentsLoading, 
    error: appointmentsError,
    refetch: refetchAppointments
  } = useApiQuery<Appointment[]>(
    'dashboard-appointments',
    safeFetch(() => appointmentsAPI.getAll(true), []),
    { enabled: activeTab === 'overview' || activeTab === 'appointments' }
  );

  const { 
    data: healthData, 
    isLoading: healthLoading, 
    error: healthError,
    refetch: refetchHealth
  } = useApiQuery<HealthTracking[]>(
    'dashboard-health',
    safeFetch(() => healthTrackingAPI.getAll({ limit: 50, startDate: thirtyDaysAgo, endDate: nowISO }), []),
    { enabled: activeTab === 'overview' || activeTab === 'progress' }
  );

  const { 
    data: bpStats, 
    isLoading: bpLoading 
  } = useApiQuery(
    'dashboard-bp-stats',
    safeFetch(() => healthTrackingAPI.getStats('blood_pressure' as TrackingType, thirtyDaysAgo, nowISO), null),
    { enabled: activeTab === 'overview' }
  );

  const { 
    data: hrStats, 
    isLoading: hrLoading 
  } = useApiQuery(
    'dashboard-hr-stats',
    safeFetch(() => healthTrackingAPI.getStats('heart_rate' as TrackingType, thirtyDaysAgo, nowISO), null),
    { enabled: activeTab === 'overview' }
  );

  const { 
    data: weightStats, 
    isLoading: weightLoading 
  } = useApiQuery(
    'dashboard-weight-stats',
    safeFetch(() => healthTrackingAPI.getStats('weight' as TrackingType, thirtyDaysAgo, nowISO), null),
    { enabled: activeTab === 'overview' }
  );

  const { 
    data: sleepStats, 
    isLoading: sleepLoading 
  } = useApiQuery(
    'dashboard-sleep-stats',
    safeFetch(() => healthTrackingAPI.getStats('sleep' as TrackingType, thirtyDaysAgo, nowISO), null),
    { enabled: activeTab === 'overview' }
  );

  const {
    data: prescriptions,
    isLoading: prescriptionsLoading,
    error: prescriptionsError,
    refetch: refetchPrescriptions
  } = useApiQuery(
    'dashboard-prescriptions',
    safeFetch(() => pharmacyAPI.getPrescriptions('active'), []),
    { enabled: activeTab === 'overview' || activeTab === 'medications' }
  );

  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments
  } = useApiQuery(
    'dashboard-documents',
    safeFetch(() => documentsAPI.getAll({ limit: 10, page: 1 }), []),
    { enabled: activeTab === 'records' }
  );

  const {
    data: reminders,
    isLoading: remindersLoading,
  } = useApiQuery<Reminder[]>(
    'dashboard-reminders',
    safeFetch(() => remindersAPI.getAll(undefined, true), []),
    { enabled: activeTab === 'overview' }
  );

  // ─── Derived Health Metrics ───────────────────────────────────────────

  const healthMetrics = useMemo(() => {
    const metrics = [];

    if (bpStats) {
      metrics.push({
        name: 'Blood Pressure',
        value: bpStats.average ? `${Math.round(bpStats.average)}` : '—',
        unit: 'mmHg',
        trend: bpStats.trend || 'stable' as const,
        icon: <Heart className="h-5 w-5" />,
        count: bpStats.count || 0,
      });
    }

    if (hrStats) {
      metrics.push({
        name: 'Heart Rate',
        value: hrStats.average ? `${Math.round(hrStats.average)}` : '—',
        unit: 'bpm',
        trend: hrStats.trend || 'stable' as const,
        icon: <Activity className="h-5 w-5" />,
        count: hrStats.count || 0,
      });
    }

    if (weightStats) {
      metrics.push({
        name: 'Weight',
        value: weightStats.average ? `${weightStats.average.toFixed(1)}` : '—',
        unit: 'kg',
        trend: weightStats.trend || 'stable' as const,
        icon: <LineChart className="h-5 w-5" />,
        count: weightStats.count || 0,
      });
    }

    if (sleepStats) {
      metrics.push({
        name: 'Sleep',
        value: sleepStats.average ? `${(sleepStats.average / 60).toFixed(1)}` : '—',
        unit: 'hours',
        trend: sleepStats.trend || 'stable' as const,
        icon: <Moon className="h-5 w-5" />,
        count: sleepStats.count || 0,
      });
    }

    // If no stats available yet, show placeholder metrics
    if (metrics.length === 0) {
      return [
        { name: 'Blood Pressure', value: '—', unit: 'mmHg', trend: 'stable' as const, icon: <Heart className="h-5 w-5" />, count: 0 },
        { name: 'Heart Rate', value: '—', unit: 'bpm', trend: 'stable' as const, icon: <Activity className="h-5 w-5" />, count: 0 },
        { name: 'Weight', value: '—', unit: 'kg', trend: 'stable' as const, icon: <LineChart className="h-5 w-5" />, count: 0 },
        { name: 'Sleep', value: '—', unit: 'hours', trend: 'stable' as const, icon: <Moon className="h-5 w-5" />, count: 0 },
      ];
    }

    return metrics;
  }, [bpStats, hrStats, weightStats, sleepStats]);

  const metricsLoading = bpLoading || hrLoading || weightLoading || sleepLoading;

  // ─── Active Reminders / Alerts ────────────────────────────────────────

  const activeAlerts = useMemo(() => {
    const alerts: Array<{ type: 'warning' | 'info'; title: string; description: string; actionLabel?: string; actionLink?: string }> = [];

    // Check if any prescriptions are running low
    if (prescriptions && Array.isArray(prescriptions)) {
      const lowRefill = prescriptions.filter((p: any) => p.refillsRemaining !== undefined && p.refillsRemaining <= 1);
      if (lowRefill.length > 0) {
        alerts.push({
          type: 'warning',
          title: `${lowRefill.length} Medication${lowRefill.length > 1 ? 's' : ''} Running Low`,
          description: `${lowRefill.map((p: any) => p.medicationName).join(', ')} ${lowRefill.length > 1 ? 'need' : 'needs'} a refill soon.`,
          actionLabel: 'Request Refill',
          actionLink: '/medications',
        });
      }
    }

    // Check upcoming appointments in next 24h
    if (appointments && Array.isArray(appointments)) {
      const upcoming24h = appointments.filter(a => {
        const apptDate = new Date(a.scheduledAt);
        return apptDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000 && apptDate > now;
      });
      if (upcoming24h.length > 0) {
        alerts.push({
          type: 'info',
          title: `Appointment in the next 24 hours`,
          description: `You have ${upcoming24h.length} upcoming appointment${upcoming24h.length > 1 ? 's' : ''} within the next day.`,
          actionLabel: 'View Details',
          actionLink: '/appointments',
        });
      }
    }

    // Default alert if nothing else
    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        title: 'Track Your Health',
        description: 'Start logging your vitals, medications, and symptoms to get personalized health insights.',
        actionLabel: 'Start Tracking',
        actionLink: '/health-tracking',
      });
    }

    return alerts;
  }, [prescriptions, appointments, now]);

  // ─── Tab Definitions ──────────────────────────────────────────────────

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
    { id: 'medications', label: 'Medications', icon: <Pill className="h-4 w-4" /> },
    { id: 'records', label: 'Medical Records', icon: <Bookmark className="h-4 w-4" /> },
    { id: 'progress', label: 'Health Progress', icon: <StepForward className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Health Dashboard
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400 text-lg">
              Welcome back, {user?.name || 'User'}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link to="/virtual-consult" className="btn-secondary flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Link>
            <Link to="/virtual-consult" className="btn-primary flex items-center text-sm">
              <Activity className="h-4 w-4 mr-2" />
              Start Consult
            </Link>
          </div>
        </div>
        
        {/* Dashboard Navigation */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-lg">
          <nav className="flex space-x-1 px-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center pb-4 pt-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* ═══════════════════════════════════════════════════════════════════
            OVERVIEW TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Health Stats Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your Health Metrics</h2>
                {!metricsLoading && (
                  <button onClick={() => { refetchHealth(); }} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Refresh
                  </button>
                )}
              </div>

              {metricsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {healthMetrics.map((metric, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{metric.name}</p>
                          <div className="flex items-baseline mt-2">
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{metric.value}</p>
                            <p className="ml-2 text-sm text-slate-500 dark:text-slate-400">{metric.unit}</p>
                          </div>
                        </div>
                        <div className={`p-2.5 rounded-lg ${
                          metric.trend === 'increasing' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 
                          metric.trend === 'decreasing' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 
                          'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {metric.icon}
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                          <TrendIcon trend={metric.trend} />
                          <span>
                            {metric.trend === 'increasing' ? 'Trending up' : 
                             metric.trend === 'decreasing' ? 'Trending down' : 
                             'Stable'} · {metric.count} reading{metric.count !== 1 ? 's' : ''} this month
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Appointments & Medications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Appointments */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Upcoming Appointments</h2>
                  <Link to="/appointments" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                
                {appointmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <CardSkeleton key={i} />)}
                  </div>
                ) : appointmentsError ? (
                  <ErrorState message="Failed to load appointments" onRetry={refetchAppointments} />
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                              <span className="text-white font-medium text-sm">
                                {appointment.doctor 
                                  ? `${appointment.doctor.firstName[0]}${appointment.doctor.lastName[0]}`
                                  : '?'}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                {appointment.doctor 
                                  ? `${appointment.doctor.title || 'Dr.'} ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                                  : 'Doctor'}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {appointment.doctor?.specializations?.[0] || appointment.reason || 'Consultation'}
                              </p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                              : appointment.status === 'pending'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between">
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                            <span>{formatDate(appointment.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="h-4 w-4 mr-1 text-slate-400" />
                            <span>{formatTime(appointment.scheduledAt)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <button className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
                            Reschedule
                          </button>
                          {appointment.status === 'confirmed' && appointment.videoRoomUrl && (
                            <Link 
                              to={`/virtual-consult?room=${appointment.videoRoomUrl}`}
                              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              Join Now
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Calendar className="h-10 w-10" />}
                    title="No Upcoming Appointments"
                    description="Schedule your next appointment with a healthcare provider."
                    actionLabel="Schedule Now"
                    actionLink="/virtual-consult"
                  />
                )}
              </div>
              
              {/* Medications */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Active Medications</h2>
                  <Link to="/medications" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    Manage <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
                
                {prescriptionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                  </div>
                ) : prescriptionsError ? (
                  <ErrorState message="Failed to load medications" onRetry={refetchPrescriptions} />
                ) : prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {prescriptions.slice(0, 4).map((medication: any) => (
                      <div key={medication.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">{medication.medicationName || medication.medications?.[0]?.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {medication.dosage || medication.medications?.[0]?.dosage} · {medication.frequency || medication.medications?.[0]?.frequency}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (medication.refillsRemaining > 2 || medication.status === 'active')
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}>
                            {medication.refillsRemaining !== undefined 
                              ? `${medication.refillsRemaining} refills left`
                              : medication.status}
                          </div>
                        </div>
                        
                        {medication.instructions && (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                            {medication.instructions}
                          </p>
                        )}

                        <div className="mt-3 flex justify-between items-center">
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{medication.frequency || 'As prescribed'}</span>
                          </div>
                          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Pill className="h-10 w-10" />}
                    title="No Active Medications"
                    description="Your healthcare provider can add medications to your plan."
                  />
                )}
              </div>
            </div>
            
            {/* Health Alerts */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Health Alerts</h2>
              <div className="space-y-3">
                {activeAlerts.map((alert, index) => (
                  <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-3 ${
                        alert.type === 'warning' 
                          ? 'bg-amber-100 dark:bg-amber-900/30' 
                          : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        <AlertCircle className={`h-5 w-5 ${
                          alert.type === 'warning' 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{alert.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{alert.description}</p>
                        {alert.actionLabel && alert.actionLink && (
                          <div className="mt-3">
                            <Link to={alert.actionLink} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                              {alert.actionLabel}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            APPOINTMENTS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'appointments' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">All Appointments</h2>
              <Link to="/virtual-consult" className="btn-primary text-sm">+ New Appointment</Link>
            </div>

            {appointmentsLoading ? (
              <div className="space-y-4">{[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}</div>
            ) : appointmentsError ? (
              <ErrorState message="Failed to load appointments" onRetry={refetchAppointments} />
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                        <span className="text-white font-medium">
                          {appointment.doctor ? `${appointment.doctor.firstName[0]}${appointment.doctor.lastName[0]}` : '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">
                          {appointment.doctor ? `${appointment.doctor.title || 'Dr.'} ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'Doctor'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(appointment.scheduledAt)} at {formatTime(appointment.scheduledAt)} · {appointment.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                      appointment.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      appointment.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Calendar className="h-10 w-10" />} title="No Appointments" description="You don't have any appointments yet." actionLabel="Book an Appointment" actionLink="/virtual-consult" />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MEDICATIONS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'medications' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your Medications</h2>
            </div>

            {prescriptionsLoading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
            ) : prescriptionsError ? (
              <ErrorState message="Failed to load medications" onRetry={refetchPrescriptions} />
            ) : prescriptions && Array.isArray(prescriptions) && prescriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((med: any) => (
                  <div key={med.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{med.medicationName || med.medications?.[0]?.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{med.dosage || med.medications?.[0]?.dosage}</p>
                      </div>
                      <Pill className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <p><strong>Frequency:</strong> {med.frequency || med.medications?.[0]?.frequency}</p>
                      {med.instructions && <p><strong>Instructions:</strong> {med.instructions}</p>}
                      {med.provider && <p><strong>Prescribed by:</strong> {med.provider.firstName} {med.provider.lastName}</p>}
                      {med.refillsRemaining !== undefined && <p><strong>Refills remaining:</strong> {med.refillsRemaining}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Pill className="h-10 w-10" />} title="No Medications" description="You don't have any active prescriptions." />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MEDICAL RECORDS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'records' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Medical Records</h2>
              <Link to="/documents/upload" className="btn-primary text-sm flex items-center gap-1">
                <Upload className="h-4 w-4" /> Upload Document
              </Link>
            </div>

            {documentsLoading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
            ) : documentsError ? (
              <ErrorState message="Failed to load documents" onRetry={refetchDocuments} />
            ) : documents && documents.data && documents.data.length > 0 ? (
              <div className="space-y-3">
                {documents.data.map((doc: MedicalDocument) => (
                  <div key={doc.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mr-4">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{doc.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {doc.type.replace(/_/g, ' ')} · {formatDate(doc.createdAt)} · {(doc.fileSize / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.tags && doc.tags.length > 0 && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-400">
                          {doc.tags[0]}
                        </span>
                      )}
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<FileText className="h-10 w-10" />} title="No Medical Records" description="Upload your medical documents to keep them organized and accessible." actionLabel="Upload Document" actionLink="/documents/upload" />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            HEALTH PROGRESS TAB
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'progress' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Health Progress</h2>
              <Link to="/health-tracking" className="btn-primary text-sm">+ Log Entry</Link>
            </div>

            {healthLoading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
            ) : healthError ? (
              <ErrorState message="Failed to load health data" onRetry={refetchHealth} />
            ) : healthData && healthData.length > 0 ? (
              <div className="space-y-3">
                {healthData.slice(0, 20).map((entry) => (
                  <div key={entry.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          entry.trackingType === 'blood_pressure' ? 'bg-red-50 dark:bg-red-900/30' :
                          entry.trackingType === 'heart_rate' ? 'bg-pink-50 dark:bg-pink-900/30' :
                          entry.trackingType === 'weight' ? 'bg-green-50 dark:bg-green-900/30' :
                          entry.trackingType === 'sleep' ? 'bg-indigo-50 dark:bg-indigo-900/30' :
                          'bg-blue-50 dark:bg-blue-900/30'
                        }`}>
                          {entry.trackingType === 'blood_pressure' ? <Heart className="h-4 w-4 text-red-500" /> :
                           entry.trackingType === 'heart_rate' ? <Activity className="h-4 w-4 text-pink-500" /> :
                           entry.trackingType === 'weight' ? <LineChart className="h-4 w-4 text-green-500" /> :
                           entry.trackingType === 'sleep' ? <Moon className="h-4 w-4 text-indigo-500" /> :
                           entry.trackingType === 'water' ? <Droplets className="h-4 w-4 text-blue-500" /> :
                           <Activity className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                            {entry.trackingType.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {entry.trackingType === 'blood_pressure' && entry.systolicBP ? `${entry.systolicBP}/${entry.diastolicBP} mmHg` :
                             entry.trackingType === 'heart_rate' && entry.heartRate ? `${entry.heartRate} bpm` :
                             entry.trackingType === 'weight' && entry.weight ? `${entry.weight} ${entry.weightUnit || 'kg'}` :
                             entry.trackingType === 'sleep' && entry.sleepDurationMinutes ? `${(entry.sleepDurationMinutes / 60).toFixed(1)} hours` :
                             entry.trackingType === 'water' && entry.waterIntakeMl ? `${entry.waterIntakeMl} ml` :
                             entry.notes || 'Recorded'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(entry.trackedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<LineChart className="h-10 w-10" />} title="No Health Data Yet" description="Start tracking your vitals, exercise, sleep, and more to see your progress over time." actionLabel="Start Tracking" actionLink="/health-tracking" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;