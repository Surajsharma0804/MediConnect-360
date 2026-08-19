import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Phone,
  MapPin,
  AlertCircle,
  Shield,
  Plus,
  Edit,
  Trash2,
  User,
  Droplets,
  Pill,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery';
import { emergencyAPI, type EmergencyContact, type MedicalID, type SOSAlert } from '../services/emergency.api';

// ─── SOS Button ───────────────────────────────────────────────────────────────

const SOSButton: React.FC<{
  isActive: boolean;
  isTriggering: boolean;
  onTrigger: () => void;
  onCancel: () => void;
}> = ({ isActive, isTriggering, onTrigger, onCancel }) => {
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  const startHold = () => {
    if (isActive) return;
    const timer = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          onTrigger();
          return 100;
        }
        return prev + 5;
      });
    }, 50);
    setHoldTimer(timer);
  };

  const stopHold = () => {
    if (holdTimer) {
      clearInterval(holdTimer);
      setHoldTimer(null);
    }
    setHoldProgress(0);
  };

  return (
    <div className="text-center">
      {isActive ? (
        <div className="space-y-4">
          <div className="w-40 h-40 mx-auto rounded-full bg-red-600 animate-pulse flex items-center justify-center shadow-2xl shadow-red-500/50">
            <Heart className="h-16 w-16 text-white" fill="white" />
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 animate-pulse-soft">SOS ACTIVE — Help is on the way</p>
          <button
            onClick={onCancel}
            className="px-8 py-3 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors"
          >
            Cancel SOS
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative inline-block">
            <button
              onMouseDown={startHold}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              onTouchStart={startHold}
              onTouchEnd={stopHold}
              disabled={isTriggering}
              className="w-40 h-40 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-2xl shadow-red-500/30 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {isTriggering ? (
                <Loader2 className="h-16 w-16 text-white animate-spin" />
              ) : (
                <div className="text-center">
                  <Heart className="h-12 w-12 text-white mx-auto" fill="white" />
                  <span className="text-white font-bold text-sm mt-1 block">HOLD</span>
                </div>
              )}
            </button>
            {/* Hold progress ring */}
            {holdProgress > 0 && holdProgress < 100 && (
              <svg className="absolute inset-0 w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="76" fill="none" stroke="white" strokeWidth="4" strokeDasharray={`${holdProgress * 4.78} 478`} opacity="0.8" />
              </svg>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Hold the button for 2 seconds to trigger emergency SOS
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Contact Card ─────────────────────────────────────────────────────────────

const ContactCard: React.FC<{
  contact: EmergencyContact;
  onDelete: (id: string) => void;
}> = ({ contact, onDelete }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
        <span className="text-white font-medium text-sm">{contact.name[0]}</span>
      </div>
      <div>
        <h3 className="font-medium text-slate-900 dark:text-slate-100">
          {contact.name}
          {contact.isPrimary && (
            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Primary</span>
          )}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{contact.relationship} · {contact.phone}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <a href={`tel:${contact.phone}`} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
        <Phone className="h-4 w-4" />
      </a>
      <button onClick={() => onDelete(contact.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EmergencyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sos' | 'contacts' | 'medical-id'>('sos');

  // SOS Status
  const { data: sosStatus, isLoading: sosLoading, refetch: refetchSOS } = useApiQuery<SOSAlert | null>(
    'sos-status',
    () => emergencyAPI.getSOSStatus(),
  );

  // Emergency Contacts
  const { data: contacts, isLoading: contactsLoading, refetch: refetchContacts } = useApiQuery<EmergencyContact[]>(
    'emergency-contacts',
    () => emergencyAPI.getContacts(),
    { enabled: activeTab === 'contacts' || activeTab === 'sos' }
  );

  // Medical ID
  const { data: medicalID, isLoading: medicalIDLoading, refetch: refetchMedicalID } = useApiQuery<MedicalID>(
    'medical-id',
    () => emergencyAPI.getMedicalID(),
    { enabled: activeTab === 'medical-id' }
  );

  // Mutations
  const triggerSOS = useApiMutation(
    () => emergencyAPI.triggerSOS({
      emergencyType: 'medical',
      notes: 'Emergency SOS triggered from app',
    }),
    {
      onSuccess: () => refetchSOS(),
      invalidateKeys: ['sos-status'],
    }
  );

  const cancelSOS = useApiMutation(
    () => emergencyAPI.cancelSOS(),
    {
      onSuccess: () => refetchSOS(),
      invalidateKeys: ['sos-status'],
    }
  );

  const deleteContact = useApiMutation(
    (id: string) => emergencyAPI.deleteContact(id),
    {
      onSuccess: () => refetchContacts(),
      invalidateKeys: ['emergency-contacts'],
    }
  );

  // Location sharing during active SOS
  useEffect(() => {
    if (sosStatus?.status !== 'active') return;
    
    const watchId = navigator.geolocation?.watchPosition(
      (pos) => {
        emergencyAPI.shareLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      undefined,
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [sosStatus?.status]);

  const isSOSActive = sosStatus?.status === 'active';

  const tabs = [
    { id: 'sos' as const, label: 'Emergency SOS', icon: <Heart className="h-4 w-4" /> },
    { id: 'contacts' as const, label: 'Emergency Contacts', icon: <Phone className="h-4 w-4" /> },
    { id: 'medical-id' as const, label: 'Medical ID', icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className={`py-8 px-4 sm:px-6 lg:px-8 ${isSOSActive ? 'bg-red-600' : 'bg-gradient-to-r from-red-600 to-rose-600'}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Emergency Services</h1>
          <p className="text-red-100 mt-1">Quick access to emergency SOS, contacts, and your Medical ID</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 rounded-t-lg mt-6">
          <nav className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-red-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {/* ═══ SOS TAB ═══ */}
          {activeTab === 'sos' && (
            <div className="space-y-8">
              {/* SOS Button */}
              <SOSButton
                isActive={isSOSActive}
                isTriggering={triggerSOS.isLoading}
                onTrigger={() => triggerSOS.mutate(undefined as never)}
                onCancel={() => cancelSOS.mutate(undefined as never)}
              />

              {/* Emergency Numbers */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Emergency Numbers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <a href="tel:112" className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <Phone className="h-5 w-5 text-red-600" />
                    <div>
                      <span className="font-bold text-red-700 dark:text-red-400 text-lg">112</span>
                      <p className="text-xs text-red-600 dark:text-red-400">National Emergency</p>
                    </div>
                  </a>
                  <a href="tel:108" className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <Phone className="h-5 w-5 text-red-600" />
                    <div>
                      <span className="font-bold text-red-700 dark:text-red-400 text-lg">108</span>
                      <p className="text-xs text-red-600 dark:text-red-400">Ambulance</p>
                    </div>
                  </a>
                  <a href="tel:1066" className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <Phone className="h-5 w-5 text-red-600" />
                    <div>
                      <span className="font-bold text-red-700 dark:text-red-400 text-lg">1066</span>
                      <p className="text-xs text-red-600 dark:text-red-400">Health Helpline</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Quick contacts from emergency list */}
              {contacts && contacts.length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Your Emergency Contacts</h2>
                  <div className="space-y-3">
                    {contacts.filter(c => c.notifyOnSOS).slice(0, 3).map(contact => (
                      <a key={contact.id} href={`tel:${contact.phone}`} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{contact.name[0]}</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-slate-900 dark:text-slate-100">{contact.name}</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">{contact.relationship}</span>
                        </div>
                        <Phone className="h-4 w-4 text-emerald-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ CONTACTS TAB ═══ */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Emergency Contacts</h2>
                <button className="btn-primary text-sm flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Contact
                </button>
              </div>

              {contactsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-1" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : contacts && contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map(contact => (
                    <ContactCard key={contact.id} contact={contact} onDelete={(id) => deleteContact.mutate(id)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <Phone className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">No Emergency Contacts</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Add emergency contacts who will be notified during an SOS</p>
                  <button className="btn-primary text-sm">Add First Contact</button>
                </div>
              )}
            </div>
          )}

          {/* ═══ MEDICAL ID TAB ═══ */}
          {activeTab === 'medical-id' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Medical ID</h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <Edit className="h-4 w-4" /> Edit
                </button>
              </div>

              {medicalIDLoading ? (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl animate-pulse">
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i}>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : medicalID ? (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {/* Blood Type */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Blood Type</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{medicalID.bloodType || '—'}</p>
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-2 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Allergies
                    </p>
                    {medicalID.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {medicalID.allergies.map((allergy, i) => (
                          <span key={i} className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-full font-medium">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No known allergies</p>
                    )}
                  </div>

                  {/* Conditions */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-2 flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" /> Medical Conditions
                    </p>
                    {medicalID.conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {medicalID.conditions.map((cond, i) => (
                          <span key={i} className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm rounded-full font-medium">
                            {cond}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No conditions listed</p>
                    )}
                  </div>

                  {/* Medications */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-2 flex items-center gap-1">
                      <Pill className="h-3.5 w-3.5" /> Current Medications
                    </p>
                    {medicalID.medications.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {medicalID.medications.map((med, i) => (
                          <span key={i} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium">
                            {med}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No medications listed</p>
                    )}
                  </div>

                  {/* Organ Donor */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Organ Donor</span>
                    </div>
                    {medicalID.organDonor ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-slate-400" />
                    )}
                  </div>

                  {/* Emergency Notes */}
                  {medicalID.emergencyNotes && (
                    <div className="p-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium mb-2">Emergency Notes</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{medicalID.emergencyNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <Shield className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">No Medical ID</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Create your Medical ID so first responders can access critical health info</p>
                  <button className="btn-primary text-sm">Create Medical ID</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;
