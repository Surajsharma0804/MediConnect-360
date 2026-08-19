import React, { useState } from 'react';
import {
  Users,
  Plus,
  Heart,
  Calendar,
  Activity,
  Phone,
  Mail,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  UserPlus,
  ShieldCheck,
  X,
  ChevronRight,
} from 'lucide-react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery';
import { familyAPI, type FamilyMember } from '../services/family.api';

// ─── Relationship Badge ───────────────────────────────────────────────────────

const relationshipColors: Record<string, string> = {
  spouse: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  child: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  parent: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  sibling: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  other: 'bg-slate-50 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300',
};

// ─── Add Member Modal ─────────────────────────────────────────────────────────

const AddMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Partial<FamilyMember>) => void;
  isAdding: boolean;
}> = ({ isOpen, onClose, onAdd, isAdding }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, relationship, dateOfBirth, bloodGroup, phone, email });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Family Member</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              placeholder="Enter full name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Relationship *</label>
              <select
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              >
                <option value="">Select...</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              >
                <option value="">Select...</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                placeholder="+91..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
              placeholder="email@example.com"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || !relationship || isAdding}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {isAdding ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Member Card ──────────────────────────────────────────────────────────────

const MemberCard: React.FC<{
  member: FamilyMember;
  onDelete: (id: string) => void;
}> = ({ member, onDelete }) => {
  const age = member.dateOfBirth
    ? Math.floor((Date.now() - new Date(member.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{member.name?.[0]?.toUpperCase() || '?'}</span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{member.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${
              relationshipColors[member.relationship] || relationshipColors.other
            }`}>
              {member.relationship?.charAt(0).toUpperCase() + member.relationship?.slice(1)}
            </span>
          </div>
        </div>
        <button
          onClick={() => { if (confirm(`Remove ${member.name} from family?`)) onDelete(member.id); }}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {age !== null && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{age} years old</span>
          </div>
        )}
        {member.bloodGroup && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Heart className="h-3.5 w-3.5 text-red-400" />
            <span>Blood: {member.bloodGroup}</span>
          </div>
        )}
        {member.phone && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>{member.phone}</span>
          </div>
        )}
        {member.email && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{member.email}</span>
          </div>
        )}
      </div>

      {/* Health Summary */}
      {(member.allergies?.length || member.conditions?.length || member.medications?.length) ? (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
          {member.allergies && member.allergies.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-red-500 font-medium mr-1">Allergies:</span>
              {member.allergies.map(a => (
                <span key={a} className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">{a}</span>
              ))}
            </div>
          )}
          {member.conditions && member.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-amber-500 font-medium mr-1">Conditions:</span>
              {member.conditions.map(c => (
                <span key={c} className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs rounded">{c}</span>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
        <button className="flex-1 px-3 py-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 font-medium flex items-center justify-center gap-1">
          <Activity className="h-3.5 w-3.5" /> Health Summary
        </button>
        <button className="flex-1 px-3 py-2 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-medium flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Insurance
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const FamilyPage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: members, isLoading, error, refetch } = useApiQuery<FamilyMember[]>(
    'family-members',
    () => familyAPI.getMembers()
  );

  const addMutation = useApiMutation(
    (data: Partial<FamilyMember>) => familyAPI.addMember(data),
    {
      onSuccess: () => { setShowAddModal(false); refetch(); },
      invalidateKeys: ['family-members'],
    }
  );

  const deleteMutation = useApiMutation(
    (id: string) => familyAPI.removeMember(id),
    {
      onSuccess: () => refetch(),
      invalidateKeys: ['family-members'],
    }
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Family Health</h1>
            <p className="text-pink-100 mt-1">Manage health records for your entire family</p>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white">{members?.length || 0}</span>
              <span className="text-pink-200 ml-1 text-sm">family members</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 text-sm font-medium flex items-center gap-2 border border-white/30"
          >
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-500 mb-4">Failed to load family members</p>
            <button onClick={() => refetch()} className="btn-primary text-sm">Retry</button>
          </div>
        ) : members && members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Family Members</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Add your family members to track everyone's health in one place</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-sm flex items-center gap-2 mx-auto"
            >
              <UserPlus className="h-4 w-4" /> Add First Member
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => addMutation.mutate(data)}
        isAdding={addMutation.isLoading}
      />
    </div>
  );
};

export default FamilyPage;
