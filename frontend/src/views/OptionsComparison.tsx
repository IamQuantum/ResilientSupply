import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plane, 
  Lightbulb, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Check, 
  SlidersHorizontal, 
  Cpu,
  Lock
} from 'lucide-react';
import { RecoveryStrategy, OptimizationWeight, NavigationTab } from '../types';

interface OptionsComparisonProps {
  strategies: RecoveryStrategy[];
  weights: OptimizationWeight[];
  selectedStrategyId: string;
  onSelectStrategy: (id: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onUpdateWeights?: (weights: Record<string, number>) => void;
  aiRationale?: string;
  canTuneSolver?: boolean;
}

export const OptionsComparison: React.FC<OptionsComparisonProps> = ({
  strategies,
  weights,
  selectedStrategyId,
  onSelectStrategy,
  onNavigate,
  onUpdateWeights,
  aiRationale,
  canTuneSolver = true
}) => {
  const selectedStrategy = strategies.find(s => s.id === selectedStrategyId) || strategies[1];
  
  // Local state for weight sliders
  const [sliderWeights, setSliderWeights] = useState({
    delivery: 40,
    cost: 30,
    inventory: 20,
    compliance: 10
  });

  const handleSliderChange = (key: keyof typeof sliderWeights, val: number) => {
    const updated = { ...sliderWeights, [key]: val };
    setSliderWeights(updated);
    if (onUpdateWeights) {
      onUpdateWeights({
        delivery: updated.delivery / 100,
        cost: updated.cost / 100,
        inventory: updated.inventory / 100,
        compliance: updated.compliance / 100
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button link */}
      <div>
        <button
          onClick={() => onNavigate('analysis')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Incident Details</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recovery Options Comparison</h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare deterministic optimization recovery strategies calculated by Google OR-Tools.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>MIP Re-routing Engine Active</span>
        </div>
      </div>

      {/* Main Grid: Comparison & Impact (Left) + Why Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Strategy Comparison Table Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Strategy Comparison</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Select a strategy to inspect constraints</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-5">Strategy</th>
                    <th className="py-3 px-5">Corridor Route</th>
                    <th className="py-3 px-5">Cost (₹)</th>
                    <th className="py-3 px-5">Risk</th>
                    <th className="py-3 px-5">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {strategies.map((strat) => {
                    const isSelected = selectedStrategyId === strat.id;
                    return (
                      <tr
                        key={strat.id}
                        onClick={() => onSelectStrategy(strat.id)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-l-4 border-l-blue-600 font-medium'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{strat.name}</span>
                            {strat.badge && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-600 text-white tracking-wider shadow-xs">
                                {strat.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{strat.type}</div>
                        </td>

                        <td className="py-4 px-5 text-slate-700 font-medium">
                          {strat.route}
                        </td>

                        <td className="py-4 px-5 font-bold text-slate-900 font-mono">
                          {strat.cost}
                        </td>

                        <td className="py-4 px-5">
                          {strat.risk === 'Low' && (
                            <span className="text-blue-600 font-semibold text-xs">Low</span>
                          )}
                          {strat.risk === 'Medium' && (
                            <span className="text-amber-600 font-semibold text-xs">Medium</span>
                          )}
                          {strat.risk === 'High' && (
                            <span className="text-red-600 font-semibold text-xs">High</span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-slate-900 font-semibold">
                          {strat.delivery}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory & Compliance Impact Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Inventory & Compliance Impact ({selectedStrategy.name})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  INVENTORY ACTION
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  Drawdown Buffer Stock at Pune Chakan (W2)
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Buffer remains &gt; 15% safety threshold</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  COMPLIANCE
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  Maintains Tier-1 SLA & GST e-Way
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Avoids late delivery penalty clauses</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Why Strategy Card with Interactive Sliders (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Why {strategies.find(s => s.isRecommended)?.name || 'Strategy B'}?
            </h3>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {aiRationale || 
              "Strategy B is recommended because it provides the optimal balance between mitigating delivery risk and maintaining compliance SLAs, despite higher immediate transportation costs. Drawing emergency stock from Chakan W2 prevents critical inventory stockouts in NCR."
            }
          </p>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                <span>Optimization Tuning</span>
              </div>
              {canTuneSolver ? (
                <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded">Interactive</span>
              ) : (
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              )}
            </div>

            {/* Locked Warning Banner */}
            {!canTuneSolver && (
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-medium">
                <Lock className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                <span>Weight tuning restricted. Calibration is limited to authorized Logistics Planners.</span>
              </div>
            )}

            {/* Interactive Sliders */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Delivery Speed (Risk)</span>
                  <span className="font-mono font-bold text-slate-900">{sliderWeights.delivery}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  disabled={!canTuneSolver}
                  value={sliderWeights.delivery}
                  onChange={(e) => handleSliderChange('delivery', Number(e.target.value))}
                  className={`w-full accent-slate-900 h-1.5 bg-slate-100 rounded-lg ${!canTuneSolver ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Cost Economy</span>
                  <span className="font-mono font-bold text-slate-700">{sliderWeights.cost}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  disabled={!canTuneSolver}
                  value={sliderWeights.cost}
                  onChange={(e) => handleSliderChange('cost', Number(e.target.value))}
                  className={`w-full accent-slate-700 h-1.5 bg-slate-100 rounded-lg ${!canTuneSolver ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Inventory Impact</span>
                  <span className="font-mono font-bold text-slate-700">{sliderWeights.inventory}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  disabled={!canTuneSolver}
                  value={sliderWeights.inventory}
                  onChange={(e) => handleSliderChange('inventory', Number(e.target.value))}
                  className={`w-full accent-slate-600 h-1.5 bg-slate-100 rounded-lg ${!canTuneSolver ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Regulatory Compliance</span>
                  <span className="font-mono font-bold text-slate-700">{sliderWeights.compliance}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  disabled={!canTuneSolver}
                  value={sliderWeights.compliance}
                  onChange={(e) => handleSliderChange('compliance', Number(e.target.value))}
                  className={`w-full accent-slate-500 h-1.5 bg-slate-100 rounded-lg ${!canTuneSolver ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA to Validation */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => onNavigate('approvals')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
        >
          <span>Continue to Validation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
