import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  Banknote, 
  Users, 
  Warehouse, 
  CheckCircle2, 
  Sparkles, 
  Route, 
  ChevronRight 
} from 'lucide-react';
import { NavigationTab, WarehouseNode, BusinessProjection } from '../types';

interface ScenarioAnalysisProps {
  warehouseNodes: WarehouseNode[];
  projections: BusinessProjection[];
  onNavigate: (tab: NavigationTab) => void;
  onTriggerAgentSim?: () => void;
}

export const ScenarioAnalysis: React.FC<ScenarioAnalysisProps> = ({
  warehouseNodes,
  projections,
  onNavigate,
  onTriggerAgentSim
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scenario Analysis</h1>
          <p className="text-sm text-slate-500 mt-1">
            Understand the operational impact of disruption D-001.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 border border-red-200 text-red-700 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            Active Incident
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 border border-slate-200 text-slate-700">
            ID: D-001
          </span>
        </div>
      </div>

      {/* Incident Header Banner */}
      <div className="bg-white border border-slate-200 border-l-4 border-l-red-500 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100/70 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <Route className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-700 tracking-tight">
              ROUTE R1 (NH-48) BLOCKED
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Surat-Bharuch arterial transit corridor compromised due to bridge repair and waterlogging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 shrink-0 text-center">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AFFECTED</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">5 Shipments</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RISK LEVEL</div>
            <div className="text-lg font-bold text-red-600 mt-0.5">72%</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EST. DELAY</div>
            <div className="text-lg font-bold text-amber-700 mt-0.5">2 Days</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Delay */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-semibold text-slate-700">Delay</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">+48h</div>
            <div className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
              <span>↗ Critical deviation from SLA</span>
            </div>
          </div>
        </div>

        {/* Stock-Out % */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-semibold text-slate-700">Stock-Out %</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">14.5%</div>
            <div className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <span>⚠ Approaching threshold</span>
            </div>
          </div>
        </div>

        {/* Additional Cost */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-semibold text-slate-700">Additional Cost</span>
            <Banknote className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">₹42.5k</div>
            <div className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
              <span>↗ Estimated penalty & expedite</span>
            </div>
          </div>
        </div>

        {/* Affected Customers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-sm font-semibold text-slate-700">Affected Cust.</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">3 Tier-1</div>
            <div className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
              <span>ⓘ Impacted standing orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Impact Projection & Inventory Impact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Business Impact Projection (Left 7 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Business Impact Projection</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Baseline vs Post-Disruption (D-001)</p>
          </div>

          <div className="space-y-6">
            {projections.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>{item.label}</span>
                </div>

                {/* Dual Bars */}
                <div className="space-y-2">
                  {/* Baseline Bar */}
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-48 bg-slate-100 rounded-full overflow-hidden shrink-0">
                      <div 
                        className="h-full bg-slate-400 rounded-full" 
                        style={{ width: `${item.baselineValue}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-mono font-medium">
                      {item.baselineText}
                    </span>
                  </div>

                  {/* Impact Bar */}
                  <div className="flex items-center gap-3">
                    <div className="h-3.5 flex-1 bg-red-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-700`} 
                        style={{ width: `${item.impactValue}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-mono shrink-0">
                      {item.impactText}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Impact (Right 4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-base font-bold text-slate-900">Inventory Impact</h3>
            <Warehouse className="w-4 h-4 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2">NODE</th>
                  <th className="pb-2">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {warehouseNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-50/60">
                    <td className="py-3 pr-2">
                      <div className="font-bold text-slate-900">{node.name}</div>
                      <div className="text-[11px] text-slate-400">{node.type}</div>
                    </td>
                    <td className="py-3">
                      {node.statusType === 'danger' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 border border-red-200 text-red-700">
                          <AlertTriangle className="w-3 h-3" />
                          {node.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          {node.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Status & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-blue-700 font-semibold px-3 py-1.5 bg-blue-50/80 rounded-lg border border-blue-100">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>AI Orchestrator analyzing recovery feasibility...</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('monitor')}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors"
          >
            Dismiss Scenario
          </button>
          <button
            onClick={() => {
              if (onTriggerAgentSim) {
                onTriggerAgentSim();
              } else {
                onNavigate('options');
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Recovery Options</span>
          </button>
        </div>
      </div>
    </div>
  );
};
