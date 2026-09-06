import React, { useState } from 'react';
import { Edit3, X, Check, Truck, Warehouse, FileText, Lock } from 'lucide-react';

interface ModifyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { bufferPct: number; carrier: string; notes: string }) => void;
  canModifyBuffer?: boolean;
}

export const ModifyPlanModal: React.FC<ModifyPlanModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  canModifyBuffer = true 
}) => {
  const [bufferPct, setBufferPct] = useState<number>(20);
  const [carrier, setCarrier] = useState<string>('Dedicated R3 Reefer Fleet (Allcargo Express)');
  const [notes, setNotes] = useState<string>('Authorized priority green corridor clearance at Indore bypass.');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Modify Recovery Plan (Human Override)
              </h3>
              <p className="text-[11px] text-slate-400">Calibrate corridor buffer and carrier assignment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs">
          {/* Buffer Drawdown Slider */}
          <div className={`p-3 rounded-xl border ${canModifyBuffer ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200 bg-slate-100/70'}`}>
            <div className="flex justify-between items-center font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-slate-600" />
                Pune Chakan (W2) Buffer Drawdown:
              </span>
              <span className="text-sm font-mono text-slate-900">{bufferPct}%</span>
            </div>
            
            {!canModifyBuffer && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-lg mb-2">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Buffer override restricted. Your role lacks buffer modification authority.</span>
              </div>
            )}

            <input
              type="range"
              min="10"
              max="40"
              step="5"
              disabled={!canModifyBuffer}
              value={bufferPct}
              onChange={(e) => setBufferPct(Number(e.target.value))}
              className={`w-full accent-slate-900 ${!canModifyBuffer ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>10% (Conservative)</span>
              <span>25% (Standard)</span>
              <span>40% (Aggressive)</span>
            </div>
          </div>

          {/* Carrier Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-slate-600" />
              Designated Carrier & Fleet Partner:
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
            >
              <option value="Dedicated R3 Reefer Fleet (Allcargo Express)">Dedicated R3 Reefer Fleet (Allcargo Express)</option>
              <option value="TCI Express High-Priority Freight">TCI Express High-Priority Freight</option>
              <option value="Gati KWE Cold-Chain Logistics">Gati KWE Cold-Chain Logistics</option>
              <option value="Mahindra Logistics Emergency Inter-State Shuttle">Mahindra Logistics Emergency Inter-State Shuttle</option>
            </select>
          </div>

          {/* Operational Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600" />
              Human Planner Dispatch Instructions:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400 resize-none"
              placeholder="Enter special instructions or SLA override notes..."
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit({ bufferPct, carrier, notes });
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Apply Plan Modification</span>
          </button>
        </div>
      </div>
    </div>
  );
};
