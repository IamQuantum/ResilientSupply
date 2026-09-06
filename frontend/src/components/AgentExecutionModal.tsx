import React, { useEffect, useState } from 'react';
import { Bot, CheckCircle2, Cpu, Loader2, ShieldCheck, Sparkles, X } from 'lucide-react';

interface AgentExecutionModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  { agent: 'Sensing & Scenario Agent', action: 'Intercepted NH-48 sensory stall. Mapped 5 critical shipments at risk.', delay: 400 },
  { agent: 'Inventory Agent', action: 'Inspected Chakan W2 buffer: 80 emergency units available (> 15% safety threshold).', delay: 900 },
  { agent: 'Logistics Agent', action: 'Queried corridor R3 reefer fleet telematics: active temperature control confirmed.', delay: 1400 },
  { agent: 'Google OR-Tools Solver', action: 'Executed Mixed-Integer multi-objective optimization (Cost + Delivery + Risk).', delay: 1900 },
  { agent: 'Compliance & Policy Agent', action: 'Validated GST e-Way bills, customs indemnity, and SLA compensation ceiling.', delay: 2400 },
  { agent: 'Orchestrator Agent', action: 'Drafted executive justification memo for Strategy B and compiled cryptographic audit log.', delay: 2900 }
];

export const AgentExecutionModal: React.FC<AgentExecutionModalProps> = ({ isOpen, onComplete }) => {
  const [completedSteps, setCompletedSteps] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setCompletedSteps(0);
      return;
    }

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setCompletedSteps(idx + 1);
        if (idx === steps.length - 1) {
          setTimeout(() => {
            onComplete();
          }, 600);
        }
      }, step.delay);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Cpu className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Multi-Agent Autonomous Pipeline
              </h3>
              <p className="text-xs text-slate-500">
                Coordinating specialized agents and Google OR-Tools optimization solver...
              </p>
            </div>
          </div>
        </div>

        {/* Streaming Steps */}
        <div className="space-y-3 font-mono text-xs">
          {steps.map((s, idx) => {
            const isDone = completedSteps > idx;
            const isCurrent = completedSteps === idx;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : isCurrent
                    ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200/60 text-slate-400 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 block" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-bold flex items-center justify-between">
                    <span className="font-sans text-xs">{s.agent}</span>
                    <span className="text-[10px] uppercase">{isDone ? 'Validated' : isCurrent ? 'Computing...' : 'Queued'}</span>
                  </div>
                  <div className="mt-0.5 font-sans text-xs opacity-90">{s.action}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Progress */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Deterministic execution in progress</span>
          <span className="font-mono text-blue-600 font-bold">
            {Math.min(100, Math.round((completedSteps / steps.length) * 100))}% Complete
          </span>
        </div>
      </div>
    </div>
  );
};
