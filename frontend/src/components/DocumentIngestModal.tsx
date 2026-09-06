import React, { useState } from 'react';
import { Bot, FileText, Sparkles, X, CheckCircle2, ArrowRight, Shield, AlertTriangle } from 'lucide-react';

interface DocumentIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeployDisruption: (disruptionData: any) => void;
}

const SAMPLE_TEMPLATES = [
  {
    name: 'NHAI Official Monsoon Circular (NH-48)',
    text: `OFFICIAL NHAI ADVISORY [WEST ZONE - GUJARAT / MAHARASHTRA]:
Emergency Bridge Maintenance & Flash Inundation reported between Surat and Bharuch on NH-48 (KM 198 to 215).
Heavy commercial motor freight transit completely halted. Over 6 high-value consignments carrying automotive powertrains and pharmaceutical supplies are halted.
Estimated clearance duration: 48 hours. Logistics operators instructed to utilize interior bypass corridors.`
  },
  {
    name: 'JNPT Maritime Berth Congestion Circular',
    text: `JAWAHARLAL NEHRU PORT AUTHORITY (JNPT) OPERATIONAL NOTICE:
Berth occupancy has reached 98% with 18 container vessels currently queued in anchorage.
Average gate-in dwell time increased to 96 hours. Inbound customs clearance backlog cascading to western ICD rail sidings. Expect 4 days delay on all sea-to-rail container transfers.`
  },
  {
    name: 'IMD Western Ghats Landslide Advisory',
    text: `INDIAN METEOROLOGICAL DEPARTMENT FREIGHT VELOCITY BULLETIN:
Red alert issued for Western Ghats mountain pass on NH-66. Debris clearance ongoing between Ratnagiri and Kolhapur. Commercial truck movement restricted to single lane convoy speed. Expect 24 to 36 hours transit delay.`
  }
];

export const DocumentIngestModal: React.FC<DocumentIngestModalProps> = ({
  isOpen,
  onClose,
  onDeployDisruption
}) => {
  const [inputText, setInputText] = useState(SAMPLE_TEMPLATES[0].text);
  const [cargoType, setCargoType] = useState('Automotive Tier-1 & Pharma');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch('http://localhost:8000/api/documents/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: inputText, cargoType })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Document parsing error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeploy = () => {
    if (result && result.extractedDisruption) {
      onDeployDisruption(result.extractedDisruption);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Unstructured Document & Circular Parser
              </h3>
              <p className="text-xs text-slate-500">
                Extracts operational parameters using Gemini 2.5 Flash & matches customer SLA policies
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Quick-Select */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Sample Official Circular / Notice:
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(tmpl.text);
                  setResult(null);
                }}
                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg border border-slate-200 transition-colors"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Area */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Raw Notice, Email, or Circular Text:</span>
          </label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
            placeholder="Paste freight email or circular here..."
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !inputText.trim()}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAnalyzing ? 'Extracting via Gemini 2.5 Flash...' : 'Extract Disruption & Match Contract SLAs'}</span>
        </button>

        {/* Extraction Results */}
        {result && (
          <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-300">
            {/* Extracted Schema Cards */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Structured Disruption Schema Extracted
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                  {result.extractedDisruption.severity}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">EVENT</span>
                  <span className="font-bold text-slate-900">{result.extractedDisruption.eventType}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">ROUTE</span>
                  <span className="font-bold text-slate-900 font-mono">{result.extractedDisruption.route}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">DELAY</span>
                  <span className="font-bold text-slate-900">{result.extractedDisruption.estimatedDelay}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">COST IMPACT</span>
                  <span className="font-bold text-slate-900 font-mono">{result.extractedDisruption.additionalCost}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                {result.extractedDisruption.description}
              </div>
            </div>

            {/* Matched Contract SLAs (RAG) */}
            {result.matchedSLAPolicies && result.matchedSLAPolicies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Matched Customer SLA Contracts (Policy RAG):</span>
                </div>

                <div className="space-y-2">
                  {result.matchedSLAPolicies.slice(0, 2).map((policy: any, idx: number) => (
                    <div key={idx} className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-blue-900 flex justify-between">
                        <span>{policy.customer}</span>
                        <span className="font-mono text-slate-500">Max Delay: {policy.max_delay_hours}h</span>
                      </div>
                      <div className="text-slate-700">{policy.clause}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deploy to Operations CTA */}
            <button
              onClick={handleDeploy}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <span>Deploy Extracted Incident to Live Operations & Recalculate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
