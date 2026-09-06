import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Crosshair, 
  X, 
  Route, 
  ArrowRight, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Check, 
  Send, 
  Truck, 
  Smartphone, 
  Layers
} from 'lucide-react';
import { CustomerNode, CustomerRoute } from '../types';
import { 
  resolveAddressPinpoint, 
  haversineDistanceKm, 
  interpolateGpsCurve, 
  geocodeAddressOnline, 
  PinpointLocation 
} from '../utils/geoPinpoint';
import { addCompanyRoute, fetchFleetTelematics } from '../services/api';
import { DriverCompanionModal } from './DriverCompanionModal';

interface FreightNetworkMapProps {
  activeRoute?: string;
  customNodes?: CustomerNode[];
  customRoutes?: CustomerRoute[];
  orgId?: string;
  orgName?: string;
  onRouteAllotted?: () => void;
  onSimulateDisruptionOnLane?: (routeCode: string) => void;
  onOpenDriverApp?: () => void;
}

interface DisplayNode {
  id: string;
  name: string;
  city: string;
  address: string;
  role: string;
  stock: string;
  status: 'critical' | 'operational' | 'destination';
  lat: number;
  lng: number;
  isCustom?: boolean;
}

interface DisplayRoute {
  id: string;
  code: string;
  name: string;
  origin: string;
  originAddress: string;
  destination: string;
  destinationAddress: string;
  carrier: string;
  transitHours: number;
  distanceKm: number;
  status: 'blocked' | 'active_bypass' | 'optimal' | 'custom';
  startCoords: [number, number];
  endCoords: [number, number];
  isCustom?: boolean;
}

interface FleetVehicle {
  truckId: string;
  driverName: string;
  driverPhone: string;
  carrier: string;
  consignment: string;
  route: string;
  location: string;
  lat: number;
  lng: number;
  heading: number;
  speedKmh: number;
  avgSpeedLast2h: number;
  reeferTempC?: number | null;
  engineStatus: string;
  telematicsStatus: string;
  dutyStatus: string;
  breakTimerMinutes?: number;
  batteryPct?: number;
  isPhoneGps?: boolean;
  emergencyAlert?: {
    type: string;
    message: string;
    reportedAt: string;
    lat: number;
    lng: number;
  } | null;
  anomalyReason?: string | null;
}

const DEFAULT_BENCHMARK_NODES: DisplayNode[] = [
  { id: 'W1', name: 'W1: Mumbai Central DC', city: 'Bhiwandi, Maharashtra', address: 'Bhiwandi Logistics Hub, Mumbai 421302', role: 'Primary Distribution Center', stock: '15% (Buffer Depleting)', status: 'critical', lat: 19.2967, lng: 73.0631 },
  { id: 'JNPT', name: 'JNPT Port Terminal', city: 'Navi Mumbai', address: 'Container Terminal 4, JNPT, Nhava Sheva 400707', role: 'Maritime Container Port', stock: 'Congestion: 18 Vessels Queued', status: 'critical', lat: 18.9499, lng: 72.9515 },
  { id: 'W2', name: 'W2: Pune Satellite', city: 'Chakan, Maharashtra', address: 'MIDC Phase 2, Chakan, Pune 410501', role: 'Automotive & Industrial Hub', stock: '85% (Optimal Safety Stock)', status: 'operational', lat: 18.7606, lng: 73.8643 },
  { id: 'T1', name: 'Surat-Bharuch Transit', city: 'Gujarat Corridor', address: 'NH-48 Golden Quadrilateral Toll Alpha', role: 'Transit Junction Alpha (NH-48)', stock: 'Highway Blocked (Waterlogging)', status: 'critical', lat: 21.1702, lng: 72.8311 },
  { id: 'W3', name: 'W3: Ahmedabad Hub', city: 'Sanand, Gujarat', address: 'Sanand GIDC Logistics Park, Ahmedabad 382110', role: 'Western Manufacturing DC', stock: '92% Available Capacity', status: 'operational', lat: 23.0225, lng: 72.5714 },
  { id: 'T2', name: 'Indore Bypass Hub', city: 'Madhya Pradesh', address: 'Pithampur Industrial Corridor, Indore 452010', role: 'Corridor R3 Re-route Junction', stock: 'Clear Freight Flow (65 km/h)', status: 'operational', lat: 22.7196, lng: 75.8577 },
  { id: 'DEST', name: 'Delhi NCR Fulfilment', city: 'Greater Noida / Kundli', address: 'Kundli Industrial Area, Sonipat / NCR 131028', role: 'Destination Fulfilment Center', stock: '3 Tier-1 SLAs Awaiting Delivery', status: 'destination', lat: 28.6139, lng: 77.2090 },
];

