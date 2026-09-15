import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  Compass, 
  Clock, 
  Route as RouteIcon,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import L from 'leaflet';
import { geocodeLocation, calculateRoadRoute, dispatchCustomRoute, resetCustomRoute } from '../services/api';

interface CustomRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteDispatched?: (routeData: any) => void;
  defaultTruckId?: string;
}

export const CustomRouteModal: React.FC<CustomRouteModalProps> = ({
  isOpen,
  onClose,
  onRouteDispatched,
  defaultTruckId = 'MH-04-GP-8821'
}) => {
  // Route Query Inputs
  const [originInput, setOriginInput] = useState<string>('Mumbai');
  const [destinationInput, setDestinationInput] = useState<string>('Bengaluru');
  const [selectedTruck, setSelectedTruck] = useState<string>(defaultTruckId);

  // Resolved Coordinates & Addresses
  const [originGeo, setOriginGeo] = useState<any>(null);
  const [destGeo, setDestGeo] = useState<any>(null);

  // Autocomplete Suggestions
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState<boolean>(false);
  const [isSearchingDest, setIsSearchingDest] = useState<boolean>(false);

  // Calculated Road Route
  const [routeResult, setRouteResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  // Leaflet Map Preview
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);

  // Preset Popular Indian Supply Corridors
  const presetCorridors = [
    { name: 'Mumbai ➔ Bengaluru', origin: 'Mumbai', dest: 'Bengaluru' },
    { name: 'Delhi ➔ Kolkata', origin: 'Delhi', dest: 'Kolkata' },
    { name: 'Chennai ➔ Hyderabad', origin: 'Chennai', dest: 'Hyderabad' },
    { name: 'Pune ➔ Ahmedabad', origin: 'Pune', dest: 'Ahmedabad' },
    { name: 'Kochi ➔ Bengaluru', origin: 'Kochi', dest: 'Bengaluru' }
  ];

  // Search Origin Suggestions
  const handleOriginSearch = async (val: string) => {
    setOriginInput(val);
    if (val.trim().length >= 3) {
      setIsSearchingOrigin(true);
      const res = await geocodeLocation(val);
      setOriginSuggestions(res);
      setIsSearchingOrigin(false);
    } else {
      setOriginSuggestions([]);
    }
  };

  // Search Destination Suggestions
  const handleDestSearch = async (val: string) => {
    setDestinationInput(val);
    if (val.trim().length >= 3) {
      setIsSearchingDest(true);
      const res = await geocodeLocation(val);
      setDestSuggestions(res);
      setIsSearchingDest(false);
    } else {
      setDestSuggestions([]);
    }
  };

  // Select Origin Suggestion
  const selectOrigin = (item: any) => {
    setOriginGeo(item);
    setOriginInput(item.title);
    setOriginSuggestions([]);
  };

  // Select Destination Suggestion
  const selectDest = (item: any) => {
    setDestGeo(item);
    setDestinationInput(item.title);
    setDestSuggestions([]);
  };

  // Calculate Real-Road Route with OSRM
  const handleCalculateRoute = async () => {
    setErrorMsg('');
    setDispatchSuccess(null);
    setIsCalculating(true);

    try {
      // 1. Resolve origin coordinates if not already resolved
      let oGeo = originGeo;
      if (!oGeo) {
        const oResults = await geocodeLocation(originInput);
        if (oResults && oResults.length > 0) {
          oGeo = oResults[0];
          setOriginGeo(oGeo);
        } else {
          setErrorMsg(`Could not locate origin: "${originInput}". Please choose from suggestions or try a known city.`);
          setIsCalculating(false);
          return;
        }
      }

      // 2. Resolve destination coordinates if not already resolved
      let dGeo = destGeo;
      if (!dGeo) {
        const dResults = await geocodeLocation(destinationInput);
        if (dResults && dResults.length > 0) {
          dGeo = dResults[0];
          setDestGeo(dGeo);
        } else {
          setErrorMsg(`Could not locate destination: "${destinationInput}". Please choose from suggestions or try a known city.`);
          setIsCalculating(false);
          return;
        }
      }

      // 3. Call OSRM Route Engine
      const res = await calculateRoadRoute({
        origin: oGeo.title,
        destination: dGeo.title,
        originLat: oGeo.lat,
        originLng: oGeo.lng,
        destLat: dGeo.lat,
        destLng: dGeo.lng
      });

      if (res && res.polyline && res.polyline.length > 0) {
        setRouteResult(res);
      } else {
        setErrorMsg('Failed to calculate road route. Please verify both locations.');
      }
    } catch (err: any) {
      setErrorMsg(`Routing error: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  // Dispatch Calculated Route to Driver Phone
  const handleDispatchToDriver = async () => {
    if (!routeResult || !originGeo || !destGeo) return;
    setIsDispatching(true);
    try {
      const payload = {
        truckId: selectedTruck,
        origin: originGeo.title,
        destination: destGeo.title,
        originAddress: originGeo.displayName,
        destinationAddress: destGeo.displayName,
        distanceKm: routeResult.distanceKm,
        durationHours: routeResult.durationHours,
        etaFormatted: routeResult.etaFormatted,
        polyline: routeResult.polyline,
        steps: routeResult.steps,
        firstManoeuvre: routeResult.firstManoeuvre,
        firstManoeuvreHi: routeResult.firstManoeuvreHi,
        routeCode: `${originGeo.title.slice(0, 3).toUpperCase()}-${destGeo.title.slice(0, 3).toUpperCase()}-EXP`
      };

      await dispatchCustomRoute(payload);
      setDispatchSuccess(`Route successfully dispatched to ${selectedTruck}! The driver mobile app is now navigating this real road.`);
      if (onRouteDispatched) {
        onRouteDispatched(payload);
      }
    } catch (err) {
      setErrorMsg('Failed to dispatch route to truck telemetry.');
    } finally {
      setIsDispatching(false);
    }
  };

  // Reset Truck Route Back to Standard Corridor
  const handleResetToStandard = async () => {
    try {
      await resetCustomRoute(selectedTruck);
      setRouteResult(null);
      setDispatchSuccess(`Cleared custom route for ${selectedTruck}. Reset to standard NH-48 corridor.`);
    } catch (err) {
      setErrorMsg('Failed to reset route.');
    }
  };

  // Initialize and Update Leaflet Map Preview
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)?._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629], // Center of India
        zoom: 5,
        zoomControl: true,
        attributionControl: false
      });

      const cartoKey = (import.meta as any).env?.VITE_CARTO_API_KEY;
      const tileUrl = cartoKey
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoKey}`
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: cartoKey ? 'abcd' : 'abc',
        attribution: cartoKey ? '&copy; OpenStreetMap, &copy; CARTO' : '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update markers and polyline when routeResult changes
    if (routeResult && routeResult.polyline && routeResult.polyline.length > 0) {
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
      }
      if (originMarkerRef.current) {
        map.removeLayer(originMarkerRef.current);
      }
      if (destMarkerRef.current) {
        map.removeLayer(destMarkerRef.current);
      }

      // Draw road-snapped polyline
      const poly = L.polyline(routeResult.polyline, {
        color: '#0284c7', // Sky-600
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round'
      }).addTo(map);
      polylineRef.current = poly;

      // Fit bounds with padding
      map.fitBounds(poly.getBounds(), { padding: [30, 30] });

      // Origin Marker (Green)
      const startPt = routeResult.polyline[0];
      const startIcon = L.divIcon({
        className: 'origin-pin',
        html: `
          <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">
            A
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      originMarkerRef.current = L.marker(startPt, { icon: startIcon })
        .bindPopup(`<b>Origin:</b> ${originInput}`)
        .addTo(map);

      // Destination Marker (Rose)
      const endPt = routeResult.polyline[routeResult.polyline.length - 1];
      const endIcon = L.divIcon({
        className: 'dest-pin',
        html: `
          <div class="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">
            B
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      destMarkerRef.current = L.marker(endPt, { icon: endIcon })
        .bindPopup(`<b>Destination:</b> ${destinationInput}`)
        .addTo(map);
    }
  }, [isOpen, routeResult]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Real-Road Route Builder & Dispatcher</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  OSRM Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate true asphalt highway geometry and dispatch custom routes directly to mobile drivers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          
          {/* Preset Corridor Chips */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Indian Logistics Corridors
            </span>
            <div className="flex flex-wrap gap-2">
              {presetCorridors.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setOriginInput(c.origin);
                    setDestinationInput(c.dest);
                    setOriginGeo(null);
                    setDestGeo(null);
                    setRouteResult(null);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RouteIcon className="w-3 h-3 text-slate-500" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Origin Input */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Origin City / DC</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={originInput}
                  onChange={(e) => handleOriginSearch(e.target.value)}
                  placeholder="e.g. Mumbai, Pune Chakan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-sky-500"
                />
                {isSearchingOrigin && (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-2.5" />
                )}
              </div>

              {/* Origin Autocomplete Dropdown */}
              {originSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                  {originSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectOrigin(s)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <div className="font-bold text-slate-800">{s.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{s.displayName}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Input */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Destination Hub</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destinationInput}
                  onChange={(e) => handleDestSearch(e.target.value)}
                  placeholder="e.g. Bengaluru, Delhi NCR..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-sky-500"
                />
                {isSearchingDest && (
                  <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3 top-2.5" />
                )}
              </div>

              {/* Destination Autocomplete Dropdown */}
              {destSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                  {destSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectDest(s)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <div className="font-bold text-slate-800">{s.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{s.displayName}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assign Truck */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <span>Assign Fleet Vehicle</span>
              </label>
              <select
                value={selectedTruck}
                onChange={(e) => setSelectedTruck(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="MH-04-GP-8821">MH-04-GP-8821 (Tata Prima 3530)</option>
                <option value="MH-12-QZ-4109">MH-12-QZ-4109 (BharatBenz Reefer)</option>
                <option value="GJ-06-AX-2098">GJ-06-AX-2098 (Ashok Leyland 4220)</option>
                <option value="DL-01-AA-7821">DL-01-AA-7821 (Eicher Pro 6028)</option>
              </select>
            </div>

          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCalculateRoute}
              disabled={isCalculating || !originInput.trim() || !destinationInput.trim()}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Real Road Snapping...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Calculate Real Road Route (OSRM)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetToStandard}
              className="px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Truck to Standard Corridor</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {dispatchSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{dispatchSuccess}</span>
            </div>
          )}

          {/* Route Results & Preview Section */}
          {routeResult && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              
              {/* Road Metrics Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">True Road Distance</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{routeResult.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Transit Time</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{routeResult.etaFormatted}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Asphalt Road Points</span>
                  <span className="text-base font-bold text-sky-700 font-mono">{routeResult.totalPoints} coordinates</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Routing Engine</span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 block">OpenStreetMap OSRM</span>
                </div>
              </div>

              {/* Map Preview Container */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-64 bg-slate-100 relative">
                <div ref={mapContainerRef} className="w-full h-full" />
              </div>

              {/* Turn Steps List Preview */}
              {routeResult.steps && routeResult.steps.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 max-h-40 overflow-y-auto space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Turn-by-Turn Road Guidance ({routeResult.steps.length} maneuvers)
                  </div>
                  {routeResult.steps.slice(0, 10).map((st: any, idx: number) => (
                    <div key={idx} className="text-xs flex items-center justify-between text-slate-700 py-1 border-b border-slate-200/40 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-mono font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-[11px]">{st.instruction}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{st.distanceStr}</span>
                    </div>
                  ))}
                  {routeResult.steps.length > 10 && (
                    <div className="text-[10px] text-slate-400 text-center pt-1 italic">
                      + {routeResult.steps.length - 10} additional road maneuvers
                    </div>
                  )}
                </div>
              )}

              {/* Dispatch Action */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  Ready to broadcast to driver smartphone: <strong className="text-slate-800">{selectedTruck}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleDispatchToDriver}
                  disabled={isDispatching}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>{isDispatching ? 'Transmitting to Driver...' : 'Dispatch Route to Driver Phone'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
          <span>Powered by OpenStreetMap & OSRM Engine • 100% Free & Open-Source</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
