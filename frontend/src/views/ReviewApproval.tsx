import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Bot, 
  CheckCircle2, 
  History, 
  Check, 
  X, 
  Edit3, 
  ShieldCheck, 
  Route, 
  Truck, 
  Sparkles, 
  Database,
  FileText,
  Lock
} from 'lucide-react';
import { ComplianceCheck, AuditTrailEvent, NavigationTab, DisruptionEvent } from '../types';
import { ModifyPlanModal } from '../components/ModifyPlanModal';

interface ReviewApprovalProps {
  complianceChecks: ComplianceCheck[];
  auditTrail: AuditTrailEvent[];
  isApproved: boolean;
  onApprove: () => void;
  onReject: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onModifySubmit?: (data: { bufferPct: number; carrier: string; notes: string }) => void;
  onOpenDispatch?: () => void;
  aiRationale?: string;
  canApprove?: boolean;
  canModifyBuffer?: boolean;
  canDispatchEway?: boolean;
  roleTitle?: string;
  selectedDisruption?: DisruptionEvent;
  selectedStrategyId?: string;
}

export const ReviewApproval: React.FC<ReviewApprovalProps> = ({
  complianceChecks,
  auditTrail,
  isApproved,
  onApprove,
  onReject,
  onNavigate,
  onModifySubmit,
  onOpenDispatch,
  aiRationale,
  canApprove = true,
  canModifyBuffer = true,
  canDispatchEway = true,
  roleTitle = 'Executive Lead',
  selectedDisruption,
  selectedStrategyId = 'strat-b'
}) => {
  const strategyCode = selectedStrategyId.replace('strat-', '').toUpperCase();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(`Strategy ${strategyCode} Approved & Executed! Carrier booking committed to SQLite.`);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [activeCarrier, setActiveCarrier] = useState('Dedicated R3 Reefer Fleet');

  const handleApproveClick = () => {
    onApprove();
    setToastMessage(`Strategy ${strategyCode} Approved & Executed! Carrier booking committed to SQLite database.`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const handleModifyPlanSave = (data: { bufferPct: number; carrier: string; notes: string }) => {
    setActiveCarrier(data.carrier);
    if (onModifySubmit) {
      onModifySubmit(data);
    }
    setToastMessage(`Plan Modified: Carrier set to "${data.carrier}" & Buffer ${data.bufferPct}%. Saved to SQLite.`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Notification for Simulated Execution */}
      {showSuccessToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <div>
            <div className="font-bold text-sm">Execution Status Confirmed</div>
            <div className="text-xs text-emerald-100">{toastMessage}</div>
          </div>
        </div>
      )}

      {/* Official GST e-Way Bill Dispatched Banner */}
      {isApproved && (
        <div className="bg-emerald-50/90 border-2 border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-950">
                  Form GST EWB-01 Dispatched to National Informatics Centre (NIC)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-900">
                  ACTIVE E-WAY BILL
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                Corridor R3 via NH-52 authorized • 3PL Carrier EDI (LR/AWB) generated • SAP S/4HANA delivery schedule updated.
              </p>
            </div>
          </div>

          {onOpenDispatch && (
            <button
              onClick={onOpenDispatch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>Inspect GST e-Way Bill & Dispatch</span>
            </button>
          )}
        </div>
      )}

      {/* Urgency Header Badges */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="w-3.5 h-3.5" />
          High-Impact Action Required
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 border border-slate-200 text-slate-700">
          Disruption ID: {selectedDisruption?.id || 'D-001'} ({selectedDisruption?.affectedRoute || selectedDisruption?.route || 'NH-48 Corridor'})
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Database className="w-3 h-3" />
          Audit Ledger: SQLite Sync
        </span>
      </div>

      {/* Page Title & Time to Impact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Review Recovery Strategy {strategyCode}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            AI Agent orchestrator requests approval for critical logistics re-routing on {selectedDisruption?.route || 'active corridor'}.
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-slate-400 font-medium">Generated: Just now</div>
          <div className="text-sm font-bold text-red-600 mt-0.5">
            Time to Impact: 14h 22m
          </div>
        </div>
      </div>

      {/* Main Grid: Content (8 cols) + Audit Trail (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Strategy Breakdown Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <Route className="w-4 h-4 text-blue-600" />
                <span>Strategy Breakdown</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Assigned Fleet: <strong className="text-slate-800">{activeCarrier}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  PRIMARY ACTION
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  Corridor R3
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Emergency stock from Pune Chakan (W2)</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  EST. COST IMPACT
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  ₹72k
                </div>
                <div className="text-xs text-red-600 font-medium mt-1">
                  ↗ +12% vs standard freight
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  FAILURE RISK
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  8%
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Within safe SLA thresholds</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Generated Rationale Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">AI-Generated Rationale</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                • Orchestrator Model v4.2
              </span>
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-xl text-sm text-slate-700 leading-relaxed space-y-3 font-normal">
              <p>
                {aiRationale || (
                  <>
                    The primary arterial corridor (Route NH-48) is currently compromised due to severe waterlogging reported between Surat and Bharuch. Strategy A (direct air cargo BOM → DEL) was evaluated but rejected by the <strong>Financial Agent</strong> due to exceeding emergency budget constraints (Cost: ₹1,85,000 vs ₹1,00,000 threshold).
                  </>
                )}
              </p>
              <p>
                <strong>Strategy B</strong> is recommended as the multi-criteria optimum because deploying emergency safety stock from Warehouse W2 (Pune Chakan) via Corridor R3 bypasses the Surat bottleneck while adhering to acceptable cost parameters (₹72,000). The 8% risk factor is primarily attributed to localized traffic near Indore, which the <strong>Logistics Agent</strong> models as manageable within current operational buffers.
              </p>
            </div>
          </div>

          {/* Multi-Agent Compliance Verification */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Multi-Agent Compliance Verification</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {complianceChecks.map((check) => (
                <div 
                  key={check.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{check.title}</div>
                    <div className="text-xs text-slate-500 mt-1 leading-normal">{check.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Audit Trail (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-bold text-slate-900">Audit Trail</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">UTC</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {auditTrail.map((ev, idx) => {
              const isRejected = ev.status === 'rejected';
              const isOptimal = ev.status === 'optimal';
              const isPending = ev.status === 'pending';

              return (
                <div key={idx} className="relative text-xs">
                  {/* Timeline bullet */}
                  <span 
                    className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                      isRejected 
                        ? 'bg-red-500' 
                        : isOptimal 
                        ? 'bg-blue-600 ring-blue-100' 
                        : isPending 
                        ? 'bg-blue-600 animate-pulse ring-blue-200' 
                        : 'bg-slate-400'
                    }`} 
                  />

                  <div className="font-mono text-[10px] text-slate-400 font-bold uppercase">
                    {ev.time} {ev.agent && `• ${ev.agent}`}
                  </div>

                  <div className={`mt-0.5 font-medium ${
                    isRejected 
                      ? 'text-red-600 line-through' 
                      : isOptimal 
                      ? 'text-blue-700 font-bold' 
                      : isPending 
                      ? 'text-blue-600 font-bold' 
                      : 'text-slate-800'
                  }`}>
                    {ev.action}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-8 py-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="text-xs text-slate-500 font-medium">
          Action cannot be undone. System will commit cryptographic signature to SQLite ledger and dispatch carrier bookings.
        </div>

        <div className="flex items-center gap-3">
          {/* Reject Action */}
          <button
            onClick={onReject}
            disabled={isApproved || !canApprove}
            className={`px-5 py-2.5 border rounded-xl font-semibold text-xs transition-colors ${
              !canApprove 
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-50'
            }`}
            title={!canApprove ? 'Rejection authority restricted to Approvers' : undefined}
          >
            Reject
          </button>

          {/* Modify Plan Action */}
          <button
            onClick={() => setIsModifyModalOpen(true)}
            disabled={isApproved || !canModifyBuffer}
            className={`inline-flex items-center gap-2 px-5 py-2.5 border rounded-xl font-semibold text-xs transition-colors ${
              !canModifyBuffer
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-50'
            }`}
            title={!canModifyBuffer ? 'Buffer modification restricted by role permissions' : undefined}
          >
            {!canModifyBuffer ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : <Edit3 className="w-3.5 h-3.5 text-slate-400" />}
            <span>Modify Plan</span>
          </button>

          {/* Approve Action */}
          {!canApprove ? (
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 border border-slate-200 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed select-none"
              title={`Approval authority restricted. Active role (${roleTitle}) cannot authorize recovery plans.`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign-Off Restricted</span>
            </div>
          ) : (
            <button
              onClick={handleApproveClick}
              disabled={isApproved}
              className={`inline-flex items-center gap-2 px-6 py-2.5 text-white font-semibold text-xs rounded-xl transition-all shadow-xs ${
                isApproved 
                  ? 'bg-slate-900 cursor-default' 
                  : 'bg-slate-900 hover:bg-slate-800 active:scale-95'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isApproved ? 'Approved & Dispatched' : 'Approve Recovery'}</span>
            </button>
          )}

          {/* GST e-Way Bill Action */}
          {isApproved && onOpenDispatch && (
            canDispatchEway ? (
              <button
                onClick={onOpenDispatch}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View GST e-Way Bill</span>
              </button>
            ) : (
              <div 
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed select-none"
                title="GST e-Way Bill viewing & dispatch restricted by role permissions"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Dispatch Restricted</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modify Plan Modal */}
      <ModifyPlanModal
        isOpen={isModifyModalOpen}
        onClose={() => setIsModifyModalOpen(false)}
        onSubmit={handleModifyPlanSave}
        canModifyBuffer={canModifyBuffer}
      />
    </div>
  );
};