const DEFAULT_BENCHMARK_ROUTES: DisplayRoute[] = [
  {
    id: 'R1',
    code: 'R1',
    name: 'Primary NH-48 Express (Blocked)',
    origin: 'W1: Mumbai Central DC',
    originAddress: 'Bhiwandi Logistics Hub, Mumbai 421302',
    destination: 'DEST: Delhi NCR Fulfilment',
    destinationAddress: 'Kundli Industrial Area, Sonipat / NCR 131028',
    carrier: 'TCI Freight Express',
    transitHours: 32,
    distanceKm: 1420,
    status: 'blocked',
    startCoords: [19.2967, 73.0631],
    endCoords: [28.6139, 77.2090]
  },
  {
    id: 'R2',
    code: 'R2',
    name: 'Coastal Multi-Modal Bypass',
    origin: 'JNPT Port Terminal',
    originAddress: 'Container Terminal 4, JNPT, Nhava Sheva 400707',
    destination: 'DEST: Delhi NCR Fulfilment',
    destinationAddress: 'Kundli Industrial Area, Sonipat / NCR 131028',
    carrier: 'CONCOR Intermodal Rail',
    transitHours: 46,
    distanceKm: 1540,
    status: 'active_bypass',
    startCoords: [18.9499, 72.9515],
    endCoords: [28.6139, 77.2090]
  },
  {
    id: 'R3',
    code: 'R3',
    name: 'Central Arterial Re-route (Optimal)',
    origin: 'W2: Pune Satellite',
    originAddress: 'MIDC Phase 2, Chakan, Pune 410501',
    destination: 'DEST: Delhi NCR Fulfilment',
    destinationAddress: 'Kundli Industrial Area, Sonipat / NCR 131028',
    carrier: 'VRL Surface Logistics',
    transitHours: 26,
    distanceKm: 1390,
    status: 'optimal',
    startCoords: [18.7606, 73.8643],
    endCoords: [28.6139, 77.2090]
  }
];

