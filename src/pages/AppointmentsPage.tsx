import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery';
import { appointmentsAPI, type Appointment } from '../services/appointments.api';

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ReactNode }> = {
    scheduled: { color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: <Clock className="h-3 w-3" /> },
    confirmed: { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: <CheckCircle2 className="h-3 w-3" /> },
    completed: { color: 'bg-slate-50 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300', icon: <CheckCircle2 className="h-3 w-3" /> },
    cancelled: { color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: <XCircle className="h-3 w-3" /> },
    no_show: { color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <AlertCircle className="h-3 w-3" /> },
  };
  const { color, icon } = config[status] || config.scheduled;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {icon} {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
};

// ─── Appointment Card ─────────────────────────────────────────────────────────

const AppointmentCard: React.FC<{
  apt: Appointment;
  onCancel: (id: string) => void;
  onReschedule: (id: string) => void;
}> = ({ apt, onCancel, onReschedule }) => {
  const dateStr = new Date(apt.dateTime || apt.date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
  const timeStr = new Date(apt.dateTime || apt.date).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  });
  const isUpcoming = new Date(apt.dateTime || apt.date) > new Date() && apt.status !== 'cancelled';

  return (
    <div className={`bg-white dark:bg-slate-800 border rounded-xl p-5 transition-shadow hover:shadow-md ${
      isUpcoming ? 'border-blue-200 dark:border-blue-800' : 'border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            apt.type === 'video' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
          }`}>
            {apt.type === 'video'
              ? <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              : <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            }
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{apt.providerName || apt.doctorName || 'Provider'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{apt.specialization || apt.department || apt.reason}</p>
          </div>
        </div>
        <StatusBadge status={apt.status} />
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" /> {dateStr}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" /> {timeStr}
        </span>
        {apt.duration && (
          <span className="text-slate-400">{apt.duration} min</span>
        )}
        {apt.type && (
          <span className="flex items-center gap-1.5">
            {apt.type === 'video' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
            {apt.type === 'video' ? 'Video Call' : 'In-Person'}
          </span>
        )}
      </div>

      {apt.notes && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg italic">
          "{apt.notes}"
        </p>
      )}

      {isUpcoming && (
        <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
          {apt.type === 'video' && (
            <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Video className="h-4 w-4" /> Join Call
            </button>
          )}
          <button
            onClick={() => onReschedule(apt.id)}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Reschedule
          </button>
          <button
            onClick={() => { if (confirm('Cancel this appointment?')) onCancel(apt.id); }}
            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AppointmentsPage: React.FC = () => {
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const { data: appointments, isLoading, error, refetch } = useApiQuery<Appointment[]>(
    'appointments',
    () => appointmentsAPI.getAll()
  );

  const cancelMutation = useApiMutation(
    (id: string) => appointmentsAPI.cancel(id),
    { onSuccess: () => refetch(), invalidateKeys: ['appointments'] }
  );

  const now = new Date();
  const filtered = (appointments || []).filter(apt => {
    const aptDate = new Date(apt.dateTime || apt.date);
    if (filter === 'upcoming') return aptDate >= now && apt.status !== 'cancelled';
    if (filter === 'past') return aptDate < now || apt.status === 'completed';
    return true;
  }).sort((a, b) => {
    const da = new Date(a.dateTime || a.date).getTime();
    const db = new Date(b.dateTime || b.date).getTime();
    return filter === 'past' ? db - da : da - db;
  });

  const upcomingCount = (appointments || []).filter(a => new Date(a.dateTime || a.date) >= now && a.status !== 'cancelled').length;
  const completedCount = (appointments || []).filter(a => a.status === 'completed').length;

  const tabs = [
    { id: 'upcoming' as const, label: 'Upcoming', count: upcomingCount },
    { id: 'past' as const, label: 'Past', count: completedCount },
    { id: 'all' as const, label: 'All', count: appointments?.length || 0 },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-600 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Appointments</h1>
            <p className="text-blue-100 mt-1">Manage your scheduled consultations</p>
            <div className="flex gap-6 mt-3">
              <div className="text-white">
                <span className="text-2xl font-bold">{upcomingCount}</span>
                <span className="text-blue-200 ml-1 text-sm">upcoming</span>
              </div>
              <div className="text-white">
                <span className="text-2xl font-bold">{completedCount}</span>
                <span className="text-blue-200 ml-1 text-sm">completed</span>
              </div>
            </div>
          </div>
          <button className="px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 text-sm font-medium flex items-center gap-2 border border-white/30">
            <Plus className="h-4 w-4" /> Book Appointment
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.id ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-500 mb-4">Failed to load appointments</p>
            <button onClick={() => refetch()} className="btn-primary text-sm">Retry</button>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(apt => (
              <AppointmentCard
                key={apt.id}
                apt={apt}
                onCancel={(id) => cancelMutation.mutate(id)}
                onReschedule={(id) => alert(`Reschedule flow for appointment ${id} — connect to scheduling API`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {filter === 'upcoming' ? 'No Upcoming Appointments' : filter === 'past' ? 'No Past Appointments' : 'No Appointments'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Book an appointment with a doctor to get started.
            </p>
            <button className="btn-primary text-sm flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" /> Book Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
