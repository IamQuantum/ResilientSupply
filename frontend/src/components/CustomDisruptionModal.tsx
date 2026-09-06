import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  Send, 
  MapPin, 
  Building2, 
  Truck, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ShieldAlert, 
  Sparkles,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { CustomerNode, CustomerRoute } from '../types';
import { injectCustomDisruption } from '../services/api';

interface CustomDisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgName: string;
  customRoutes: CustomerRoute[];
  customNodes: CustomerNode[];
  onDisruptionInjected: (result: {
    disruption: any;
    solverStrategies: any;
    recommendedStrategy: string;
    aiRationale: string;
    auditTrail: any;
  }) => void;
}

const PRESET_SCENARIOS = [
  {
    type: 'National Highway Flooding & Bridge Outage',
    severity: 'Critical',
    delay: '24 Hours',
    shipments: 8,
    stockRisk: 78,
    cost: '₹95,000',
    desc: 'Severe monsoon waterlogging and structural bridge inspection causing total commercial vehicular standstill.'
  },
  {
    type: 'Interstate Toll Plaza Strike & Gridlock',
    severity: 'High',
    delay: '18 Hours',
    shipments: 12,
    stockRisk: 62,
    cost: '₹55,000',
    desc: 'Local transport union toll plaza blockades on the interstate freight corridor halting interstate container movement.'
  },
  {
    type: 'Deep-Water Port Demurrage & Berth Congestion',
    severity: 'Critical',
    delay: '48 Hours',
    shipments: 20,
    stockRisk: 88,
    cost: '₹1,80,000',
    desc: 'Inbound container berth congestion and crane maintenance resulting in vessel queue exceeding terminal capacity.'
  },
  {
    type: 'Cold-Chain Reefer Breakdown & Ambient Spike',
    severity: 'Critical',
    delay: '12 Hours',
    shipments: 6,
    stockRisk: 85,
    cost: '₹1,40,000',
    desc: 'Auxiliary generator failure on primary reefer fleet during transit; temperatures exceeding +8°C threshold.'
  }
];

