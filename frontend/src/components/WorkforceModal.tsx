import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Lock, 
  Plus, 
  Check, 
  Building2,
  Sliders,
  FileText,
  AlertCircle
} from 'lucide-react';
import { CustomRoleInfo, UserProfile } from '../types';
import { API_BASE } from '../services/api';

interface WorkforceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgName: string;
  currentUser: UserProfile | null;
  canManageTeam?: boolean;
}

export const WorkforceModal: React.FC<WorkforceModalProps> = ({
  isOpen,
  onClose,
  orgId,
  orgName,
  currentUser,
  canManageTeam: canManageTeamProp = true
}) => {
  const hasTeamAuthority = Boolean(currentUser?.isOwner || canManageTeamProp);
  const [activeTab, setActiveTab] = useState<'roster' | 'roles' | 'invite'>('roster');
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<CustomRoleInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Invite Form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteDept, setInviteDept] = useState('Corridor Logistics');

  // Custom Role Creator Form
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [canApprove, setCanApprove] = useState(false);
  const [canTuneSolver, setCanTuneSolver] = useState(true);
  const [canModifyBuffer, setCanModifyBuffer] = useState(true);
  const [canDispatchEway, setCanDispatchEway] = useState(false);
  const [canManageTeam, setCanManageTeam] = useState(false);

  const fetchData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [wRes, rRes] = await Promise.all([
        fetch(`${API_BASE}/workforce/${orgId}`),
        fetch(`${API_BASE}/roles/${orgId}`)
      ]);
      if (wRes.ok) {
        const wData = await wRes.json();
        setMembers(wData);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        setRoles(rData);
        if (rData.length > 0 && !inviteRole) {
          setInviteRole(rData[0].name);
        }
      }
    } catch (e) {
      console.warn('Failed to load workforce:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, orgId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !inviteRole) return;
    try {
      const res = await fetch(`${API_BASE}/workforce/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          name: inviteName,
          email: inviteEmail,
          roleTitle: inviteRole,
          department: inviteDept
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Invitation failed');
      }
      setFeedback(`Team member ${inviteName} added as '${inviteRole}'.`);
      setInviteName('');
      setInviteEmail('');
      await fetchData();
      setTimeout(() => {
        setFeedback('');
        setActiveTab('roster');
      }, 1800);
    } catch (err: any) {
      setFeedback(err.message || 'Error sending invite');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    try {
      const res = await fetch(`${API_BASE}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          roleName: newRoleName,
          description: newRoleDesc,
          canApprove,
          canTuneSolver,
          canModifyBuffer,
          canDispatchEway,
          canManageTeam
        })
      });
      if (res.ok) {
        setFeedback(`Custom role '${newRoleName}' defined successfully.`);
        setNewRoleName('');
        setNewRoleDesc('');
        await fetchData();
        setTimeout(() => setFeedback(''), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Workforce & Role Governance
              </h3>
              <p className="text-xs text-slate-500">
                {orgName} • Define custom corporate roles and assign workforce access.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex gap-4 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('roster')}
            className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'roster'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Roster ({members.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'roles'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Custom Roles & Permissions ({roles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'invite'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Team Member</span>
          </button>
        </div>

        {feedback && (
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 text-center">
            {feedback}
          </div>
        )}

        {/* TAB 1: Roster */}
        {activeTab === 'roster' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Team Member</th>
                  <th className="py-2.5 px-3">Role Title</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {m.name}
                        {m.isOwner && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-200 text-slate-700">
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">{m.email}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {m.roleTitle}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {m.department}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Custom Roles Manager */}
        {activeTab === 'roles' && (
          <div className="space-y-5">
            {/* Roles Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Role Title</th>
                    <th className="py-2.5 px-2 text-center">Approve</th>
                    <th className="py-2.5 px-2 text-center">Tune Solver</th>
                    <th className="py-2.5 px-2 text-center">Modify Buffer</th>
                    <th className="py-2.5 px-2 text-center">e-Way Bill</th>
                    <th className="py-2.5 px-2 text-center">Manage Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roles.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{r.name}</div>
                        <div className="text-slate-400 text-[11px]">{r.description}</div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold">
                        {r.canApprove ? <Check className="w-3.5 h-3.5 text-slate-900 mx-auto" /> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold">
                        {r.canTuneSolver ? <Check className="w-3.5 h-3.5 text-slate-900 mx-auto" /> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold">
                        {r.canModifyBuffer ? <Check className="w-3.5 h-3.5 text-slate-900 mx-auto" /> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold">
                        {r.canDispatchEway ? <Check className="w-3.5 h-3.5 text-slate-900 mx-auto" /> : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold">
                        {r.canManageTeam ? <Check className="w-3.5 h-3.5 text-slate-900 mx-auto" /> : <span className="text-slate-300">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Create Custom Role Form */}
            {!hasTeamAuthority ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-slate-500 text-xs">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Role definition restricted. Only Organization Administrators or roles with 'Manage Team' permission can create custom roles.</span>
              </div>
            ) : (
              <form onSubmit={handleCreateRole} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-slate-700" />
                  <span>Define New Custom Role</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Role Title</label>
                    <input
                      type="text"
                      required
                      value={newRoleName}
                      onChange={e => setNewRoleName(e.target.value)}
                      placeholder="e.g. 3PL Transport Coordinator"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Description / Responsibility</label>
                    <input
                      type="text"
                      value={newRoleDesc}
                      onChange={e => setNewRoleDesc(e.target.value)}
                      placeholder="e.g. In charge of regional dispatch"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <span className="block font-medium text-slate-600 mb-1.5">Granular Authority:</span>
                  <div className="flex flex-wrap gap-4 text-slate-700">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canApprove}
                        onChange={e => setCanApprove(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span>Approve Spend & Recovery</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canTuneSolver}
                        onChange={e => setCanTuneSolver(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span>Tune OR-Tools Weights</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canModifyBuffer}
                        onChange={e => setCanModifyBuffer(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span>Modify DC Buffers</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canDispatchEway}
                        onChange={e => setCanDispatchEway(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span>Dispatch e-Way Bill</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canManageTeam}
                        onChange={e => setCanManageTeam(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span>Manage Team</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-1 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
                >
                  Save Role Definition
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: Add Team Member */}
        {activeTab === 'invite' && (
          !hasTeamAuthority ? (
            <div className="max-w-md mx-auto p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2 py-8">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-800 text-sm">Workforce Invitations Restricted</div>
              <p className="text-xs text-slate-500">
                You do not have permission to invite new workforce members. Contact your organization administrator to request access.
              </p>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-3.5 max-w-md mx-auto text-xs py-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Role</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={inviteDept}
                    onChange={e => setInviteDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
              >
                Add Member to Workspace
              </button>
            </form>
          )
        )}

      </div>
    </div>
  );
};
