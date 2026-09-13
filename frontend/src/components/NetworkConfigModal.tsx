import React, { useState, useEffect } from 'react';
import { Building2, Route, Plus, X, Check, MapPin, Truck, Edit2, Trash2, RotateCcw } from 'lucide-react';
import { CustomerNode, CustomerRoute } from '../types';
import { 
  addCompanyNode, 
  updateCompanyNode, 
  deleteCompanyNode, 
  addCompanyRoute, 
  updateCompanyRoute, 
  deleteCompanyRoute,
  API_BASE 
} from '../services/api';

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
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Node Form State
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeCity, setNodeCity] = useState('');
  const [nodePincode, setNodePincode] = useState('');
  const [nodeAddress, setNodeAddress] = useState('');
  const [nodeCapacity, setNodeCapacity] = useState(10000);
  const [nodeBuffer, setNodeBuffer] = useState(25);
  const [nodeStatus, setNodeStatus] = useState('Available');

  // Route Form State
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [routeCode, setRouteCode] = useState('');
  const [routeOrigin, setRouteOrigin] = useState('');
  const [routeDest, setRouteDest] = useState('');
  const [routeHours, setRouteHours] = useState(24);
  const [routeCarrier, setRouteCarrier] = useState('Allcargo Logistics');
  const [routeStatus, setRouteStatus] = useState('Optimal');

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const fetchNetwork = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/network/${orgId}`);
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
    } else {
      resetNodeForm();
      resetRouteForm();
      setFeedback(null);
    }
  }, [isOpen, orgId]);

  const resetNodeForm = () => {
    setEditingNodeId(null);
    setNodeName('');
    setNodeCity('');
    setNodePincode('');
    setNodeAddress('');
    setNodeCapacity(10000);
    setNodeBuffer(25);
    setNodeStatus('Available');
  };

  const resetRouteForm = () => {
    setEditingRouteId(null);
    setRouteCode('');
    setRouteOrigin('');
    setRouteDest('');
    setRouteHours(24);
    setRouteCarrier('Allcargo Logistics');
    setRouteStatus('Optimal');
  };

  const handleStartEditNode = (n: CustomerNode) => {
    setEditingNodeId(n.id);
    setNodeName(n.name || '');
    setNodeCity(n.city || '');
    setNodePincode(n.pincode || '');
    setNodeAddress(n.address || '');
    setNodeCapacity(n.capacity || 10000);
    setNodeBuffer(n.safetyBufferPct ?? 25);
    setNodeStatus(n.status || 'Available');
  };

  const handleStartEditRoute = (r: CustomerRoute) => {
    setEditingRouteId(r.id);
    setRouteCode(r.routeCode || '');
    setRouteOrigin(r.origin || '');
    setRouteDest(r.destination || '');
    setRouteHours(r.transitHours || 24);
    setRouteCarrier(r.carrier || 'Allcargo Logistics');
    setRouteStatus(r.status || 'Optimal');
  };

  const handleNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim() || !nodeCity.trim() || !nodePincode.trim()) return;

    setSubmitting(true);
    try {
      if (editingNodeId) {
        // Update existing node
        await updateCompanyNode(editingNodeId, {
          name: nodeName.trim(),
          city: nodeCity.trim(),
          pincode: nodePincode.trim(),
          address: nodeAddress.trim() || `${nodeName.trim()}, ${nodeCity.trim()}`,
          capacity: Number(nodeCapacity),
          safetyBuffer: Number(nodeBuffer),
          status: nodeStatus
        });
        showFeedback(`Distribution Center '${nodeName}' updated successfully.`);
        resetNodeForm();
      } else {
        // Create new node
        await addCompanyNode({
          orgId,
          name: nodeName.trim(),
          city: nodeCity.trim(),
          pincode: nodePincode.trim(),
          address: nodeAddress.trim() || `${nodeName.trim()}, ${nodeCity.trim()}`,
          capacity: Number(nodeCapacity),
          safetyBuffer: Number(nodeBuffer)
        });
        showFeedback(`Distribution Center '${nodeName}' registered.`);
        resetNodeForm();
      }

      await fetchNetwork();
      onNetworkUpdated?.();
    } catch (err: any) {
      console.error(err);
      showFeedback(`Error: ${err.message || 'Operation failed'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNode = async (nodeId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete distribution center "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteCompanyNode(nodeId);
      showFeedback(`Distribution Center '${name}' deleted.`);
      if (editingNodeId === nodeId) {
        resetNodeForm();
      }
      await fetchNetwork();
      onNetworkUpdated?.();
    } catch (err: any) {
      console.error(err);
      showFeedback(`Error deleting node: ${err.message || 'Failed'}`, 'error');
    }
  };

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeCode.trim() || !routeOrigin.trim() || !routeDest.trim()) return;

    setSubmitting(true);
    try {
      if (editingRouteId) {
        // Update existing route
        await updateCompanyRoute(editingRouteId, {
          routeCode: routeCode.trim(),
          origin: routeOrigin.trim(),
          destination: routeDest.trim(),
          originAddress: routeOrigin.trim(),
          destinationAddress: routeDest.trim(),
          transitHours: Number(routeHours),
          carrier: routeCarrier.trim(),
          status: routeStatus
        });
        showFeedback(`Freight corridor '${routeCode}' updated successfully.`);
        resetRouteForm();
      } else {
        // Create new route
        await addCompanyRoute({
          orgId,
          routeCode: routeCode.trim(),
          origin: routeOrigin.trim(),
          destination: routeDest.trim(),
          originAddress: routeOrigin.trim(),
          destinationAddress: routeDest.trim(),
          transitHours: Number(routeHours),
          carrier: routeCarrier.trim()
        });
        showFeedback(`Freight corridor '${routeCode}' mapped.`);
        resetRouteForm();
      }

      await fetchNetwork();
      onNetworkUpdated?.();
    } catch (err: any) {
      console.error(err);
      showFeedback(`Error: ${err.message || 'Operation failed'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async (routeId: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete freight lane "${code}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteCompanyRoute(routeId);
      showFeedback(`Freight lane '${code}' deleted.`);
      if (editingRouteId === routeId) {
        resetRouteForm();
      }
      await fetchNetwork();
      onNetworkUpdated?.();
    } catch (err: any) {
      console.error(err);
      showFeedback(`Error deleting route: ${err.message || 'Failed'}`, 'error');
    }
  };

  const getNodeStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'available' || s === 'operational') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s === 'constrained') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s?.includes('below') || s === 'critical') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getRouteStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'optimal' || s === 'active') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s === 'congested' || s === 'delay') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s === 'disrupted' || s === 'blocked') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
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
                {orgName} • Define and manage DC nodes, warehouse facilities, and transit lanes.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div className="flex gap-4 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('nodes');
              resetRouteForm();
            }}
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
            onClick={() => {
              setActiveTab('routes');
              resetNodeForm();
            }}
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
          <div className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
            feedback.type === 'error' 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            {feedback.text}
          </div>
        )}

        {/* TAB 1: Nodes */}
        {activeTab === 'nodes' && (
          <div className="space-y-4 text-xs">
            {/* Existing Nodes Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">DC / Facility Name</th>
                    <th className="py-2.5 px-3">Location & PIN</th>
                    <th className="py-2.5 px-3">Capacity</th>
                    <th className="py-2.5 px-3">Safety Buffer</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nodes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-5 text-center text-slate-400">
                        {loading ? 'Loading facilities...' : 'No facilities configured yet. Add your first DC below.'}
                      </td>
                    </tr>
                  ) : (
                    nodes.map(n => {
                      const isEditing = editingNodeId === n.id;
                      return (
                        <tr 
                          key={n.id} 
                          className={`transition-colors ${
                            isEditing 
                              ? 'bg-slate-100/90 font-medium border-l-2 border-l-slate-900' 
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {n.name}
                            {isEditing && (
                              <span className="ml-2 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-normal">
                                Editing
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{n.city} ({n.pincode})</td>
                          <td className="py-2.5 px-3 font-mono">{n.capacity?.toLocaleString() || '10,000'} units</td>
                          <td className="py-2.5 px-3 font-mono">{n.safetyBufferPct ?? 25}%</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getNodeStatusBadge(n.status)}`}>
                              {n.status || 'Available'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditNode(n)}
                                title="Edit facility"
                                className={`p-1.5 rounded-md transition-colors ${
                                  isEditing 
                                    ? 'bg-slate-900 text-white' 
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                }`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNode(n.id, n.name)}
                                title="Delete facility"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Add / Edit Node Form */}
            <form onSubmit={handleNodeSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  {editingNodeId ? (
                    <>
                      <Edit2 className="w-3.5 h-3.5 text-slate-700" />
                      <span>Edit Distribution Center Node</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-slate-700" />
                      <span>Add Distribution Center Node</span>
                    </>
                  )}
                </div>
                {editingNodeId && (
                  <button
                    type="button"
                    onClick={resetNodeForm}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Cancel Edit
                  </button>
                )}
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
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900"
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
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900"
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
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-600 mb-1">Address / Landmark (Optional)</label>
                  <input
                    type="text"
                    value={nodeAddress}
                    onChange={e => setNodeAddress(e.target.value)}
                    placeholder="e.g. GIDC Industrial Estate Phase 2"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Capacity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={nodeCapacity}
                    onChange={e => setNodeCapacity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Safety Buffer (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={nodeBuffer}
                    onChange={e => setNodeBuffer(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900"
                  />
                </div>
              </div>

              {editingNodeId && (
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Operating Status</label>
                  <select
                    value={nodeStatus}
                    onChange={e => setNodeStatus(e.target.value)}
                    className="w-full sm:w-1/2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900 font-medium"
                  >
                    <option value="Available">Available (Operational)</option>
                    <option value="Constrained">Constrained (Bottlenecked)</option>
                    <option value="Below Safety Threshold">Below Safety Threshold (Critical)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingNodeId ? 'Update Node' : 'Register Node'}</span>
                </button>
                {editingNodeId && (
                  <button
                    type="button"
                    onClick={resetNodeForm}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Routes */}
        {activeTab === 'routes' && (
          <div className="space-y-4 text-xs">
            {/* Existing Routes Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Lane Code</th>
                    <th className="py-2.5 px-3">Origin Node</th>
                    <th className="py-2.5 px-3">Destination Node</th>
                    <th className="py-2.5 px-3">Transit Time</th>
                    <th className="py-2.5 px-3">Primary Carrier</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-5 text-center text-slate-400">
                        {loading ? 'Loading corridors...' : 'No freight lanes mapped yet. Add your first corridor below.'}
                      </td>
                    </tr>
                  ) : (
                    routes.map(r => {
                      const isEditing = editingRouteId === r.id;
                      return (
                        <tr 
                          key={r.id} 
                          className={`transition-colors ${
                            isEditing 
                              ? 'bg-slate-100/90 font-medium border-l-2 border-l-slate-900' 
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {r.routeCode}
                            {isEditing && (
                              <span className="ml-2 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-normal font-sans">
                                Editing
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{r.origin}</td>
                          <td className="py-2.5 px-3 text-slate-700">{r.destination}</td>
                          <td className="py-2.5 px-3 font-mono">{r.transitHours} Hours</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.carrier}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getRouteStatusBadge(r.status)}`}>
                              {r.status || 'Optimal'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditRoute(r)}
                                title="Edit corridor"
                                className={`p-1.5 rounded-md transition-colors ${
                                  isEditing 
                                    ? 'bg-slate-900 text-white' 
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                }`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRoute(r.id, r.routeCode)}
                                title="Delete corridor"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Add / Edit Route Form */}
            <form onSubmit={handleRouteSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  {editingRouteId ? (
                    <>
                      <Edit2 className="w-3.5 h-3.5 text-slate-700" />
                      <span>Edit Freight Transit Lane</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-slate-700" />
                      <span>Map Freight Transit Lane</span>
                    </>
                  )}
                </div>
                {editingRouteId && (
                  <button
                    type="button"
                    onClick={resetRouteForm}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Cancel Edit
                  </button>
                )}
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
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-slate-400 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Origin Node / Address</label>
                  <input
                    type="text"
                    required
                    value={routeOrigin}
                    onChange={e => setRouteOrigin(e.target.value)}
                    placeholder="e.g. Bhiwandi DC"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Destination Node / Address</label>
                  <input
                    type="text"
                    required
                    value={routeDest}
                    onChange={e => setRouteDest(e.target.value)}
                    placeholder="e.g. Sanand Plant"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Transit Time (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    value={routeHours}
                    onChange={e => setRouteHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Assigned 3PL Carrier</label>
                  <input
                    type="text"
                    value={routeCarrier}
                    onChange={e => setRouteCarrier(e.target.value)}
                    placeholder="e.g. TCI Express"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900"
                  />
                </div>
                {editingRouteId ? (
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Corridor Status</label>
                    <select
                      value={routeStatus}
                      onChange={e => setRouteStatus(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-900 font-medium"
                    >
                      <option value="Optimal">Optimal (Normal)</option>
                      <option value="Congested">Congested (Delay)</option>
                      <option value="Disrupted">Disrupted (Blocked)</option>
                    </select>
                  </div>
                ) : (
                  <div className="hidden sm:block" />
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingRouteId ? 'Update Corridor' : 'Map Route'}</span>
                </button>
                {editingRouteId && (
                  <button
                    type="button"
                    onClick={resetRouteForm}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
