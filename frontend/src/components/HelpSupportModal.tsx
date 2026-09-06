import React from 'react';
import { X, Network, BookOpen, Route, ShieldCheck, Headphones, Cpu, Sparkles, Terminal } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'guide' | 'corridors' | 'support';
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'guide'
}) => {
  const [activeTab, setActiveTab] = React.useState<'guide' | 'corridors' | 'support'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                ResilientChain Platform Documentation
              </h2>
              <p className="text-xs text-slate-500">
                System architecture reference, freight corridors & support desk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'guide'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Architecture & Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('corridors')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'corridors'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Indian Freight Corridors</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'support'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Operations & Support</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed flex-1">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                  <Cpu className="w-4 h-4 text-slate-700" />
                  <span>Hybrid Neuro-Symbolic Philosophy</span>
                </div>
                <p className="text-slate-600">
                  ResilientChain AI strictly decouples deterministic mathematics from generative reasoning. Linear program solvers (Google OR-Tools / NetworkX) compute optimal paths, vehicle capacity constraints, and financial trade-offs mathematically with zero hallucination. Generative AI (Gemini 2.5 Flash) provides reasoning, regulatory interpretation, and human-readable trade-off narratives.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-xl bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                    <span>Multi-Agent Orchestrator</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Five autonomous agents (Sensing, Logistics, Inventory, Compliance, and Orchestrator) evaluate scenarios in parallel.
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-white">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                    <span>Cryptographic Ledger</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Every automated recommendation and human sign-off generates a SHA-256 tamper-evident audit record in SQLite.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-700" />
                  <span>Driver Mobile GPS & Telematics</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Drivers can access the mobile companion interface directly from their smartphones. Using HTML5 <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">navigator.geolocation</code>, the dispatch center streams real coordinates, velocity, MoRTH duty/break timers, and roadside SOS alerts.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'corridors' && (
            <div className="space-y-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                  <span>R1 (NH-48) • Western Golden Quadrilateral</span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono font-bold">CRITICAL CORRIDOR</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">Mumbai ↔ Surat ↔ Ahmedabad ↔ NCR (1,419 km)</div>
                <p className="text-slate-600 text-[11px] mt-1.5">
                  The primary manufacturing and automotive artery connecting Gujarat petrochemicals and Maharashtra sea freight to North India.
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                  <span>R2 • JNPT Container Port Link</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">MARITIME HUB</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">Nhava Sheva Terminal ↔ Panvel ↔ Pune Inland Container Depot</div>
                <p className="text-slate-600 text-[11px] mt-1.5">
                  Handles &gt;50% of India's containerized maritime trade with automated customs clearance checkpoints.
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                  <span>R3 (NH-52) • Central Industrial Bypass</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">RECOVERY ROUTE</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">Pune Chakan Hub ↔ Dhule ↔ Indore ↔ NCR</div>
                <p className="text-slate-600 text-[11px] mt-1.5">
                  Secondary high-capacity corridor utilized for emergency buffer drawdowns during coastal floods and highway bottlenecks.
                </p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                  <span>R4 (NH-44) • North-South Arterial</span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">NATIONAL ARTERY</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">Srinagar ↔ Delhi ↔ Hyderabad ↔ Bengaluru ↔ Kanyakumari</div>
                <p className="text-slate-600 text-[11px] mt-1.5">
                  India's longest national highway providing heavy freight connectivity across all peninsular logistics zones.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-900 text-sm mb-1">Incident Response Hotline</h4>
                <p className="text-slate-600 text-xs">
                  For active transit emergencies, hazardous cargo containment, or driver SOS incidents, contact the dedicated dispatch tower:
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono">
                  <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">TOLL FREE</span>
                    <strong className="text-slate-900">1800-RESILIENT (737-454)</strong>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">CONTROL DESK</span>
                    <strong className="text-slate-900">dispatch@resilientchain.ai</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Quick Demo Shortcut Guide</h4>
                <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                  <li><strong>Control Center:</strong> High-level resilience metrics and dynamic Leaflet GPS map.</li>
                  <li><strong>Simulate Incident:</strong> Test disruptions on standard corridors or custom company lanes.</li>
                  <li><strong>Driver Companion:</strong> Launch mobile phone simulator with live GPS coordinates and MoRTH duty clock.</li>
                  <li><strong>Dynamic Route Allotment:</strong> Click "Allot Route" on the map to pin origin/destinations with live OSRM routing.</li>
                  <li><strong>Review & Approvals:</strong> Authorize recovery plans with cryptographic audit log generation.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-[11px] text-slate-400">
            ResilientChain AI v0.3.0 • Enterprise Edition
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Reference
          </button>
        </div>

      </div>
    </div>
  );
};
