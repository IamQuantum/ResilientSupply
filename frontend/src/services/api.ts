/**
 * API Service for communicating with the ResilientChain AI FastAPI backend.
 * Falls back gracefully to internal state if backend is offline.
 */

const API_BASE = 'http://localhost:8000/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline or unreachable, using local store:', err);
    return null;
  }
}

export async function fetchDisruptions(orgId?: string) {
  try {
    const url = orgId ? `${API_BASE}/disruptions?org_id=${encodeURIComponent(orgId)}` : `${API_BASE}/disruptions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch disruptions');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline, using mock disruptions:', err);
    return null;
  }
}

export async function injectCustomDisruption(payload: {
  orgId: string;
  routeCode: string;
  origin: string;
  destination: string;
  facilityName?: string;
  eventType: string;
  severity: string;
  affectedShipments: number;
  estimatedDelay: string;
  stockOutRisk: number | string;
  additionalCost: string | number;
  carrier?: string;
  description?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/disruptions/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to inject custom disruption');
    return await res.json();
  } catch (err) {
    console.error('Custom disruption injection error:', err);
    return null;
  }
}

export async function runOptimization(disruptionId: string, routeBlocked: string = 'R1', weights?: any) {
  try {
    const res = await fetch(`${API_BASE}/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disruptionId, routeBlocked, weights })
    });
    if (!res.ok) throw new Error('Optimization request failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline, using deterministic mock calculations:', err);
    return null;
  }
}

export async function submitApproval(incidentId: string, strategyId: string, decision: 'APPROVED' | 'REJECTED') {
  try {
    const res = await fetch(`${API_BASE}/approvals/${incidentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategyId, decision })
    });
    if (!res.ok) throw new Error('Approval submission failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline, using local approval transition:', err);
    return { status: 'success', dispatched: decision === 'APPROVED' };
  }
}

export async function fetchDispatch(incidentId: string) {
  try {
    const res = await fetch(`${API_BASE}/dispatch/${incidentId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchCompanies() {
  try {
    const res = await fetch(`${API_BASE}/companies`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function addCompanyRoute(payload: {
  orgId: string;
  routeCode: string;
  origin: string;
  destination: string;
  transitHours?: number;
  carrier?: string;
  originAddress?: string;
  destinationAddress?: string;
  distanceKm?: number;
  waypoints?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/network/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to add company route');
    return await res.json();
  } catch (err) {
    console.error('Add route error:', err);
    return null;
  }
}

export async function addCompanyNode(payload: {
  orgId: string;
  name: string;
  city: string;
  pincode: string;
  capacity?: number;
  safetyBuffer?: number;
  address?: string;
  lat?: number;
  lng?: number;
}) {
  try {
    const res = await fetch(`${API_BASE}/network/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to add company node');
    return await res.json();
  } catch (err) {
    console.error('Add node error:', err);
    return null;
  }
}

export async function updateCompanyNode(nodeId: string, payload: {
  name?: string;
  city?: string;
  pincode?: string;
  capacity?: number;
  safetyBuffer?: number;
  status?: string;
  address?: string;
  lat?: number;
  lng?: number;
}) {
  try {
    const res = await fetch(`${API_BASE}/network/nodes/${nodeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update company node');
    return await res.json();
  } catch (err) {
    console.error('Update node error:', err);
    throw err;
  }
}

export async function deleteCompanyNode(nodeId: string) {
  try {
    const res = await fetch(`${API_BASE}/network/nodes/${nodeId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete company node');
    return await res.json();
  } catch (err) {
    console.error('Delete node error:', err);
    throw err;
  }
}

export async function updateCompanyRoute(routeId: string, payload: {
  routeCode?: string;
  origin?: string;
  destination?: string;
  transitHours?: number;
  carrier?: string;
  originAddress?: string;
  destinationAddress?: string;
  distanceKm?: number;
  waypoints?: string;
  status?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/network/routes/${routeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update company route');
    return await res.json();
  } catch (err) {
    console.error('Update route error:', err);
    throw err;
  }
}

export async function deleteCompanyRoute(routeId: string) {
  try {
    const res = await fetch(`${API_BASE}/network/routes/${routeId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete company route');
    return await res.json();
  } catch (err) {
    console.error('Delete route error:', err);
    throw err;
  }
}

export async function fetchFleetTelematics() {
  try {
    const res = await fetch(`${API_BASE}/telemetry/fleet`);
    if (!res.ok) throw new Error('Failed to fetch fleet telematics');
    return await res.json();
  } catch (err) {
    console.warn('Fleet telematics offline, using fallback:', err);
    return [];
  }
}

export async function sendDriverTelemetry(payload: {
  driverId?: string;
  truckId: string;
  lat: number;
  lng: number;
  speedKmh: number;
  dutyStatus: string;
  batteryPct?: number;
  heading?: number;
  isPhoneGps?: boolean;
}) {
  try {
    const res = await fetch(`${API_BASE}/driver/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to post driver telemetry');
    return await res.json();
  } catch (err) {
    console.warn('Driver telemetry post failed:', err);
    return null;
  }
}

export async function sendDriverDuty(payload: {
  truckId: string;
  dutyStatus: string;
  breakMinutes?: number;
}) {
  try {
    const res = await fetch(`${API_BASE}/driver/duty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to set driver duty');
    return await res.json();
  } catch (err) {
    console.warn('Driver duty post failed:', err);
    return null;
  }
}

export async function sendDriverEmergency(payload: {
  truckId: string;
  emergencyType: string;
  message: string;
  lat: number;
  lng: number;
}) {
  try {
    const res = await fetch(`${API_BASE}/driver/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to report driver emergency');
    return await res.json();
  } catch (err) {
    console.warn('Driver emergency post failed:', err);
    return null;
  }
}

