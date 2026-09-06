import React, { useState } from 'react';
import { 
  TrendingUp, 
  Filter, 
  Clock, 
  Hourglass, 
  AlertTriangle, 
  Banknote, 
  Compass, 
  X, 
  CheckCircle2, 
  ChevronRight,
  Radio 
} from 'lucide-react';
import { DisruptionEvent, NavigationTab } from '../types';

interface DisruptionMonitorProps {
  disruptions: DisruptionEvent[];
  selectedDisruption?: DisruptionEvent;
  onSelectDisruption: (d: DisruptionEvent) => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenTelemetry?: () => void;
  onOpenCustomDisruption?: () => void;
}

export const DisruptionMonitor: React.FC<DisruptionMonitorProps> = ({
  disruptions = [],
  selectedDisruption,
  onSelectDisruption,
  onNavigate,
  onOpenTelemetry,
  onOpenCustomDisruption
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const safeDisruptions = Array.isArray(disruptions) ? disruptions : [];

  const filteredDisruptions = safeDisruptions.filter(d => {
    if (!d) return false;
    if (filterSeverity === 'all') return true;
    return (d.severity || '').toLowerCase() === filterSeverity.toLowerCase();
  });

  const activeDisruption: DisruptionEvent | undefined = 
    selectedDisruption || filteredDisruptions[0] || safeDisruptions[0];

  const totalActive = safeDisruptions.length;
  const criticalCount = safeDisruptions.filter(d => (d?.severity || '').toLowerCase() === 'critical').length;

  const timeline = (activeDisruption?.timeline && Array.isArray(activeDisruption.timeline) && activeDisruption.timeline.length > 0)
    ? activeDisruption.timeline
    : [
        {
          title: 'Incident Telematics Logged',
          description: activeDisruption?.description || 'Corridor anomaly flagged by automated sensors',
          time: activeDisruption?.time || 'Just now'
        },
        {
          title: 'OR-Tools Optimization Evaluated',
          description: 'MILP rerouting algorithm computed alternative DC nodes and lead times',
          time: 'T+2m'
        }
      ];

  return (
    <div className="space-y-6">
      {/* Header with Top-Right Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Disruption Monitor</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of active supply chain disruptions and recommended mitigations.
          </p>
        </div>

        {/* Top-Right KPI Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs flex items-center gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                TOTAL ACTIVE
              </div>
              <div className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                {totalActive}
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-red-50/80 border border-red-200 rounded-xl px-4 py-2.5 shadow-xs flex items-center gap-3">
            <div>
              <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                CRITICAL <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              </div>
              <div className="text-xl font-bold text-red-700">
                {criticalCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table (Left) + Detailed Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Events Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Active Events</h2>
            <div className="flex items-center gap-2">
              {onOpenCustomDisruption && (
                <button
                  onClick={onOpenCustomDisruption}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Incident</span>
                </button>
              )}
              {onOpenTelemetry && (
                <button
                  onClick={onOpenTelemetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  <span>Live Telematics</span>
                </button>
              )}
              <button 
                onClick={() => setFilterSeverity(prev => prev === 'all' ? 'critical' : 'all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors ${
                  filterSeverity !== 'all' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{filterSeverity === 'all' ? 'Filter' : 'Filtered: Critical'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Impact</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDisruptions.map((disruption) => {
                  const isSelected = activeDisruption?.id === disruption.id;
                  return (
                    <tr
                      key={disruption.id}
                      onClick={() => onSelectDisruption(disruption)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/60 border-l-4 border-l-blue-600' 
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {disruption.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {disruption.eventType}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-mono font-semibold">
                          {disruption.route}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {disruption.severity === 'Critical' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            Critical
                          </span>
                        )}
                        {disruption.severity === 'High' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            High
                          </span>
                        )}
                        {disruption.severity === 'Medium' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            Medium
                          </span>
                        )}
                        {disruption.severity !== 'Critical' && disruption.severity !== 'High' && disruption.severity !== 'Medium' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            {disruption.severity || 'Notice'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                        {disruption.impact}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                        {disruption.time}
                      </td>
                      <td className="py-3.5 px-2 text-slate-400">
                        <ChevronRight className="w-4 h-4" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Incident Drawer / Card (Right) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          {activeDisruption ? (
            <>
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeDisruption.id}: {activeDisruption.eventType}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700">
                      • {activeDisruption.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activeDisruption.time}
                    </span>
                    <span>
                      Affected Route: <strong className="text-slate-700">{activeDisruption.affectedRoute || activeDisruption.route}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-full border border-amber-200 text-[10px]">
                      {activeDisruption.affectedShipments} Shipments
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Box */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </div>
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm text-slate-700 leading-relaxed font-normal">
                  {activeDisruption.description}
                </div>
              </div>

              {/* Predicted Impact Summary */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Predicted Impact Summary
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-xs">
                    <Hourglass className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                    <div className="text-lg font-bold text-slate-900">{activeDisruption.estimatedDelay}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Estimated Delay</div>
                  </div>

                  <div className="bg-red-50/60 border border-red-200 rounded-xl p-3.5 text-center shadow-xs">
                    <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1.5" />
                    <div className="text-lg font-bold text-red-700">{activeDisruption.stockOutRisk}%</div>
                    <div className="text-[11px] text-red-600 font-medium">Stock-out Risk</div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-xs">
                    <Banknote className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                    <div className="text-lg font-bold text-slate-900">{activeDisruption.additionalCost}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Additional Cost</div>
                  </div>
                </div>
              </div>

              {/* Incident Timeline */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>Incident Timeline</span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-900">{step.title}</div>
                        <div className="text-[11px] font-mono text-slate-400">{step.time}</div>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{step.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTA Button */}
              <button
                onClick={() => onNavigate('options')}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>Analyze Recovery Options</span>
              </button>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400">
              No disruption selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