export const FreightNetworkMap: React.FC<FreightNetworkMapProps> = ({
  activeRoute = 'R1',
  customNodes = [],
  customRoutes = [],
  orgId = 'tata-motors',
  orgName = 'Tata Motors CV',
  onRouteAllotted,
  onSimulateDisruptionOnLane,
  onOpenDriverApp
}) => {
  // DOM & Leaflet Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const nodesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const fleetLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const previewLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Map Modes & State
  const [tileMode, setTileMode] = useState<'dark' | 'light'>('dark');
  const [mouseGps, setMouseGps] = useState<{ lat: number; lng: number } | null>(null);
  const [isAllotting, setIsAllotting] = useState<boolean>(false);
  const [showFleet, setShowFleet] = useState<boolean>(true);
  const [isInternalDriverModalOpen, setIsInternalDriverModalOpen] = useState<boolean>(false);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [pickingTarget, setPickingTarget] = useState<'none' | 'origin' | 'destination'>('none');
  const [selectedItem, setSelectedItem] = useState<{ type: 'node' | 'route' | 'vehicle'; data: any } | null>(null);

  // Allotment Form State
  const [originInput, setOriginInput] = useState<string>('MIDC Phase 2, Chakan, Pune, Maharashtra 410501');
  const [destinationInput, setDestinationInput] = useState<string>('DLF Cyber City, Phase 3, Gurugram, Haryana 122002');
  const [routeCodeInput, setRouteCodeInput] = useState<string>('PUN-DEL-EXP');
  const [carrierInput, setCarrierInput] = useState<string>('Blue Dart Express');
  const [transportMode, setTransportMode] = useState<'ground' | 'air' | 'multimodal' | 'reefer'>('ground');
  const [isSubmittingRoute, setIsSubmittingRoute] = useState<boolean>(false);
  const [allotmentSuccessMsg, setAllotmentSuccessMsg] = useState<string>('');

  // Resolved Coordinates for Preview
  const [resolvedOrigin, setResolvedOrigin] = useState<PinpointLocation>(() => 
    resolveAddressPinpoint('MIDC Phase 2, Chakan, Pune, Maharashtra 410501')
  );
  const [resolvedDest, setResolvedDest] = useState<PinpointLocation>(() => 
    resolveAddressPinpoint('DLF Cyber City, Phase 3, Gurugram, Haryana 122002')
  );

  // Poll Fleet Telematics every 4 seconds
  useEffect(() => {
    let isMounted = true;
    const loadFleet = async () => {
      try {
        const vehicles = await fetchFleetTelematics();
        if (isMounted && Array.isArray(vehicles)) {
          setFleetVehicles(vehicles);
        }
      } catch (err) {
        // Fallback
      }
    };

    loadFleet();
    const pollTimer = setInterval(loadFleet, 4000);
    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, []);

  // Live Geocoding Effect as user types
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const oRes = await geocodeAddressOnline(originInput);
      if (active) setResolvedOrigin(oRes);
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [originInput]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const dRes = await geocodeAddressOnline(destinationInput);
      if (active) setResolvedDest(dRes);
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [destinationInput]);

  // Derived live metrics for preview
  const livePreviewDistance = useMemo(() => {
    return haversineDistanceKm(resolvedOrigin.lat, resolvedOrigin.lng, resolvedDest.lat, resolvedDest.lng);
  }, [resolvedOrigin, resolvedDest]);

  const livePreviewHours = useMemo(() => {
    if (transportMode === 'air') return Math.max(2, Math.round(livePreviewDistance / 450));
    return Math.max(3, Math.round(livePreviewDistance / 48));
  }, [livePreviewDistance, transportMode]);

  // Merge Display Nodes
  const displayNodes: DisplayNode[] = useMemo(() => {
    const nodes: DisplayNode[] = [...DEFAULT_BENCHMARK_NODES];
    customNodes.forEach(cn => {
      let lat = cn.lat;
      let lng = cn.lng;
      if (!lat || !lng) {
        const resolved = resolveAddressPinpoint(cn.address || cn.name);
        lat = resolved.lat;
        lng = resolved.lng;
      }
      nodes.push({
        id: cn.id,
        name: cn.name,
        city: cn.city,
        address: cn.address || `${cn.name}, ${cn.city}`,
        role: `Capacity: ${cn.capacity?.toLocaleString() || '10,000'} Units`,
        stock: `Buffer: ${cn.safetyBufferPct ?? 30}% (${cn.status || 'Active'})`,
        status: (cn.status?.toLowerCase() === 'critical' ? 'critical' : 'operational'),
        lat,
        lng,
        isCustom: true
      });
    });
    return nodes;
  }, [customNodes]);

  // Merge Display Routes
  const displayRoutes: DisplayRoute[] = useMemo(() => {
    const routes: DisplayRoute[] = [...DEFAULT_BENCHMARK_ROUTES];
    customRoutes.forEach(cr => {
      const oRes = resolveAddressPinpoint(cr.originAddress || cr.origin);
      const dRes = resolveAddressPinpoint(cr.destinationAddress || cr.destination);
      const dist = cr.distanceKm || haversineDistanceKm(oRes.lat, oRes.lng, dRes.lat, dRes.lng);
      routes.push({
        id: cr.id,
        code: cr.routeCode,
        name: `${cr.routeCode} (${cr.origin} → ${cr.destination})`,
        origin: cr.origin,
        originAddress: cr.originAddress || cr.origin,
        destination: cr.destination,
        destinationAddress: cr.destinationAddress || cr.destination,
        carrier: cr.carrier || 'Dedicated Fleet',
        transitHours: cr.transitHours || Math.round(dist / 48),
        distanceKm: dist,
        status: 'custom',
        startCoords: [oRes.lat, oRes.lng],
        endCoords: [dRes.lat, dRes.lng],
        isCustom: true
      });
    });
    return routes;
  }, [customRoutes]);

  // 1. Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.8, 78.9],
      zoom: 5,
      zoomControl: false,
      attributionControl: false
    });

    const routesGroup = L.layerGroup().addTo(map);
    const nodesGroup = L.layerGroup().addTo(map);
    const fleetGroup = L.layerGroup().addTo(map);
    const previewGroup = L.layerGroup().addTo(map);

    routesLayerGroupRef.current = routesGroup;
    nodesLayerGroupRef.current = nodesGroup;
    fleetLayerGroupRef.current = fleetGroup;
    previewLayerGroupRef.current = previewGroup;
    mapInstanceRef.current = map;

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseGps({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4))
      });
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(4));
      const lng = Number(e.latlng.lng.toFixed(4));
      window.dispatchEvent(new CustomEvent('map-picked-gps', { detail: { lat, lng } }));
    });

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map-picked-gps events
  useEffect(() => {
    const handlePickedGps = (e: any) => {
      const { lat, lng } = e.detail;
      if (pickingTarget === 'origin') {
        const addressStr = `GPS Point (${lat}° N, ${lng}° E)`;
        setOriginInput(addressStr);
        setResolvedOrigin({
          name: `Point (${lat}, ${lng})`,
          city: 'Selected GPS',
          state: 'India',
          lat,
          lng,
          x: 0,
          y: 0,
          address: addressStr
        });
        setPickingTarget('none');
      } else if (pickingTarget === 'destination') {
        const addressStr = `GPS Point (${lat}° N, ${lng}° E)`;
        setDestinationInput(addressStr);
        setResolvedDest({
          name: `Point (${lat}, ${lng})`,
          city: 'Selected GPS',
          state: 'India',
          lat,
          lng,
          x: 0,
          y: 0,
          address: addressStr
        });
        setPickingTarget('none');
      }
    };

    window.addEventListener('map-picked-gps', handlePickedGps);
    return () => window.removeEventListener('map-picked-gps', handlePickedGps);
  }, [pickingTarget]);

  // 2. Tile Layer Update
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = tileMode === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [tileMode]);

  // 3. Render Routes on GPS Coordinates - Clean Monochrome Lines
  useEffect(() => {
    if (!routesLayerGroupRef.current) return;
    const group = routesLayerGroupRef.current;
    group.clearLayers();

    displayRoutes.forEach(r => {
      const isSelected = selectedItem?.type === 'route' && selectedItem.data.id === r.id;
      const isActive = activeRoute === r.code;

      let color = '#94a3b8';
      let dashArray: string | undefined = undefined;
      let opacity = 0.85;
      let weight = isSelected ? 3 : isActive ? 2.5 : 2;

      if (r.status === 'blocked') {
        color = '#dc2626';
        dashArray = '5, 5';
        weight = 2.5;
        opacity = 0.95;
      } else if (r.status === 'optimal') {
        color = '#f1f5f9';
        weight = 2.5;
        opacity = 0.9;
      } else if (r.status === 'active_bypass') {
        color = '#64748b';
        dashArray = '4, 4';
        weight = 2;
      } else if (r.status === 'custom') {
        color = '#cbd5e1';
        weight = 2.5;
      }

      const curvePoints = interpolateGpsCurve(r.startCoords, r.endCoords, 28);

      const line = L.polyline(curvePoints, {
        color: color,
        weight: weight,
        opacity: opacity,
        dashArray: dashArray,
        lineCap: 'round',
        lineJoin: 'round'
      });

      line.on('click', () => {
        setSelectedItem({ type: 'route', data: r });
      });

      line.bindTooltip(`
        <div class="px-2.5 py-1.5 font-sans text-xs">
          <div class="font-bold text-slate-100">${r.name}</div>
          <div class="text-slate-400 text-[10px] mt-0.5">${r.carrier} • ${r.distanceKm} km • ${r.transitHours}h</div>
        </div>
      `, { sticky: true, className: 'leaflet-custom-tooltip' });

      group.addLayer(line);
    });
  }, [displayRoutes, selectedItem, activeRoute]);

  // 4. Render Clean, Uncluttered Node Markers (No overlapping sub-labels)
  useEffect(() => {
    if (!nodesLayerGroupRef.current) return;
    const group = nodesLayerGroupRef.current;
    group.clearLayers();

    displayNodes.forEach(n => {
      const isSelected = selectedItem?.type === 'node' && selectedItem.data.id === n.id;
      
      let dotColor = 'bg-slate-400';
      if (n.status === 'critical') dotColor = 'bg-red-500';
      else if (n.status === 'destination') dotColor = 'bg-slate-200';
      else if (n.status === 'operational') dotColor = 'bg-emerald-500';

      // Clean, compact pill badge without duplicate sub-label underneath
      const iconHtml = `
        <div class="relative group cursor-pointer flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          <div class="px-1.5 py-0.5 rounded-md bg-slate-900 border ${isSelected ? 'border-white ring-2 ring-white/30 scale-110' : 'border-slate-700'} shadow-md flex items-center gap-1 transition-transform group-hover:scale-110">
            <span class="w-1.5 h-1.5 rounded-full ${dotColor} shrink-0"></span>
            <span class="text-[9px] font-mono font-bold text-slate-200">${n.id}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'bg-transparent',
        iconSize: [32, 20],
        iconAnchor: [16, 10]
      });

      const marker = L.marker([n.lat, n.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedItem({ type: 'node', data: n });
      });

      marker.bindTooltip(`
        <div class="px-2.5 py-1.5 font-sans text-xs">
          <div class="font-bold text-slate-100">${n.name}</div>
          <div class="text-slate-400 text-[10px] mt-0.5">${n.city} • ${n.stock}</div>
        </div>
      `, { direction: 'top', offset: [0, -12], className: 'leaflet-custom-tooltip' });

      group.addLayer(marker);
    });
  }, [displayNodes, selectedItem]);

  // 5. Render Clean Fleet Vehicle Markers (No overlapping floating text)
  useEffect(() => {
    if (!fleetLayerGroupRef.current) return;
    const group = fleetLayerGroupRef.current;
    group.clearLayers();

    if (!showFleet) return;

    fleetVehicles.forEach(v => {
      const isSelected = selectedItem?.type === 'vehicle' && selectedItem.data.truckId === v.truckId;
      const isEmergency = !!v.emergencyAlert;

      // Clean, compact vehicle icon badge
      const iconHtml = `
        <div class="relative group cursor-pointer flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
          ${isEmergency ? `<div class="absolute -top-3 left-1/2 -translate-x-1/2 px-1 bg-red-600 text-white font-mono font-bold text-[7px] rounded">SOS</div>` : ''}
          <div class="px-1.5 py-0.5 rounded-md bg-slate-950 border ${isEmergency ? 'border-red-500 ring-2 ring-red-500/40' : v.isPhoneGps ? 'border-emerald-500' : 'border-slate-700'} shadow-md flex items-center gap-1 transition-transform group-hover:scale-110">
            <svg class="w-3 h-3 ${isEmergency ? 'text-red-400' : 'text-slate-300'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            <span class="text-[8px] font-mono text-slate-200">${v.truckId.split('-')[0]}-${v.truckId.split('-')[1]}</span>
            ${v.isPhoneGps ? `<span class="w-1 h-1 rounded-full bg-emerald-400"></span>` : ''}
          </div>
        </div>
      `;

      const truckIcon = L.divIcon({
        html: iconHtml,
        className: 'bg-transparent',
        iconSize: [36, 18],
        iconAnchor: [18, 9]
      });

      const marker = L.marker([v.lat, v.lng], { icon: truckIcon });

      marker.on('click', () => {
        setSelectedItem({ type: 'vehicle', data: v });
      });

      marker.bindTooltip(`
        <div class="px-2.5 py-1.5 font-sans text-xs">
          <div class="font-bold text-white">${v.truckId} (${v.driverName})</div>
          <div class="text-slate-400 text-[10px] mt-0.5">${v.speedKmh} km/h • ${v.dutyStatus.replace(/_/g, ' ')} ${v.isPhoneGps ? '• Live Phone GPS' : ''}</div>
          ${v.emergencyAlert ? `<div class="text-red-400 text-[10px] font-bold mt-1">SOS: ${v.emergencyAlert.message}</div>` : ''}
        </div>
      `, { direction: 'top', offset: [0, -10], className: 'leaflet-custom-tooltip' });

      group.addLayer(marker);
    });
  }, [fleetVehicles, showFleet, selectedItem]);

  // 6. Preview Route in Allotment Mode
  useEffect(() => {
    if (!previewLayerGroupRef.current) return;
    const group = previewLayerGroupRef.current;
    group.clearLayers();

    if (!isAllotting) return;

    const start: [number, number] = [resolvedOrigin.lat, resolvedOrigin.lng];
    const end: [number, number] = [resolvedDest.lat, resolvedDest.lng];

    const originIcon = L.divIcon({
      html: `<div class="w-5 h-5 rounded-full bg-slate-900 border border-slate-400 text-white font-mono text-[9px] font-bold flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow">A</div>`,
      className: 'bg-transparent',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    group.addLayer(L.marker(start, { icon: originIcon }));

    const destIcon = L.divIcon({
      html: `<div class="w-5 h-5 rounded-full bg-slate-900 border border-slate-400 text-white font-mono text-[9px] font-bold flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow">B</div>`,
      className: 'bg-transparent',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    group.addLayer(L.marker(end, { icon: destIcon }));

    const curvePoints = interpolateGpsCurve(start, end, 28);
    const previewLine = L.polyline(curvePoints, {
      color: '#f8fafc',
      weight: 2,
      dashArray: '5, 5',
      opacity: 0.85
    });
    group.addLayer(previewLine);
  }, [isAllotting, resolvedOrigin, resolvedDest]);

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || displayNodes.length === 0) return;
    const bounds = L.latLngBounds(displayNodes.map(n => [n.lat, n.lng]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  };

  const handleFocusPreview = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      [resolvedOrigin.lat, resolvedOrigin.lng],
      [resolvedDest.lat, resolvedDest.lng]
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 9 });
  };

  const handleSubmitRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRoute(true);
    setAllotmentSuccessMsg('');

    try {
      const code = routeCodeInput.trim() || `${resolvedOrigin.city.slice(0, 3).toUpperCase()}-${resolvedDest.city.slice(0, 3).toUpperCase()}-EXP`;
      await addCompanyRoute({
        orgId: orgId,
        routeCode: code,
        origin: resolvedOrigin.city || resolvedOrigin.name,
        destination: resolvedDest.city || resolvedDest.name,
        originAddress: originInput,
        destinationAddress: destinationInput,
        transitHours: livePreviewHours,
        carrier: carrierInput,
        distanceKm: livePreviewDistance
      });

      setAllotmentSuccessMsg(`Corridor ${code} registered`);
      if (onRouteAllotted) onRouteAllotted();

      setTimeout(() => {
        setIsAllotting(false);
        setAllotmentSuccessMsg('');
      }, 1400);
    } catch (err: any) {
      alert(`Failed to allot route: ${err.message || err}`);
    } finally {
      setIsSubmittingRoute(false);
    }
  };

  const handleOpenDriverModal = () => {
    if (onOpenDriverApp) {
      onOpenDriverApp();
    } else {
      setIsInternalDriverModalOpen(true);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Clean, De-cluttered Control Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Navigation className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">GPS Freight Network</h3>
              <span className="text-[11px] text-slate-500">
                {displayNodes.length} Hubs • {displayRoutes.length} Corridors • {fleetVehicles.length} Vehicles
              </span>
            </div>
          </div>
        </div>

        {/* Clean Right Controls Bar */}
        <div className="flex items-center gap-2">
          {/* Subtle Tile Toggle */}
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setTileMode('dark')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                tileMode === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTileMode('light')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                tileMode === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Light
            </button>
          </div>

          {/* Fleet Visibility Toggle */}
          <button
            onClick={() => setShowFleet(!showFleet)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showFleet 
                ? 'bg-slate-900 text-white border-slate-800' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Fleet</span>
          </button>

          {/* Driver Mobile App Launcher */}
          <button
            onClick={handleOpenDriverModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Smartphone className="w-3 h-3 text-slate-600" />
            <span>Driver App</span>
          </button>

          {/* Fit Network Bounds */}
          <button
            onClick={handleFitBounds}
            title="Fit network in view"
            className="p-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => setIsAllotting(!isAllotting)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              isAllotting
                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isAllotting ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            <span>{isAllotting ? 'Close' : 'Allot Route'}</span>
          </button>
        </div>
      </div>

      {/* Map Body Canvas */}
      <div className="relative w-full h-[520px] bg-slate-950 select-none overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Picking on Map Prompt */}
        {pickingTarget !== 'none' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 text-white border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-md text-xs shadow-lg">
            <Crosshair className="w-3.5 h-3.5 text-slate-300" />
            <span>Click map to select <strong>{pickingTarget}</strong></span>
            <button
              onClick={() => setPickingTarget('none')}
              className="ml-1 text-slate-400 hover:text-white text-[10px] underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-7 h-7 rounded-md bg-slate-900/90 text-white border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors shadow"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-7 h-7 rounded-md bg-slate-900/90 text-white border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors shadow"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Coordinates Pill */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded text-slate-400 text-[10px] font-mono backdrop-blur-xs shadow">
          {mouseGps ? (
            <span>Lat: {mouseGps.lat}° N, Lng: {mouseGps.lng}° E</span>
          ) : (
            <span>Hover map for GPS</span>
          )}
        </div>

        {/* Inspector Drawer */}
        {selectedItem && (
          <div className="absolute top-3 right-3 bottom-12 z-20 w-80 bg-slate-900/95 border border-slate-800 text-white rounded-xl shadow-xl p-4 flex flex-col justify-between backdrop-blur-md overflow-y-auto">
            <div>
              <div className="flex items-start justify-between pb-2.5 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                    {selectedItem.type === 'node' ? 'DC Hub' : selectedItem.type === 'vehicle' ? 'Fleet Telematics' : 'Corridor'}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-0.5 leading-snug">
                    {selectedItem.type === 'vehicle' ? selectedItem.data.truckId : selectedItem.data.name}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedItem.type === 'node' ? (
                <div className="mt-3 space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Location</span>
                    <p className="font-mono text-slate-300 text-xs mt-0.5">{selectedItem.data.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px]">GPS</span>
                      <div className="font-mono text-slate-200 text-xs">{selectedItem.data.lat}° N, {selectedItem.data.lng}° E</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Status</span>
                      <div className="font-semibold text-slate-200 text-xs capitalize">{selectedItem.data.status}</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Capacity & Buffer</span>
                    <p className="text-slate-300 text-xs mt-0.5">{selectedItem.data.role}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{selectedItem.data.stock}</p>
                  </div>
                </div>
              ) : selectedItem.type === 'vehicle' ? (
                <div className="mt-3 space-y-2.5 text-xs">
                  {selectedItem.data.emergencyAlert && (
                    <div className="bg-red-950/80 border border-red-800 p-2 rounded-lg text-red-200 text-xs">
                      <div className="font-bold text-red-400 flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3 h-3" />
                        <span>EMERGENCY SOS ALERT</span>
                      </div>
                      <p className="text-[11px] mt-0.5">{selectedItem.data.emergencyAlert.message}</p>
                    </div>
                  )}

                  <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{selectedItem.data.driverName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{selectedItem.data.driverPhone}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-200 uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                        {selectedItem.data.dutyStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2 rounded-lg border border-slate-800 text-center">
                    <div>
                      <span className="text-slate-400 text-[10px]">Speed</span>
                      <div className="font-mono text-white font-bold">{selectedItem.data.speedKmh} km/h</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Telemetry Link</span>
                      <div className="font-mono text-slate-200 text-xs mt-0.5">
                        {selectedItem.data.isPhoneGps ? 'Phone GPS' : 'OBD-II'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px]">Consignment</span>
                    <p className="text-slate-200 text-xs mt-0.5">{selectedItem.data.consignment}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{selectedItem.data.carrier}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={handleOpenDriverModal}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Smartphone className="w-3 h-3 text-slate-400" />
                      <span>Open Driver Console</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Corridor Path</span>
                    <div className="flex items-center gap-1 text-slate-200 font-semibold mt-0.5">
                      <span>{selectedItem.data.origin}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{selectedItem.data.destination}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-2 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px]">Distance</span>
                      <div className="font-mono text-white font-bold">{selectedItem.data.distanceKm} KM</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Lead Time</span>
                      <div className="font-mono text-slate-200 font-bold">{selectedItem.data.transitHours} Hours</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Carrier</span>
                    <p className="font-mono text-slate-300 text-xs mt-0.5">{selectedItem.data.carrier}</p>
                  </div>
                </div>
              )}
            </div>

            {selectedItem.type === 'route' && onSimulateDisruptionOnLane && (
              <button
                onClick={() => onSimulateDisruptionOnLane(selectedItem.data.code)}
                className="mt-3 w-full py-1.5 bg-red-900/60 hover:bg-red-900 text-red-200 border border-red-800/80 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>Simulate Outage</span>
              </button>
            )}
          </div>
        )}

        {/* Allot Route Drawer */}
        {isAllotting && (
          <div className="absolute top-3 left-3 bottom-3 z-20 w-88 bg-slate-900/95 border border-slate-800 text-white rounded-xl shadow-xl p-4 flex flex-col justify-between backdrop-blur-md overflow-y-auto">
            <form onSubmit={handleSubmitRoute} className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                  <Route className="w-3.5 h-3.5 text-slate-300" />
                  <span>Allot Route</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAllotting(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Origin */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium text-[11px]">Origin Address / PIN</label>
                  <button
                    type="button"
                    onClick={() => setPickingTarget(pickingTarget === 'origin' ? 'none' : 'origin')}
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      pickingTarget === 'origin' ? 'bg-slate-100 text-slate-900' : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Pick on Map
                  </button>
                </div>
                <input
                  type="text"
                  value={originInput}
                  onChange={(e) => setOriginInput(e.target.value)}
                  placeholder="e.g. Pune Chakan 410501"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                  required
                />
              </div>

              {/* Destination */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium text-[11px]">Destination Address / PIN</label>
                  <button
                    type="button"
                    onClick={() => setPickingTarget(pickingTarget === 'destination' ? 'none' : 'destination')}
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      pickingTarget === 'destination' ? 'bg-slate-100 text-slate-900' : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Pick on Map
                  </button>
                </div>
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => setDestinationInput(e.target.value)}
                  placeholder="e.g. Gurugram 122002"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                  required
                />
              </div>

              {/* Route Code & Carrier */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium text-[10px] block mb-0.5">Code</label>
                  <input
                    type="text"
                    value={routeCodeInput}
                    onChange={(e) => setRouteCodeInput(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium text-[10px] block mb-0.5">Carrier</label>
                  <input
                    type="text"
                    value={carrierInput}
                    onChange={(e) => setCarrierInput(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    required
                  />
                </div>
              </div>

              {/* Calculated Metrics */}
              <div className="bg-slate-800/80 rounded-lg p-2 flex items-center justify-around text-center">
                <div>
                  <span className="text-[9px] text-slate-400">Distance</span>
                  <div className="font-mono font-bold text-white text-xs">{livePreviewDistance} KM</div>
                </div>
                <div className="h-6 w-px bg-slate-700" />
                <div>
                  <span className="text-[9px] text-slate-400">Lead Time</span>
                  <div className="font-mono font-bold text-slate-200 text-xs">~{livePreviewHours} Hours</div>
                </div>
              </div>

              {allotmentSuccessMsg && (
                <div className="p-2 bg-slate-800 border border-slate-600 rounded text-slate-200 text-xs flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{allotmentSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingRoute}
                className="w-full py-2 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all mt-1"
              >
                {isSubmittingRoute ? <span>Saving...</span> : <span>Save & Allot Corridor</span>}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Compact Legend Footer */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3.5 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-red-600 rounded-full" />
            <span>Disrupted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-slate-400 rounded-full" />
            <span>Bypass</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-slate-200 border border-slate-300 rounded-full" />
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-slate-600" />
            <span>Fleet Vector</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          CartoDB Tiles • Live Telematics Grid
        </div>
      </div>

      {/* Driver Modal */}
      <DriverCompanionModal
        isOpen={isInternalDriverModalOpen}
        onClose={() => setIsInternalDriverModalOpen(false)}
        assignedRouteCode={activeRoute}
        onEmergencyDispatched={() => {
          setIsInternalDriverModalOpen(false);
          fetchFleetTelematics().then(res => {
            if (Array.isArray(res)) setFleetVehicles(res);
          });
        }}
      />
    </div>
  );
};
