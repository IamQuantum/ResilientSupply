import React, { useState, useEffect } from 'react';
import { Building2, Route, Plus, X, Check, MapPin, Truck } from 'lucide-react';
import { CustomerNode, CustomerRoute } from '../types';

interface NetworkConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgName: string;
  onNetworkUpdated?: () => void;
}

export const NetworkConfigModal: React.FC<NetworkConfigModalProps> = ({
  isOpen,
  onClose,
  orgId,
  orgName,
  onNetworkUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'routes'>('nodes');
  const [nodes, setNodes] = useState<CustomerNode[]>([]);
  const [routes, setRoutes] = useState<CustomerRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Add Node State
  const [nodeName, setNodeName] = useState('');
  const [nodeCity, setNodeCity] = useState('');
  const [nodePincode, setNodePincode] = useState('');
  const [nodeCapacity, setNodeCapacity] = useState(10000);
  const [nodeBuffer, setNodeBuffer] = useState(25);

  // Add Route State
  const [routeCode, setRouteCode] = useState('');
  const [routeOrigin, setRouteOrigin] = useState('');
  const [routeDest, setRouteDest] = useState('');
  const [routeHours, setRouteHours] = useState(24);
  const [routeCarrier, setRouteCarrier] = useState('Allcargo Logistics');

  const fetchNetwork = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/network/${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
        setRoutes(data.routes || []);
      }
    } catch (e) {
      console.warn('Network fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNetwork();
    }
  }, [isOpen, orgId]);

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName || !nodeCity || !nodePincode) return;
    try {
      const res = await fetch('http://localhost:8000/api/network/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          name: nodeName,
          city: nodeCity,
          pincode: nodePincode,
          capacity: Number(nodeCapacity),
          safetyBuffer: Number(nodeBuffer)
        })
      });
      if (res.ok) {
        setFeedback(`DC Hub '${nodeName}' added.`);
        setNodeName('');
        setNodeCity('');
        setNodePincode('');
        await fetchNetwork();
        onNetworkUpdated?.();
        setTimeout(() => setFeedback(''), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeCode || !routeOrigin || !routeDest) return;
    try {
      const res = await fetch('http://localhost:8000/api/network/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          routeCode,
          origin: routeOrigin,
          destination: routeDest,
          originAddress: routeOrigin,
          destinationAddress: routeDest,
          transitHours: Number(routeHours),
          carrier: routeCarrier
        })
      });
      if (res.ok) {
        setFeedback(`Freight lane '${routeCode}' mapped.`);
        setRouteCode('');
        setRouteOrigin('');
        setRouteDest('');
        await fetchNetwork();
        onNetworkUpdated?.();
        setTimeout(() => setFeedback(''), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Supply Chain Network Configuration
              </h3>
              <p className="text-xs text-slate-500">
                {orgName} • Define your enterprise DC nodes, warehouse facilities, and transit lanes.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex gap-4 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'nodes'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Distribution Centers ({nodes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'routes'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Freight Lanes & Corridors ({routes.length})</span>
          </button>
        </div>

        {feedback && (
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 text-center">
            {feedback}
          </div>
        )}

        {/* TAB 1: Nodes */}
        {activeTab === 'nodes' && (
          <div className="space-y-4 text-xs">
            {/* Existing Nodes Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">DC / Facility Name</th>
                    <th className="py-2.5 px-3">Location & PIN</th>
                    <th className="py-2.5 px-3">Capacity</th>
                    <th className="py-2.5 px-3">Safety Buffer</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No facilities configured yet. Add your first DC below.
                      </td>
                    </tr>
                  ) : (
                    nodes.map(n => (
                      <tr key={n.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{n.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{n.city} ({n.pincode})</td>
                        <td className="py-2.5 px-3 font-mono">{n.capacity.toLocaleString()} units</td>
                        <td className="py-2.5 px-3 font-mono">{n.safetyBufferPct}%</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {n.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Node Form */}
            <form onSubmit={handleAddNode} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-slate-700" />
                <span>Add Distribution Center Node</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Facility Name</label>
                  <input
                    type="text"
                    required
                    value={nodeName}
                    onChange={e => setNodeName(e.target.value)}
                    placeholder="e.g. Sanand Central Warehouse"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">City / Hub</label>
                  <input
                    type="text"
                    required
                    value={nodeCity}
                    onChange={e => setNodeCity(e.target.value)}
                    placeholder="e.g. Ahmedabad Sanand"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={nodePincode}
                    onChange={e => setNodePincode(e.target.value)}
                    placeholder="e.g. 382110"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Capacity (Units)</label>
                  <input
                    type="number"
                    value={nodeCapacity}
                    onChange={e => setNodeCapacity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Safety Buffer (%)</label>
                  <input
                    type="number"
                    value={nodeBuffer}
                    onChange={e => setNodeBuffer(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
              >
                Register Node
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Routes */}
        {activeTab === 'routes' && (
          <div className="space-y-4 text-xs">
            {/* Existing Routes Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Lane Code</th>
                    <th className="py-2.5 px-3">Origin Node</th>
                    <th className="py-2.5 px-3">Destination Node</th>
                    <th className="py-2.5 px-3">Transit Time</th>
                    <th className="py-2.5 px-3">Primary Carrier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        No freight lanes mapped yet. Add your first corridor below.
                      </td>
                    </tr>
                  ) : (
                    routes.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.routeCode}</td>
                        <td className="py-2.5 px-3 text-slate-700">{r.origin}</td>
                        <td className="py-2.5 px-3 text-slate-700">{r.destination}</td>
                        <td className="py-2.5 px-3 font-mono">{r.transitHours} Hours</td>
                        <td className="py-2.5 px-3 text-slate-600">{r.carrier}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Route Form */}
            <form onSubmit={handleAddRoute} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-slate-700" />
                <span>Map Freight Transit Lane</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Route / Lane Code</label>
                  <input
                    type="text"
                    required
                    value={routeCode}
                    onChange={e => setRouteCode(e.target.value)}
                    placeholder="e.g. LANE-BOM-NCR"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Origin Node</label>
                  <input
                    type="text"
                    required
                    value={routeOrigin}
                    onChange={e => setRouteOrigin(e.target.value)}
                    placeholder="e.g. Bhiwandi DC"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Destination Node</label>
                  <input
                    type="text"
                    required
                    value={routeDest}
                    onChange={e => setRouteDest(e.target.value)}
                    placeholder="e.g. Sanand Plant"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Transit Time (Hours)</label>
                  <input
                    type="number"
                    value={routeHours}
                    onChange={e => setRouteHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Assigned 3PL Carrier</label>
                  <input
                    type="text"
                    value={routeCarrier}
                    onChange={e => setRouteCarrier(e.target.value)}
                    placeholder="e.g. TCI Express"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
              >
                Map Route
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