export const CustomDisruptionModal: React.FC<CustomDisruptionModalProps> = ({
  isOpen,
  onClose,
  orgId,
  orgName,
  customRoutes,
  customNodes,
  onDisruptionInjected
}) => {
  // Form State
  const [corridorMode, setCorridorMode] = useState<'enrolled' | 'custom'>(customRoutes.length > 0 ? 'enrolled' : 'custom');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [routeCode, setRouteCode] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [facilityName, setFacilityName] = useState<string>('');
  const [carrier, setCarrier] = useState<string>('Dedicated Fleet');

  const [eventType, setEventType] = useState<string>(PRESET_SCENARIOS[0].type);
  const [severity, setSeverity] = useState<string>(PRESET_SCENARIOS[0].severity);
  const [affectedShipments, setAffectedShipments] = useState<number>(PRESET_SCENARIOS[0].shipments);
  const [estimatedDelay, setEstimatedDelay] = useState<string>(PRESET_SCENARIOS[0].delay);
  const [stockOutRisk, setStockOutRisk] = useState<number>(PRESET_SCENARIOS[0].stockRisk);
  const [additionalCost, setAdditionalCost] = useState<string>(PRESET_SCENARIOS[0].cost);
  const [description, setDescription] = useState<string>(PRESET_SCENARIOS[0].desc);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Synchronize route selection
  useEffect(() => {
    if (customRoutes.length > 0) {
      const initialRoute = customRoutes[0];
      setSelectedRouteId(initialRoute.id);
      setRouteCode(initialRoute.routeCode);
      setOrigin(initialRoute.origin);
      setDestination(initialRoute.destination);
      if (initialRoute.carrier) setCarrier(initialRoute.carrier);
    } else {
      setSelectedRouteId('default-route');
      setRouteCode('CORR-01');
      setOrigin('Mumbai Central DC');
      setDestination('Delhi NCR Distribution Hub');
      setCarrier('Allcargo Logistics');
    }

    if (customNodes.length > 0) {
      setSelectedNodeId(customNodes[0].id);
      setFacilityName(customNodes[0].name);
    } else {
      setSelectedNodeId('default-node');
      setFacilityName('Primary Enterprise Hub');
    }
  }, [customRoutes, customNodes, isOpen]);

  if (!isOpen) return null;

  const handleRouteChange = (rId: string) => {
    setSelectedRouteId(rId);
    const found = customRoutes.find(r => r.id === rId);
    if (found) {
      setRouteCode(found.routeCode);
      setOrigin(found.origin);
      setDestination(found.destination);
      if (found.carrier) setCarrier(found.carrier);
    }
  };

  const handleNodeChange = (nId: string) => {
    setSelectedNodeId(nId);
    const found = customNodes.find(n => n.id === nId);
    if (found) {
      setFacilityName(found.name);
    }
  };

  const handlePresetSelect = (preset: typeof PRESET_SCENARIOS[0]) => {
    setEventType(preset.type);
    setSeverity(preset.severity);
    setAffectedShipments(preset.shipments);
    setEstimatedDelay(preset.delay);
    setStockOutRisk(preset.stockRisk);
    setAdditionalCost(preset.cost);
    setDescription(preset.desc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        orgId: orgId || 'tata-motors',
        routeCode: routeCode || 'CORR-01',
        origin: origin || 'Primary Hub',
        destination: destination || 'Regional DC',
        facilityName: facilityName || 'Regional Hub',
        eventType,
        severity,
        affectedShipments: Number(affectedShipments),
        estimatedDelay,
        stockOutRisk: Number(stockOutRisk),
        additionalCost,
        carrier,
        description
      };

      const result = await injectCustomDisruption(payload);
      if (result && result.status === 'success') {
        onDisruptionInjected(result);
        onClose();
      } else {
        setErrorMsg('Failed to inject disruption. Please verify backend connectivity.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unexpected disruption injection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-400 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Simulate Incident on Enrolled Network
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 text-slate-700 font-bold">
                  {orgName}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Inject custom real-time corridor disruptions and trigger the Google OR-Tools solver on your supply chain.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preset Scenario Cards */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Disruption Archetype (or customize below)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_SCENARIOS.map((preset, idx) => {
                const isSelected = eventType === preset.type;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold line-clamp-2 leading-tight">
                      {preset.type.split('&')[0]}
                    </div>
                    <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      <span>+{preset.delay}</span> • <span>{preset.severity}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Corridor & Facility Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            
            {/* Target Corridor */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-600" />
                    Target Freight Corridor
                  </label>
                  
                  {/* Mode Selector Toggle */}
                  {customRoutes.length > 0 && (
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setCorridorMode('enrolled')}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${
                          corridorMode === 'enrolled'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Enrolled ({customRoutes.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCorridorMode('custom')}
                        className={`px-2 py-0.5 rounded font-semibold transition-all ${
                          corridorMode === 'custom'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Pinpoint Address
                      </button>
                    </div>
                  )}
                </div>

                {corridorMode === 'enrolled' && customRoutes.length > 0 ? (
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Select Enrolled Corridor Lane
                      </span>
                      <select
                        value={selectedRouteId}
                        onChange={(e) => handleRouteChange(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-slate-500 focus:outline-none shadow-2xs"
                      >
                        {customRoutes.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.routeCode}: {r.origin} ➔ {r.destination} ({r.carrier})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clean Visual Corridor Routing Card */}
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[10px] font-bold">
                          {routeCode}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-slate-400" />
                          {carrier}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-800 font-medium">
                        <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate" title={origin}>{origin}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          <span className="truncate" title={destination}>{destination}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                          Corridor Code
                        </label>
                        <input
                          type="text"
                          value={routeCode}
                          onChange={(e) => setRouteCode(e.target.value)}
                          placeholder="e.g. BLR-HYD-EXP"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                          Assigned Carrier
                        </label>
                        <input
                          type="text"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          placeholder="e.g. Blue Dart Air"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        Exact Origin Address / City
                      </label>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="e.g. Peenya Industrial Area, Bengaluru, KA 560058"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        Exact Destination Address / City
                      </label>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g. GMR Aerospace Park, Shamshabad, Hyderabad 500108"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-200/70 pt-2 flex items-center justify-between">
                <span>Pinpointed route topology</span>
                <span className="font-mono font-semibold text-slate-600">OR-Tools Corridor Evaluation</span>
              </div>
            </div>

            {/* Target DC Hub */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-600" />
                    Impacted DC / Buffer Facility
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {customNodes.length} Hubs Active
                  </span>
                </div>

                {customNodes.length > 0 ? (
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Select Registered DC Node
                      </span>
                      <select
                        value={selectedNodeId}
                        onChange={(e) => handleNodeChange(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-slate-500 focus:outline-none shadow-2xs"
                      >
                        {customNodes.map(n => (
                          <option key={n.id} value={n.id}>
                            {n.name} ({n.city}) • Cap: {n.capacity.toLocaleString()} MT
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1 shadow-2xs">
                      <div className="text-xs font-bold text-slate-900">{facilityName}</div>
                      <div className="text-[11px] text-slate-500">
                        {customNodes.find(n => n.id === selectedNodeId)?.address || `${facilityName}, Regional Logistics DC`}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold border border-emerald-200">
                          Buffer: {customNodes.find(n => n.id === selectedNodeId)?.safetyBufferPct || 25}% Safety Reserve
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Cap: {customNodes.find(n => n.id === selectedNodeId)?.capacity?.toLocaleString() || '10,000'} MT
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                        Facility Hub Name
                      </label>
                      <input
                        type="text"
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        placeholder="Facility Hub Name (e.g. Bhiwandi Central DC)"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                        required
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 p-2 bg-white border border-slate-200 rounded-lg">
                      Primary distribution center mapped to active inventory buffer and SLA constraints.
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-200/70 pt-2 flex items-center justify-between">
                <span>Inventory buffer drawdown</span>
                <span className="font-mono font-semibold text-slate-600">&gt; 20% Reserve Guard</span>
              </div>
            </div>
          </div>

          {/* Operational Incident Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Incident Event Title
              </label>
              <input
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium focus:border-slate-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:border-slate-500 focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Shipments At Risk
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={affectedShipments}
                onChange={(e) => setAffectedShipments(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:border-slate-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Estimated Delay
              </label>
              <input
                type="text"
                value={estimatedDelay}
                onChange={(e) => setEstimatedDelay(e.target.value)}
                placeholder="e.g. 24 Hours"
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold focus:border-slate-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Sliders: Stock-out Risk & Surcharge Exposure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-700">Stock-Out Risk</span>
                <span className="text-xs font-mono font-bold text-red-600">{stockOutRisk}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={stockOutRisk}
                onChange={(e) => setStockOutRisk(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5% (Negligible)</span>
                <span>50% (Moderate)</span>
                <span>95% (Imminent Stockout)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-700">Estimated Surcharge Impact</span>
                <span className="text-xs font-mono font-bold text-slate-900">{additionalCost}</span>
              </div>
              <input
                type="text"
                value={additionalCost}
                onChange={(e) => setAdditionalCost(e.target.value)}
                placeholder="e.g. ₹85,000"
                className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-semibold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Estimated financial exposure before solver mitigation
              </span>
            </div>
          </div>

          {/* Description / Circular Text */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Operational Circular & Incident Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-normal focus:border-slate-500 focus:outline-none text-slate-800 resize-none"
              required
            />
          </div>

          {/* Footer Controls */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              <span>Triggers full multi-agent optimization and logs audit trail.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing OR-Tools Solver...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Inject Incident & Optimize</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
