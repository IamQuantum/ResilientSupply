import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Radio, 
  Sparkles, 
  Building2, 
  FileText, 
  ChevronDown, 
  Zap, 
  User, 
  LogOut, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2,
  Sliders,
  Lock,
  Check,
  AlertTriangle,
  Smartphone,
  Compass
} from 'lucide-react';
import { UserProfile, OrganizationInfo, CustomRoleInfo, DisruptionEvent } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeDisruptionsCount?: number;
  backendConnected?: boolean;
  selectedDisruptionId: string;
  onSimulateDisruption: (id: string) => void;
  onOpenDocParser?: () => void;
  onOpenTelemetry?: () => void;
  onOpenWorkforce?: () => void;
  onOpenDispatch?: () => void;
  onOpenNetworkConfig?: () => void;
  onOpenCustomDisruption?: () => void;
  onOpenDriverApp?: () => void;
  onOpenCustomRoute?: () => void;
  disruptionsList?: DisruptionEvent[];
  onSignOut?: () => void;
  onSwitchToDemo?: () => void;
  activeOrg: OrganizationInfo | null;
  currentUser: UserProfile | null;
  hasActiveDispatch?: boolean;
  userPermissions?: CustomRoleInfo;
  availableTeam?: UserProfile[];
  onSwitchUser?: (user: UserProfile) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  activeDisruptionsCount = 1,
  backendConnected = true,
  selectedDisruptionId,
  onSimulateDisruption,
  onOpenDocParser,
  onOpenTelemetry,
  onOpenWorkforce,
  onOpenDispatch,
  onOpenNetworkConfig,
  onOpenCustomDisruption,
  onOpenDriverApp,
  onOpenCustomRoute,
  disruptionsList = [],
  onSignOut,
  onSwitchToDemo,
  activeOrg,
  currentUser,
  hasActiveDispatch = false,
  userPermissions,
  availableTeam = [],
  onSwitchUser
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);

  const actionsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setIsOrgMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      
      {/* Left: Active Company Pill & Dropdown */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={orgRef}>
          <button
            onClick={() => setIsOrgMenuOpen(prev => !prev)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold max-w-[180px] truncate">
              {activeOrg?.name || 'Tata Motors CV'}
            </span>
            {activeOrg?.isDemo && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-200 text-slate-700">
                DEMO
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Org Switcher Menu */}
          {isOrgMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-40 space-y-2.5 animate-in fade-in-50 duration-100">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Workspace</span>
                <div className="font-bold text-slate-900 text-xs mt-0.5">{activeOrg?.name}</div>
                <div className="text-[11px] text-slate-500">{activeOrg?.industry}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">GSTIN: {activeOrg?.gstin}</div>
              </div>

              <div className="space-y-1">
                {onOpenNetworkConfig && (
                  <button
                    onClick={() => { setIsOrgMenuOpen(false); onOpenNetworkConfig(); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manage DC Nodes & Lanes</span>
                  </button>
                )}

                {onOpenCustomDisruption && (
                  <button
                    onClick={() => { setIsOrgMenuOpen(false); onOpenCustomDisruption(); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Simulate Incident on Lanes</span>
                  </button>
                )}

                {onOpenWorkforce && (
                  <button
                    onClick={() => { setIsOrgMenuOpen(false); onOpenWorkforce(); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>Workforce Roles & Permissions</span>
                  </button>
                )}

                {onSwitchToDemo && !activeOrg?.isDemo && (
                  <button
                    onClick={() => { setIsOrgMenuOpen(false); onSwitchToDemo(); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2 border-t border-slate-100 mt-1 pt-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Switch to Benchmark Demo</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-sm mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search shipments, corridor lanes, or DC..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right Toolbar: Actions Menu + Notifications + User Menu */}
      <div className="flex items-center gap-3">
        {/* Direct Driver Mobile App Button */}
        {onOpenDriverApp && (
          <button
            type="button"
            onClick={onOpenDriverApp}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Driver Mobile App</span>
          </button>
        )}

        {/* Custom Real-Road Route Dispatcher Button */}
        {onOpenCustomRoute && (
          <button
            type="button"
            onClick={onOpenCustomRoute}
            title="Calculate and dispatch custom real-road routes with OSRM"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Build Road Route</span>
          </button>
        )}

        {/* Consolidated Actions Dropdown */}
        <div className="relative" ref={actionsRef}>
          <button
            onClick={() => setIsActionsOpen(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Actions & Tools</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {isActionsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-40 space-y-1 animate-in fade-in-50 duration-100">
              
              {/* Custom Disruption Simulation Trigger */}
              {onOpenCustomDisruption && (
                <button
                  onClick={() => { setIsActionsOpen(false); onOpenCustomDisruption(); }}
                  className="w-full text-left px-2.5 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-2 text-slate-900 border border-slate-200/80 mb-1"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <div className="font-bold">Simulate Incident on Network</div>
                    <div className="text-[10px] text-slate-500">Inject route outage & solve with OR-Tools</div>
                  </div>
                </button>
              )}

              {/* Telematics */}
              {onOpenTelemetry && (
                <button
                  onClick={() => { setIsActionsOpen(false); onOpenTelemetry(); }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg text-xs flex items-center gap-2 text-slate-800"
                >
                  <Radio className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="font-semibold">Live Telematics Radar</div>
                    <div className="text-[10px] text-slate-400">IoT fleet speeds & weather sensors</div>
                  </div>
                </button>
              )}

              {/* Driver Mobile App */}
              {onOpenDriverApp && (
                <button
                  onClick={() => { setIsActionsOpen(false); onOpenDriverApp(); }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg text-xs flex items-center gap-2 text-slate-800"
                >
                  <Smartphone className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="font-semibold">Driver Mobile App & Phone GPS</div>
                    <div className="text-[10px] text-slate-400">Hardware phone GPS, duty clock & SOS</div>
                  </div>
                </button>
              )}

              {/* Document Ingest */}
              {onOpenDocParser && (
                <button
                  onClick={() => { setIsActionsOpen(false); onOpenDocParser(); }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg text-xs flex items-center gap-2 text-slate-800"
                >
                  <Sparkles className="w-4 h-4 text-slate-600" />
                  <div>
                    <div className="font-semibold">AI Document Ingestion</div>
                    <div className="text-[10px] text-slate-400">Parse NHAI/JNPT circulars</div>
                  </div>
                </button>
              )}

              {/* GST e-Way Bill (if active) */}
              {hasActiveDispatch && onOpenDispatch && (
                <button
                  onClick={() => { setIsActionsOpen(false); onOpenDispatch(); }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg text-xs flex items-center gap-2 text-slate-800 border-t border-slate-100"
                >
                  <FileText className="w-4 h-4 text-slate-700" />
                  <div>
                    <div className="font-semibold">View Active GST e-Way Bill</div>
                    <div className="text-[10px] text-slate-400">Form GST EWB-01 & 3PL AWB</div>
                  </div>
                </button>
              )}

              {/* Simulation Quick Switcher */}
              <div className="pt-2 border-t border-slate-100 px-2.5 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Simulation Scenario:
                </span>
                <select
                  value={selectedDisruptionId}
                  onChange={(e) => { onSimulateDisruption(e.target.value); setIsActionsOpen(false); }}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none"
                >
                  {disruptionsList && disruptionsList.length > 0 ? (
                    disruptionsList.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.id}: {d.route} ({d.severity})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="D-001">D-001: NH-48 Surat Corridor (Critical)</option>
                      <option value="D-002">D-002: JNPT Port Congestion (High)</option>
                      <option value="D-003">D-003: Western Ghats Monsoon (Medium)</option>
                    </>
                  )}
                </select>
              </div>

            </div>
          )}
        </div>

        {/* Subtle Notification Bell */}
        <button 
          title="Notifications"
          className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
          {activeDisruptionsCount > 0 && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-slate-900 rounded-full" />
          )}
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className="relative pl-1 border-l border-slate-200" ref={userRef}>
          <button
            onClick={() => setIsUserMenuOpen(prev => !prev)}
            className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {currentUser?.roleTitle || 'Supply Chain Lead'}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 z-40 space-y-2 text-xs animate-in fade-in-50 duration-100 font-sans">
              {/* Profile Header */}
              <div className="p-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">{currentUser?.name}</span>
                  {currentUser?.isOwner && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-900 text-white">
                      OWNER
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser?.email}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{currentUser?.roleTitle}</div>
              </div>

              {/* Role Permissions Matrix */}
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Role Authority
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <div className={`flex items-center gap-1 font-medium ${userPermissions?.canApprove ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                    {userPermissions?.canApprove ? <Check className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                    <span>Approve Plans</span>
                  </div>
                  <div className={`flex items-center gap-1 font-medium ${userPermissions?.canTuneSolver ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                    {userPermissions?.canTuneSolver ? <Check className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                    <span>Tune Solver</span>
                  </div>
                  <div className={`flex items-center gap-1 font-medium ${userPermissions?.canModifyBuffer ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                    {userPermissions?.canModifyBuffer ? <Check className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                    <span>Modify Buffer</span>
                  </div>
                  <div className={`flex items-center gap-1 font-medium ${userPermissions?.canDispatchEway ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                    {userPermissions?.canDispatchEway ? <Check className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                    <span>Dispatch e-Way</span>
                  </div>
                  <div className={`flex items-center gap-1 font-medium col-span-2 ${userPermissions?.canManageTeam ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                    {userPermissions?.canManageTeam ? <Check className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                    <span>Manage Team & Roles</span>
                  </div>
                </div>
              </div>

              {/* Persona Switcher (RBAC Live Simulator) */}
              {availableTeam.length > 1 && onSwitchUser && (
                <div className="p-2 border border-slate-200 bg-white rounded-lg space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Simulate Member (Test RBAC):
                  </span>
                  <select
                    value={currentUser?.id}
                    onChange={(e) => {
                      const found = availableTeam.find(m => m.id === e.target.value);
                      if (found) onSwitchUser(found);
                    }}
                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none"
                  >
                    {availableTeam.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.roleTitle}{m.isOwner ? ' • Owner' : ''})
                      </option>
                    ))}
                  </select>
                  <div className="text-[9px] text-slate-400">
                    Switch active account to inspect live permission enforcement.
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="space-y-0.5 pt-1">
                {onOpenWorkforce && (
                  <button
                    onClick={() => { setIsUserMenuOpen(false); onOpenWorkforce(); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Workforce & Roles</span>
                  </button>
                )}

                {onOpenNetworkConfig && (
                  <button
                    onClick={() => { setIsUserMenuOpen(false); onOpenNetworkConfig(); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Supply Chain Facilities</span>
                  </button>
                )}

                {onSignOut && (
                  <button
                    onClick={() => { setIsUserMenuOpen(false); onSignOut(); }}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border-t border-slate-100 mt-1 pt-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
