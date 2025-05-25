import React, { useState } from 'react';
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
  StepForward
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Demo data
  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: 'Tue, Oct 10',
      time: '10:30 AM',
      status: 'confirmed'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'Dermatology',
      date: 'Thu, Oct 19',
      time: '2:15 PM',
      status: 'pending'
    }
  ];
  
  const medications = [
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      time: 'Morning',
      remaining: 15
    },
    {
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      time: 'Evening',
      remaining: 8
    },
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      time: 'Morning/Evening',
      remaining: 22
    }
  ];
  
  const healthMetrics = [
    { name: 'Blood Pressure', value: '122/78', unit: 'mmHg', trend: 'stable', icon: <Heart /> },
    { name: 'Heart Rate', value: '72', unit: 'bpm', trend: 'decreasing', icon: <Activity /> },
    { name: 'Weight', value: '165', unit: 'lbs', trend: 'decreasing', icon: <LineChart /> },
    { name: 'Sleep', value: '7.2', unit: 'hours', trend: 'increasing', icon: <Clock /> }
  ];
  
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Health Dashboard
            </h1>
            <p className="mt-1 text-slate-400">
              Welcome back, {user?.name || 'User'}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="btn-secondary flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </button>
            <button className="btn-primary flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Start Consult
            </button>
          </div>
        </div>
        
        {/* Dashboard Navigation */}
        <div className="mb-8 border-b border-slate-800">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
              { id: 'appointments', label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
              { id: 'medications', label: 'Medications', icon: <Pill className="h-4 w-4" /> },
              { id: 'records', label: 'Medical Records', icon: <Bookmark className="h-4 w-4" /> },
              { id: 'progress', label: 'Health Progress', icon: <StepForward className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {activeTab === 'overview' && (
          <>
            {/* Health Stats Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Health Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="glass-panel p-4 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-400">{metric.name}</p>
                        <div className="flex items-baseline mt-1">
                          <p className="text-2xl font-bold">{metric.value}</p>
                          <p className="ml-1 text-sm text-slate-400">{metric.unit}</p>
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${
                        metric.trend === 'increasing' ? 'bg-emerald-500/20' : 
                        metric.trend === 'decreasing' ? 'bg-blue-500/20' : 
                        'bg-indigo-500/20'
                      }`}>
                        {metric.icon}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            metric.trend === 'increasing' ? 'bg-emerald-500' : 
                            metric.trend === 'decreasing' ? 'bg-blue-500' : 
                            'bg-indigo-500'
                          }`} 
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        ></div>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {metric.trend === 'increasing' ? '↗ Improving' : 
                         metric.trend === 'decreasing' ? '↘ Improving' : 
                         '→ Stable'} from last check
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Appointments & Medications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Appointments */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
                  <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="glass-panel p-4 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-3">
                              <span className="text-white font-medium">
                                {appointment.doctor.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium">{appointment.doctor}</h3>
                              <p className="text-sm text-slate-400">{appointment.specialty}</p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 text-slate-400" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <button className="px-3 py-1 text-sm border border-slate-700 rounded-lg hover:bg-slate-800">
                            Reschedule
                          </button>
                          <button className="px-3 py-1 text-sm border border-slate-700 rounded-lg hover:bg-slate-800">
                            View Details
                          </button>
                          {appointment.status === 'confirmed' && (
                            <button className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                              Join Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-6 rounded-xl text-center">
                    <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-400" />
                    <h3 className="font-medium mb-1">No Upcoming Appointments</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Schedule your next appointment with your healthcare provider.
                    </p>
                    <button className="btn-primary text-sm">
                      Schedule Now
                    </button>
                  </div>
                )}
              </div>
              
              {/* Medications */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Current Medications</h2>
                  <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center">
                    Manage Medications <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                
                {medications.length > 0 ? (
                  <div className="space-y-4">
                    {medications.map((medication, index) => (
                      <div key={index} className="glass-panel p-4 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{medication.name}</h3>
                            <p className="text-sm text-slate-400">
                              {medication.dosage} • {medication.frequency}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            medication.remaining > 10 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {medication.remaining} remaining
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div 
                              className={medication.remaining > 10 ? 'bg-emerald-500 h-1.5 rounded-full' : 'bg-amber-500 h-1.5 rounded-full'} 
                              style={{ width: `${(medication.remaining / 30) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 text-slate-400" />
                            <span>Take at: {medication.time}</span>
                          </div>
                          <button className="text-sm text-indigo-400 hover:text-indigo-300">
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-6 rounded-xl text-center">
                    <Pill className="h-10 w-10 mx-auto mb-2 text-slate-400" />
                    <h3 className="font-medium mb-1">No Current Medications</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Your healthcare provider can add medications to your plan.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Health Alerts */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Health Alerts</h2>
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-start">
                  <div className="p-2 rounded-full bg-amber-500/20 mr-3">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">Annual Physical Checkup Due</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Your annual physical examination is due in the next 30 days. Regular checkups help maintain your health and catch potential issues early.
                    </p>
                    <div className="mt-3">
                      <button className="text-sm text-indigo-400 hover:text-indigo-300">
                        Schedule Checkup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Other tabs would be implemented here */}
        {activeTab !== 'overview' && (
          <div className="glass-panel p-8 rounded-xl text-center">
            <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
            <p className="text-slate-400 mb-4">
              The {activeTab} section is currently under development. Check back soon for updates!
            </p>
            <button
              onClick={() => setActiveTab('overview')}
              className="btn-secondary text-sm"
            >
              Return to Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;