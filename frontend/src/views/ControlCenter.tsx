import React from 'react';
import { 
  AlertTriangle, 
  Truck, 
  Package, 
  CheckSquare, 
  Eye, 
  History, 
  Bot, 
  Clock, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  Edit3, 
  Sparkles,
  Lock
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { NavigationTab, DisruptionEvent, CustomerNode, CustomerRoute } from '../types';
import { FreightNetworkMap } from '../components/FreightNetworkMap';

interface ControlCenterProps {
  onNavigate: (tab: NavigationTab) => void;
  onQuickApprove: () => void;
  pendingApprovalsCount: number;
  onTriggerAgentSim?: () => void;
  canApprove?: boolean;
  selectedDisruption?: DisruptionEvent;
  onOpenCustomDisruption?: () => void;
  disruptionsCount?: number;
  customNodes?: CustomerNode[];
  customRoutes?: CustomerRoute[];
  orgId?: string;
  orgName?: string;
  onRouteAllotted?: () => void;
  onSimulateDisruptionOnLane?: (routeCode: string) => void;
  onOpenDriverApp?: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  onNavigate,
  onQuickApprove,
  pendingApprovalsCount,
  onTriggerAgentSim,
  canApprove = true,
  selectedDisruption,
  onOpenCustomDisruption,
  disruptionsCount = 1,
  customNodes = [],
  customRoutes = [],
  orgId = 'tata-motors',
  orgName = 'Tata Motors CV',
  onRouteAllotted,
  onSimulateDisruptionOnLane,
  onOpenDriverApp
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Control Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time India supply chain resilience overview & autonomous agent orchestrator
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCustomDisruption && (
            <button
              onClick={onOpenCustomDisruption}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Incident</span>
            </button>
          )}

          {onTriggerAgentSim && (
            <button
              onClick={onTriggerAgentSim}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              <span>Agent Pipeline Run</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Disruptions"
          value={String(disruptionsCount)}
          icon={AlertTriangle}
          borderColorClass="border-l-red-500"
          iconColorClass="text-red-500"
          onClick={() => onNavigate('monitor')}
        />
        <MetricCard
          title="At-Risk Shipments"
          value={String(selectedDisruption?.affectedShipments || 5)}
          icon={Truck}
          borderColorClass="border-l-amber-500"
          iconColorClass="text-amber-500"
          onClick={() => onNavigate('analysis')}
        />
        <MetricCard
          title="Stock-Out Risk"
          value={`${selectedDisruption?.stockOutRisk || 72}%`}
          icon={Package}
          borderColorClass="border-l-red-500"
          iconColorClass="text-red-500"
          onClick={() => onNavigate('analysis')}
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingApprovalsCount}
          icon={CheckSquare}
          borderColorClass="border-l-blue-600"
          iconColorClass="text-blue-600"
          onClick={() => onNavigate('approvals')}
        />
      </div>

      {/* Interactive Topology Freight Map */}
      <FreightNetworkMap
        activeRoute={selectedDisruption?.route || 'R1'}
        customNodes={customNodes}
        customRoutes={customRoutes}
        orgId={orgId}
        orgName={orgName}
        onRouteAllotted={onRouteAllotted}
        onSimulateDisruptionOnLane={onSimulateDisruptionOnLane}
        onOpenDriverApp={onOpenDriverApp}
      />

      {/* Disruption Alert & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Disruption Banner (2 cols) */}
        <div className="lg:col-span-2 bg-red-50/80 border border-red-200/90 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 text-red-800 font-bold tracking-wide uppercase text-sm mb-4">
              <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Critical Disruption: {selectedDisruption?.affectedRoute || 'Western Freight Corridor'}</span>
            </div>

            {/* Inner Content Card */}
            <div className="bg-white rounded-xl p-5 border border-red-100 shadow-xs mb-5">
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                {selectedDisruption?.description || 'Route R1 (NH-48) blocked between Surat and Bharuch.'}
              </h3>
              <div className="text-xs text-slate-500 mb-4 font-medium">
                Corridor Code: <span className="font-mono font-bold text-slate-800">{selectedDisruption?.route || 'R1'}</span> • Event: {selectedDisruption?.eventType || 'Route Blocked'}
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Affected Shipments
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">{selectedDisruption?.affectedShipments || 5}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Expected Delay
                  </div>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">{selectedDisruption?.estimatedDelay || '2 days'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Stock-Out Risk
                  </div>
                  <div className="text-xl font-bold text-red-600 mt-0.5">{selectedDisruption?.stockOutRisk || 72}%</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('analysis')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              <Eye className="w-4 h-4" />
              <span>View Impact & Scenario</span>
            </button>
          </div>

          {/* Decorative watermarked shape */}
          <div className="absolute right-4 bottom-2 opacity-5 pointer-events-none text-red-900">
            <AlertTriangle className="w-48 h-48" />
          </div>
        </div>

        {/* Recent Activity Card (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            <History className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-4 space-y-4 flex-1">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Disruption detected on NH-48</div>
                <div className="text-xs text-slate-400">2 mins ago</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Scenario calculated</div>
                <div className="text-xs text-slate-400">AI Sensing Agent • 1 min ago</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Options generated</div>
                <div className="text-xs text-slate-400">Google OR-Tools Solver • Just now</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <CheckSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Approval requested</div>
                <div className="text-xs text-blue-600 font-medium">Awaiting Human Review</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Generated Recommendation Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              AI-Generated Recommendation
            </span>
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-extrabold uppercase rounded tracking-wider shadow-xs">
              Optimal
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Strategy B: Reroute through Corridor R3 (via Pune Chakan W2)
          </h3>

          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Utilizing alternate regional hub R3 avoids the Surat bottleneck on NH-48, minimizing transit delay while keeping stock-out risk within safe contractual SLA parameters.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-sm">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-medium">Delay:</span>
              <span className="font-semibold text-slate-900">1 day</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Banknote className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 font-medium">Add. Cost:</span>
              <span className="font-semibold text-slate-900">₹72,000</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-500 font-medium">New Risk:</span>
              <span className="font-semibold text-emerald-700">8%</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          {!canApprove ? (
            <div 
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 border border-slate-200 text-slate-400 rounded-lg text-sm font-semibold cursor-not-allowed select-none"
              title="Approval authority restricted. Only authorized executive roles can sign off recovery plans."
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Approval Restricted</span>
            </div>
          ) : (
            <button
              onClick={onQuickApprove}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Recommendation</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('options')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Request Modification</span>
          </button>
        </div>
      </div>
    </div>
  );
};
