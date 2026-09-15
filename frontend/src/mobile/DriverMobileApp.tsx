import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Coffee, 
  CheckCircle2, 
  Radio, 
  BatteryCharging, 
  X, 
  Play, 
  Square, 
  Truck, 
  Route as RouteIcon, 
  Compass, 
  Wifi, 
  WifiOff, 
  ChevronRight, 
  ShieldCheck,
  Send,
  RefreshCw,
  PhoneCall,
  QrCode,
  FileText,
  Check,
  AlertCircle,
  Eye,
  MessageSquare,
  Wrench,
  Fuel,
  Maximize2,
  Minimize2,
  Layers,
  ArrowRight,
  ExternalLink,
  Laptop,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Download,
  Globe
} from 'lucide-react';
import QRCode from 'qrcode';
import L from 'leaflet';
import { 
  sendDriverTelemetry, 
  sendDriverDuty, 
  sendDriverEmergency,
  fetchDriverTrip,
  fetchDriverMessages,
  sendDriverChatMessage,
  submitDriverInspection,
  pushDriverReroute,
  acceptDriverReroute,
  resetDriverReroute
} from '../services/api';

interface DriverMobileAppProps {
  isEmbedded?: boolean;
  onSwitchToDesktop?: () => void;
  defaultTruckId?: string;
}

export const DriverMobileApp: React.FC<DriverMobileAppProps> = ({
  isEmbedded = false,
  onSwitchToDesktop,
  defaultTruckId = 'MH-04-GP-8821'
}) => {
  // Navigation Tabs: 'nav' | 'eway' | 'duty' | 'dispatch'
  const [activeTab, setActiveTab] = useState<'nav' | 'eway' | 'duty' | 'dispatch'>('nav');

  // Truck & Driver Profile
  const [truckId, setTruckId] = useState<string>(defaultTruckId);
  const [driverName, setDriverName] = useState<string>('Rameshwar Yadav');
  const [driverPhone, setDriverPhone] = useState<string>('+91 98201 44819');
  const [carrier, setCarrier] = useState<string>('Allcargo Logistics Express');
  const [routeCode, setRouteCode] = useState<string>('PUN-DEL-EXP');

  // Trip & Route State
  const [tripData, setTripData] = useState<any>(null);
  const [loadingTrip, setLoadingTrip] = useState<boolean>(true);

  // Closed-Loop Dynamic Rerouting State
  const [activeReroute, setActiveReroute] = useState<any>(null);
  const [isAcceptingReroute, setIsAcceptingReroute] = useState<boolean>(false);
  const [rerouteAlertDismissed, setRerouteAlertDismissed] = useState<boolean>(false);
  const [hasVibratedForReroute, setHasVibratedForReroute] = useState<boolean>(false);
  const [rerouteSuccessToast, setRerouteSuccessToast] = useState<string | null>(null);

  // Real Hardware GPS & Device State
  const [isPhoneGpsActive, setIsPhoneGpsActive] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string>('');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 21.7051, // Bharuch / Narmada Bridge on NH-48
    lng: 72.9959
  });
  const [speedKmh, setSpeedKmh] = useState<number>(54.0);
  const [heading, setHeading] = useState<number>(24);
  const [accuracyMeters, setAccuracyMeters] = useState<number>(4);
  const [batteryPct, setBatteryPct] = useState<number>(88);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Driving Simulation State (for demo testing without walking)
  const [isSimulatingDrive, setIsSimulatingDrive] = useState<boolean>(false);
  const simIntervalRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const currentPathIdxRef = useRef<number>(0);

  // Duty Status & Breaks
  const [dutyStatus, setDutyStatus] = useState<string>('ON_DUTY_DRIVING');
  const [dutySeconds, setDutySeconds] = useState<number>(1420);
  const [drivingSeconds, setDrivingSeconds] = useState<number>(1150);
  const [breakTimerSeconds, setBreakTimerSeconds] = useState<number>(0);
  const [isBreakTimerActive, setIsBreakTimerActive] = useState<boolean>(false);

  // e-Way Bill & QR Code State
  const [ewayQrDataUrl, setEwayQrDataUrl] = useState<string>('');
  const [isQrFullscreen, setIsQrFullscreen] = useState<boolean>(false);

  // Dispatch Messages
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // Pre-Trip Inspection Form
  const [odometer, setOdometer] = useState<number>(42810);
  const [inspectionChecks, setInspectionChecks] = useState({
    tyres: true,
    brakes: true,
    reefer: true,
    fluids: true,
    lights: true,
    safetyKit: true
  });
  const [inspectionNotes, setInspectionNotes] = useState<string>('');
  const [inspectionSubmitted, setInspectionSubmitted] = useState<boolean>(false);
  const [inspectionSubmitting, setInspectionSubmitting] = useState<boolean>(false);

  // Emergency SOS State
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string>('HIGHWAY_BLOCKAGE');
  const [emergencyNotes, setEmergencyNotes] = useState<string>('');
  const [isSubmittingEmergency, setIsSubmittingEmergency] = useState<boolean>(false);
  const [emergencyAlertSent, setEmergencyAlertSent] = useState<boolean>(false);

  // Voice Guidance (Hindi & English) State
  const [isVoiceGuidanceEnabled, setIsVoiceGuidanceEnabled] = useState<boolean>(true);
  const [voiceLanguage, setVoiceLanguage] = useState<'hi' | 'en'>('hi');

  // Speech-to-Text Dictation State
  const [isListeningDispatch, setIsListeningDispatch] = useState<boolean>(false);
  const [isListeningEmergency, setIsListeningEmergency] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Offline Dead-Zone & PWA State
  const [isOffline, setIsOffline] = useState<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);

  // Leaflet Map Ref
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const hazardMarkerRef = useRef<L.Marker | null>(null);

  // Audio Speech Synthesis Helper (Supports Hindi & English)
  const speakGuidance = (textEn: string, textHi: string) => {
    if (!isVoiceGuidanceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const isHindi = voiceLanguage === 'hi';
      const utterance = new SpeechSynthesisUtterance(isHindi ? textHi : textEn);
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => isHindi
        ? (v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'))
        : (v.lang.includes('en-IN') || v.lang.includes('en'))
      );
      if (matchedVoice) utterance.voice = matchedVoice;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis warning:', err);
    }
  };

  // Web Speech API: Speech-to-Text for Hands-Free Driving
  const startSpeechToText = (target: 'dispatch' | 'emergency') => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition is not supported on this browser. You can type notes manually.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRec();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = voiceLanguage === 'hi' ? 'hi-IN' : 'en-IN';

    if (target === 'dispatch') {
      setIsListeningDispatch(true);
    } else {
      setIsListeningEmergency(true);
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (target === 'dispatch') {
        setNewMessageText(prev => prev ? `${prev} ${transcript}` : transcript);
      } else {
        setEmergencyNotes(prev => prev ? `${prev} ${transcript}` : transcript);
      }
    };

    recognition.onerror = (e: any) => {
      console.warn('Speech recognition error:', e.error);
      setIsListeningDispatch(false);
      setIsListeningEmergency(false);
    };

    recognition.onend = () => {
      setIsListeningDispatch(false);
      setIsListeningEmergency(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Speech start error:', e);
      setIsListeningDispatch(false);
      setIsListeningEmergency(false);
    }
  };

  const stopSpeechToText = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListeningDispatch(false);
    setIsListeningEmergency(false);
  };

  // Online / Offline Dead-Zone Listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const choiceResult = await deferredInstallPrompt.userChoice;
    if (choiceResult && choiceResult.outcome === 'accepted') {
      setIsAppInstalled(true);
    }
    setDeferredInstallPrompt(null);
  };

  // Standard corridor waypoints: Kharar -> Mohali -> Ambala -> Kurukshetra -> Karnal -> Panipat -> Delhi NCR
  const standardCorridorCoords: [number, number][] = [
    [30.7456, 76.6465], // Kharar Central DC
    [30.6820, 76.7350], // Mohali
    [30.5200, 76.7500], // Banur
    [30.3782, 76.7767], // Ambala Cantt
    [29.9695, 76.8783], // Kurukshetra
    [29.6857, 76.9905], // Karnal
    [29.3909, 76.9635], // Panipat
    [28.8700, 77.1200]  // Kundli / Delhi NCR
  ];

  // Update clock every 10s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Duty status timer ticks every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDutySeconds(prev => prev + 1);
      if (dutyStatus === 'ON_DUTY_DRIVING') {
        setDrivingSeconds(prev => prev + 1);
      }
      if (isBreakTimerActive && breakTimerSeconds > 0) {
        setBreakTimerSeconds(prev => {
          if (prev <= 1) {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([400, 200, 400]);
            }
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [dutyStatus, isBreakTimerActive, breakTimerSeconds]);

  // Battery detection if browser supports Battery API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryPct(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryPct(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }
  }, []);

  // Fetch Trip Data & Messages from backend
  const loadTripData = async () => {
    try {
      const data = await fetchDriverTrip(truckId);
      if (data) {
        setTripData(data);
        setDriverName(data.driverName || 'Rameshwar Yadav');
        setDriverPhone(data.driverPhone || '+91 98201 44819');
        setCarrier(data.carrier || 'Allcargo Logistics Express');
        setRouteCode(data.routeCode || 'PUN-DEL-EXP');

        // Check for closed-loop reroute from HQ
        if (data.activeReroute) {
          setActiveReroute(data.activeReroute);
          if (data.activeReroute.status === 'PROPOSED' && !hasVibratedForReroute) {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([300, 100, 300, 100, 400]);
            }
            speakGuidance(
              "Attention driver: HQ has approved a detour via State Highway 188 to bypass Narmada bridge flooding. Please review and accept the detour.",
              "Dhyan dein: Baadh ke karan HQ ne State Highway 188 se naya detour rasta manzoor kiya hai. Kripya naye raste ki pushti karein."
            );
            setHasVibratedForReroute(true);
          }
        } else {
          setActiveReroute(null);
          setHasVibratedForReroute(false);
        }

        if (data.currentLat && data.currentLng) {
          setCurrentCoords({ lat: data.currentLat, lng: data.currentLng });
        }
        if (data.speedKmh !== undefined) {
          setSpeedKmh(data.speedKmh);
        }
        if (data.messages) {
          setMessages(data.messages);
        }

        // Generate QR code for e-Way Bill
        if (data.ewayBill && !ewayQrDataUrl) {
          const qrString = data.ewayBill.qrPayload || `GSTIN:${data.ewayBill.consignor?.gstin}|EWB:${data.ewayBill.billNumber}|VAL:${data.ewayBill.cargo?.totalAmountInr}`;
          const url = await QRCode.toDataURL(qrString, {
            width: 320,
            margin: 2,
            color: { dark: '#020617', light: '#ffffff' }
          });
          setEwayQrDataUrl(url);
        }
      }
    } catch (e) {
      console.warn('Trip load warning:', e);
    } finally {
      setLoadingTrip(false);
    }
  };

  // Continuous auto-polling every 3.5s so when HQ approves reroute on desktop, mobile updates live!
  useEffect(() => {
    loadTripData();
    const pollInterval = setInterval(() => {
      loadTripData();
    }, 3500);
    return () => clearInterval(pollInterval);
  }, [truckId, hasVibratedForReroute]);

  // Handle Driver Accepting Proposed Reroute
  const handleAcceptReroute = async () => {
    if (!activeReroute) return;
    setIsAcceptingReroute(true);
    try {
      await acceptDriverReroute({
        truckId,
        rerouteId: activeReroute.rerouteId
      });
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      speakGuidance(
        "Detour via State Highway 188 activated. GPS navigation updated.",
        "SH-188 detour rasta lagu ho gaya hai. GPS navigation update kar di gayi hai."
      );
      setRerouteSuccessToast('Detour via SH-188 Activated. GPS Navigation Updated.');
      setTimeout(() => setRerouteSuccessToast(null), 4000);
      setRerouteAlertDismissed(true);
      await loadTripData();
    } catch (err) {
      console.error('Failed to accept reroute:', err);
    } finally {
      setIsAcceptingReroute(false);
    }
  };

  // Demo Trigger: Simulate HQ Pushing Reroute
  const handleSimulateHqReroutePush = async () => {
    await pushDriverReroute({
      truckId,
      incidentId: 'disr-01',
      strategyId: 'strat-b'
    });
    setRerouteAlertDismissed(false);
    setHasVibratedForReroute(false);
    await loadTripData();
  };

  // Demo Reset: Reset back to standard NH-48 route
  const handleResetDetour = async () => {
    await resetDriverReroute(truckId);
    setRerouteAlertDismissed(false);
    setHasVibratedForReroute(false);
    await loadTripData();
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (activeTab !== 'nav' || !mapContainerRef.current) return;

    const isDetourActive = activeReroute && activeReroute.status === 'ACCEPTED';
    const activeRouteLine: [number, number][] = (isDetourActive && activeReroute.detourPolyline)
      ? activeReroute.detourPolyline
      : (tripData?.roadPolyline && tripData.roadPolyline.length > 0)
        ? tripData.roadPolyline
        : standardCorridorCoords;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)?._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
      const map = L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lng],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      // Street Basemap (OpenStreetMap with optional CARTO key)
      const cartoKey = (import.meta as any).env?.VITE_CARTO_API_KEY;
      const tileUrl = cartoKey
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoKey}`
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: cartoKey ? 'abcd' : 'abc',
        attribution: cartoKey ? '&copy; OpenStreetMap, &copy; CARTO' : '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Draw active route polyline
      const poly = L.polyline(activeRouteLine, {
        color: isDetourActive ? '#10b981' : '#0284c7', // Emerald for detour, Sky blue for normal
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round'
      }).addTo(map);
      polylineRef.current = poly;

      // Add vehicle marker with custom pulsing beacon
      const truckIcon = L.divIcon({
        className: 'custom-driver-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full ${isDetourActive ? 'bg-emerald-400' : 'bg-sky-400'} opacity-75"></span>
            <div class="relative w-8 h-8 rounded-full bg-slate-900 border-2 ${isDetourActive ? 'border-emerald-400 text-emerald-400' : 'border-sky-400 text-sky-400'} flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([currentCoords.lat, currentCoords.lng], { icon: truckIcon }).addTo(map);
      markerRef.current = marker;

      // Add hazard flood marker at Narmada Bridge Bharuch (KM 204)
      const floodIcon = L.divIcon({
        className: 'custom-hazard-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-rose-500 opacity-75"></span>
            <div class="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-[10px] font-bold">
              ⚠️
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      hazardMarkerRef.current = L.marker([21.7051, 72.9959], { icon: floodIcon })
        .bindPopup('<b>NH-48 Bharuch Bridge</b><br>Submerged under flood water (+0.8m).')
        .addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng]);
      if (markerRef.current) {
        markerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
      }
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(activeRouteLine);
        polylineRef.current.setStyle({
          color: isDetourActive ? '#10b981' : '#0284c7'
        });
      }
    }
  }, [activeTab, currentCoords, activeReroute, tripData?.roadPolyline]);

  // Clean up map when component unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  // Real HTML5 Geolocation Watcher
  const togglePhoneGps = () => {
    if (isPhoneGpsActive) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsPhoneGpsActive(false);
      setGpsError('');
    } else {
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported by this browser/device.');
        return;
      }
      setGpsError('');
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const lat = Number(position.coords.latitude.toFixed(5));
          const lng = Number(position.coords.longitude.toFixed(5));
          const spd = position.coords.speed !== null ? Number((position.coords.speed * 3.6).toFixed(1)) : 52.0;
          const hdg = position.coords.heading !== null ? Math.round(position.coords.heading) : 24;
          const acc = Math.round(position.coords.accuracy || 5);

          setCurrentCoords({ lat, lng });
          setSpeedKmh(spd);
          setHeading(hdg);
          setAccuracyMeters(acc);
          setIsPhoneGpsActive(true);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([lat, lng]);
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            }
          }

          sendDriverTelemetry({
            driverId: driverName,
            truckId: truckId,
            lat,
            lng,
            speedKmh: spd,
            heading: hdg,
            dutyStatus,
            batteryPct,
            isPhoneGps: true
          });
        },
        (err) => {
          setGpsError(`GPS Access Error: ${err.message}. Please allow location permission in browser.`);
          setIsPhoneGpsActive(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 2000
        }
      );
      watchIdRef.current = id;
    }
  };

  // Highway Driving Simulation Mode
  const toggleSimulatedDrive = () => {
    if (isSimulatingDrive) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setIsSimulatingDrive(false);
    } else {
      setIsSimulatingDrive(true);
      simIntervalRef.current = setInterval(() => {
        setCurrentCoords(prev => {
          const isDetour = activeReroute && activeReroute.status === 'ACCEPTED';
          const activeLine = (isDetour && activeReroute.detourPolyline)
            ? activeReroute.detourPolyline
            : (tripData?.roadPolyline && tripData.roadPolyline.length > 0)
              ? tripData.roadPolyline
              : standardCorridorCoords;

          let newLat = prev.lat;
          let newLng = prev.lng;

          if (activeLine && activeLine.length > 0) {
            const stepSkip = activeLine.length > 300 ? 5 : 1;
            currentPathIdxRef.current = (currentPathIdxRef.current + stepSkip) % activeLine.length;
            const pt = activeLine[currentPathIdxRef.current];
            newLat = Number(pt[0].toFixed(5));
            newLng = Number(pt[1].toFixed(5));
          } else {
            newLat = Number((prev.lat + (isDetour ? 0.007 : 0.006)).toFixed(4));
            newLng = Number((prev.lng + (isDetour ? 0.004 : 0.003)).toFixed(4));
          }

          const simulatedSpeed = Math.floor(Math.random() * 12) + 56;
          setSpeedKmh(simulatedSpeed);
          setHeading(32);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([newLat, newLng]);
            if (markerRef.current) {
              markerRef.current.setLatLng([newLat, newLng]);
            }
          }

          sendDriverTelemetry({
            driverId: driverName,
            truckId: truckId,
            lat: newLat,
            lng: newLng,
            speedKmh: simulatedSpeed,
            heading: 32,
            dutyStatus: 'ON_DUTY_DRIVING',
            batteryPct,
            isPhoneGps: true
          });

          return { lat: newLat, lng: newLng };
        });
      }, 2500);
    }
  };

  // Change Duty Status
  const handleDutyChange = async (newStatus: string) => {
    setDutyStatus(newStatus);
    if (newStatus === 'MANDATORY_REST_BREAK') {
      setBreakTimerSeconds(45 * 60);
      setIsBreakTimerActive(true);
      setSpeedKmh(0);
    } else {
      setIsBreakTimerActive(false);
    }

    await sendDriverDuty({
      truckId,
      dutyStatus: newStatus,
      breakMinutes: newStatus === 'MANDATORY_REST_BREAK' ? 45 : 0
    });
  };

  // Submit Driver Chat Message to HQ
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');
    setIsSendingMessage(true);

    const optimisticMsg = {
      id: `local-${Date.now()}`,
      sender: driverName,
      role: 'driver',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await sendDriverChatMessage({
        truckId,
        sender: driverName,
        role: 'driver',
        text: textToSend
      });
    } catch (err) {
      console.warn('Failed to send message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Submit Pre-Trip Vehicle Inspection
  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInspectionSubmitting(true);
    try {
      await submitDriverInspection({
        truckId,
        driverName,
        odometer: Number(odometer),
        tyresOk: inspectionChecks.tyres,
        brakesOk: inspectionChecks.brakes,
        reeferOk: inspectionChecks.reefer,
        fluidsOk: inspectionChecks.fluids,
        lightsOk: inspectionChecks.lights,
        notes: inspectionNotes
      });
      setInspectionSubmitted(true);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInspectionSubmitting(false);
    }
  };

  // Trigger Roadside Emergency SOS
  const handleEmergencySOS = async () => {
    setIsSubmittingEmergency(true);
    try {
      const msg = emergencyNotes.trim() || `Driver reported ${selectedEmergencyType.replace(/_/g, ' ')} on NH48 corridor`;
      await sendDriverEmergency({
        truckId,
        emergencyType: selectedEmergencyType,
        message: msg,
        lat: currentCoords.lat,
        lng: currentCoords.lng
      });
      setDutyStatus('EMERGENCY_HALT');
      setSpeedKmh(0);
      setEmergencyAlertSent(true);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([500, 200, 500]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingEmergency(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  };

  const isDetourActive = activeReroute && activeReroute.status === 'ACCEPTED';
  const hasProposedReroute = activeReroute && activeReroute.status === 'PROPOSED' && !rerouteAlertDismissed;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none ${
      isEmbedded ? 'rounded-2xl overflow-hidden border border-slate-800' : ''
    }`}>
      
      {/* 1. TOP MOBILE STATUS BAR */}
      <div className="bg-slate-950/90 backdrop-blur-md px-4 pt-2.5 pb-2 flex items-center justify-between border-b border-slate-900 sticky top-0 z-40 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 tracking-tight text-[13px]">{currentTime}</span>
          {isPhoneGpsActive ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-800 animate-pulse">
              <Radio className="w-3 h-3" /> GPS ON (±{accuracyMeters}m)
            </span>
          ) : isSimulatingDrive ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded-full border border-amber-800">
              <Play className="w-2.5 h-2.5 fill-current" /> SIMULATING
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
              <WifiOff className="w-2.5 h-2.5" /> Standby
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[10px] font-mono">{speedKmh} km/h</span>
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-300">
            <BatteryCharging className={`w-3.5 h-3.5 ${isCharging ? 'text-emerald-400' : 'text-slate-300'}`} />
            <span>{batteryPct}%</span>
          </div>

          {/* Voice Guidance Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !isVoiceGuidanceEnabled;
              setIsVoiceGuidanceEnabled(next);
              if (next) {
                speakGuidance("Voice guidance active.", "Aawaaz sahayata shuru ki gayi hai.");
              }
            }}
            className={`p-1 rounded-md border transition-colors ${
              isVoiceGuidanceEnabled 
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400 hover:bg-emerald-900' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={isVoiceGuidanceEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
          >
            {isVoiceGuidanceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Hindi / English Language Pill */}
          <button
            type="button"
            onClick={() => {
              const nextLang = voiceLanguage === 'hi' ? 'en' : 'hi';
              setVoiceLanguage(nextLang);
              speakGuidance(
                "Switched to English voice assistance.",
                "Hindi aawaaz sahayata chuni gayi hai."
              );
            }}
            className="px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Switch between Hindi and English"
          >
            {voiceLanguage === 'hi' ? '🇮🇳 HI' : '🇬🇧 EN'}
          </button>

          {onSwitchToDesktop && (
            <button
              onClick={onSwitchToDesktop}
              title="Switch to HQ Desktop Console"
              className="ml-0.5 p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* OFFLINE CELLULAR DEAD-ZONE BANNER */}
      {isOffline && (
        <div className="bg-amber-950/95 border-b border-amber-800 px-3.5 py-2 flex items-center justify-between text-xs text-amber-200 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-[11px] leading-tight">Cellular Dead Zone Active</div>
              <div className="text-[10px] text-amber-300/80">Offline e-Way Pass & Corridor Route cached in PWA storage</div>
            </div>
          </div>
          <span className="text-[9px] bg-amber-900 text-amber-200 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-700">
            OFFLINE PWA
          </span>
        </div>
      )}

      {/* PWA INSTALL PROMPT CARD */}
      {deferredInstallPrompt && !isAppInstalled && (
        <div className="mx-3 mt-2 p-2.5 bg-slate-900 border border-emerald-800/80 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">Install Driver Companion App</div>
              <div className="text-[10px] text-slate-400">Save to home screen for offline dead-zone access</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallPwa}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Install PWA
          </button>
        </div>
      )}

      {/* 2. DRIVER & VEHICLE IDENTITY BAR */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <select
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
                className="bg-slate-800 text-white font-bold text-xs rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-slate-500"
              >
                <option value="MH-04-GP-8821">MH-04-GP-8821 (Tata Prima 3530)</option>
                <option value="MH-12-QZ-4109">MH-12-QZ-4109 (BharatBenz Reefer)</option>
                <option value="GJ-06-AX-2098">GJ-06-AX-2098 (Ashok Leyland 4220)</option>
                <option value="DL-01-AA-7821">DL-01-AA-7821 (Eicher Pro 6028)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[210px]">
              {driverName} • <span className="text-slate-300">{carrier.split(' ')[0]}</span>
            </p>
          </div>
        </div>

        {/* Duty Status Badge */}
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
          dutyStatus === 'ON_DUTY_DRIVING' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
          dutyStatus === 'MANDATORY_REST_BREAK' ? 'bg-amber-950 text-amber-300 border-amber-800' :
          dutyStatus === 'EMERGENCY_HALT' ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse' :
          'bg-slate-800 text-slate-300 border-slate-700'
        }`}>
          {dutyStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {/* 3. CLOSED-LOOP REROUTE NOTIFICATION POPUP (Triggered when HQ approves detour) */}
      {hasProposedReroute && (
        <div className="mx-3 mt-3 p-3.5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500 rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                HQ Real-Time Detour Advisory
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              {activeReroute.approvedBy || 'Approved by HQ'}
            </span>
          </div>

          <div className="mt-2 space-y-1">
            <h4 className="text-sm font-bold text-white leading-snug">
              {activeReroute.strategyName || 'Bypass Detour via SH-188'}
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {activeReroute.reason}: Narmada bridge flooded on NH-48. HQ optimizer has approved bypass via SH-188 & Ankleshwar Ring.
            </p>
            <div className="flex items-center gap-3 text-[10px] font-mono text-amber-300 pt-1">
              <span className="font-bold">+{activeReroute.addedKm || 48} km</span>
              <span>•</span>
              <span className="font-bold">+{activeReroute.etaDelayMinutes || 45} min ETA</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Toll Pass Synced</span>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleAcceptReroute}
              disabled={isAcceptingReroute}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isAcceptingReroute ? 'Activating Detour...' : 'ACCEPT DETOUR ROUTE'}</span>
            </button>
            <button
              type="button"
              onClick={() => setRerouteAlertDismissed(true)}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Reroute Active Confirmation Toast */}
      {rerouteSuccessToast && (
        <div className="mx-3 mt-2 px-3 py-2 bg-emerald-950 border border-emerald-700 rounded-xl text-xs text-emerald-200 font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{rerouteSuccessToast}</span>
        </div>
      )}

      {/* 4. MAIN TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* ================= TAB 1: NAVIGATION & GPS ================= */}
        {activeTab === 'nav' && (
          <div className="space-y-3">
            
            {/* Turn-by-Turn Instruction Banner */}
            <div className="bg-slate-900 border-b border-slate-800 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 ${
                  isDetourActive ? 'bg-emerald-600 text-white' : 'bg-sky-600 text-white'
                }`}>
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-[11px] font-semibold uppercase tracking-wide ${
                    isDetourActive ? 'text-emerald-400' : tripData?.isCustomRoute ? 'text-sky-400 font-bold' : 'text-sky-400'
                  }`}>
                    {isDetourActive 
                      ? 'Detour Route • SH-188 Bypass' 
                      : tripData?.isCustomRoute 
                      ? `Road Navigation • ${tripData.origin} ➔ ${tripData.destination}` 
                      : 'Next Maneuver • NH-48'}
                  </div>
                  <div className="text-xs font-bold text-white leading-tight mt-0.5">
                    {tripData?.nextManoeuvre || 'In 4.2 km, continue on NH48 toward Bharuch bypass'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (isDetourActive) {
                      speakGuidance(
                        "In 4.2 km, continue on State Highway 188 detour toward Ankleshwar ring bypass.",
                        "Aage 4.2 kilometer chalkar State Highway 188 detour se Ankleshwar bypass ki taraf chalein."
                      );
                    } else if (tripData?.nextManoeuvre) {
                      speakGuidance(
                        tripData.nextManoeuvre,
                        tripData.nextManoeuvreHi || tripData.nextManoeuvre
                      );
                    } else {
                      speakGuidance(
                        'In 4.2 km, continue on NH48 toward Bharuch bypass',
                        'Aage 4.2 kilometer tak NH-48 par Bharuch bypass ki taraf chalte rahein'
                      );
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
                  title="Read aloud maneuver instruction"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                </button>
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">{tripData?.remainingKm || 840} km</div>
                  <div className="text-[10px] text-slate-400">ETA: {tripData?.eta || '08:30 AM'}</div>
                </div>
              </div>
            </div>

            {/* Active Detour Pill & Reset Option */}
            {isDetourActive && (
              <div className="mx-3 px-3 py-2 bg-emerald-950/70 border border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Navigating Approved SH-188 Detour</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetDetour}
                  className="text-[10px] text-slate-400 hover:text-white underline font-mono flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset Route</span>
                </button>
              </div>
            )}

            {/* Live GPS Map Viewport */}
            <div className="px-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900 h-64">
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* Recenter & Map Controls Overlay */}
                <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], 12);
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-slate-900/90 text-slate-200 border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-colors shadow-md"
                    title="Recenter on Vehicle"
                  >
                    <Compass className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed & Heading HUD Overlay */}
                <div className="absolute bottom-2.5 left-2.5 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-lg">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Speed</span>
                    <span className="text-sm font-bold font-mono text-white">{speedKmh} <span className="text-[10px] text-slate-400 font-sans">km/h</span></span>
                  </div>
                  <div className="w-px h-6 bg-slate-700" />
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Heading</span>
                    <span className="text-xs font-bold font-mono text-slate-200">{heading}° NNE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GPS Controls & Closed-Loop Demonstration Tools */}
            <div className="px-3 space-y-2">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Radio className={`w-3.5 h-3.5 ${isPhoneGpsActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                      <span>Phone Hardware GPS Stream</span>
                    </div>
                    <div className="text-[10px] text-slate-400">Transmits real coordinates directly to HQ Control Center</div>
                  </div>
                  <button
                    type="button"
                    onClick={togglePhoneGps}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      isPhoneGpsActive 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isPhoneGpsActive ? 'GPS Active' : 'Enable GPS'}
                  </button>
                </div>

                {gpsError && (
                  <div className="text-[11px] text-rose-400 bg-rose-950/60 border border-rose-800/80 p-2 rounded-xl">
                    {gpsError}
                  </div>
                )}

                {/* Demo Reroute & Simulation Controls */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={toggleSimulatedDrive}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                      isSimulatingDrive 
                        ? 'bg-amber-950 text-amber-300 border-amber-800' 
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <Play className={`w-3 h-3 ${isSimulatingDrive ? 'fill-current' : ''}`} />
                    <span>{isSimulatingDrive ? 'Stop Highway Sim' : 'Simulate Drive'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateHqReroutePush}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/60 transition-colors flex items-center gap-1.5"
                    title="Simulate HQ approving a detour on the dashboard"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Trigger HQ Reroute</span>
                  </button>
                </div>
              </div>

              {/* Corridor Hazard Bulletin */}
              {tripData?.hazardAlert && (
                <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-amber-300">{tripData.hazardAlert.title}</div>
                    <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                      {tripData.hazardAlert.message}
                    </p>
                    <div className="mt-1.5 text-[10px] text-amber-400 font-mono">
                      Location: {tripData.hazardAlert.location}
                    </div>
                  </div>
                </div>
              )}

              {/* Active Route Stepper */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Assigned Corridor: {isDetourActive ? 'Banur-Tepla Detour' : routeCode}</span>
                  <span className="text-[10px] text-slate-400">Total: {tripData?.totalDistanceKm || 260} km</span>
                </div>
                <div className="space-y-1.5">
                  {(tripData?.waypoints || [
                    { name: 'Kharar Central DC', city: 'Kharar', status: 'completed' },
                    { name: 'Mohali / Chandigarh Hub', city: 'Mohali', status: 'completed' },
                    { name: 'Ambala Cantt Junction', city: 'Ambala', status: 'current' },
                    { name: 'Panipat Elevated Flyover', city: 'Panipat', status: 'upcoming' },
                    { name: 'Delhi NCR Kundli Hub', city: 'Delhi NCR', status: 'upcoming' }
                  ]).map((wp: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          wp.status === 'completed' ? 'bg-emerald-500' :
                          wp.status === 'current' ? 'bg-amber-500 ring-2 ring-amber-400/50 animate-pulse' :
                          'bg-slate-700'
                        }`} />
                        <span className={wp.status === 'current' ? 'font-bold text-white' : 'text-slate-300'}>{wp.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono capitalize ${
                        wp.status === 'completed' ? 'text-emerald-400' :
                        wp.status === 'current' ? 'text-amber-300 font-bold' :
                        'text-slate-500'
                      }`}>
                        {wp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: CONSIGNMENT & E-WAY BILL ================= */}
        {activeTab === 'eway' && (
          <div className="p-3 space-y-3">
            
            {/* e-Way Bill Digital Pass Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Government of India • GST e-Way Bill</div>
                    <div className="text-sm font-bold font-mono text-white">5310 9482 1092</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  VALID & ACTIVE
                </span>
              </div>

              {/* Scannable High-Contrast QR Code for Toll / RTO */}
              <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-inner">
                {ewayQrDataUrl ? (
                  <img 
                    src={ewayQrDataUrl} 
                    alt="Official GST e-Way Bill QR Code" 
                    className="w-48 h-48 rounded-lg object-contain cursor-pointer"
                    onClick={() => setIsQrFullscreen(true)}
                  />
                ) : (
                  <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsQrFullscreen(true)}
                  className="mt-2 text-[11px] font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full transition-colors"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Enlarge for Toll / RTO Scanner</span>
                </button>
              </div>

              {/* Consignment Specs */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Consignor (Origin)</span>
                    <strong className="text-slate-200 text-[11px] block mt-0.5">Tata Motors Ltd</strong>
                    <span className="text-[10px] font-mono text-slate-400">GSTIN: 27AAAAC1234F1Z5</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Consignee (Destination)</span>
                    <strong className="text-slate-200 text-[11px] block mt-0.5">Delhi NCR Hub</strong>
                    <span className="text-[10px] font-mono text-slate-400">GSTIN: 07AAACG5678K1Z2</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cargo:</span>
                    <span className="font-semibold text-white">420 Powertrain Assemblies (HSN: 8708)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Invoice Amount:</span>
                    <span className="font-mono font-bold text-emerald-400">₹48,50,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Gross Weight:</span>
                    <span className="font-mono text-slate-300">14.2 Metric Tonnes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Transporter / LR No:</span>
                    <span className="font-mono text-slate-300">Allcargo • AC-2026-9941</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Validity:</span>
                    <span className="font-mono text-slate-300">12-Sep-2026 to 15-Sep-2026</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Digitally signed & verified with National Informatics Centre (NIC)</span>
              </div>
            </div>

            {/* Fullscreen QR Modal for Checkpost Officers */}
            {isQrFullscreen && (
              <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-xs w-full text-center space-y-3">
                  <div className="text-slate-900 font-extrabold text-sm uppercase tracking-wider">
                    e-Way Bill QR Pass
                  </div>
                  <img src={ewayQrDataUrl} alt="e-Way Bill Fullscreen QR" className="w-64 h-64 mx-auto" />
                  <div className="font-mono font-bold text-sm text-slate-900">5310 9482 1092</div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Vehicle: {truckId} • Allcargo Logistics
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQrFullscreen(false)}
                    className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800"
                  >
                    Close Fullscreen
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 3: DUTY, BREAK & INSPECTION ================= */}
        {activeTab === 'duty' && (
          <div className="p-3 space-y-3">
            
            {/* Shift & Driving Timer */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Driver Shift Compliance</span>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">{formatTimer(dutySeconds)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Driving Hours (Today)</span>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                    {formatTimer(drivingSeconds)} <span className="text-[10px] text-slate-500 font-sans">/ 8h max</span>
                  </div>
                </div>
              </div>

              {/* Duty Status Quick Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDutyChange('ON_DUTY_DRIVING')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    dutyStatus === 'ON_DUTY_DRIVING'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Driving</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDutyChange('MANDATORY_REST_BREAK')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    dutyStatus === 'MANDATORY_REST_BREAK'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                  <span>Rest Break</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDutyChange('AT_DC_UNLOADING')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                    dutyStatus === 'AT_DC_UNLOADING'
                      ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>At DC Terminal</span>
                </button>
              </div>

              {/* Mandatory Rest Countdown Box */}
              {isBreakTimerActive && (
                <div className="bg-amber-950/60 border border-amber-800 rounded-2xl p-3 text-xs text-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold">Mandatory Rest Clock Active</div>
                      <div className="text-[10px] text-amber-200/70">Indian MV Act requires 45 mins after 4.5h driving</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-lg text-amber-200">{formatTimer(breakTimerSeconds)}</div>
                    <div className="text-[9px] uppercase font-bold text-amber-400">Remaining</div>
                  </div>
                </div>
              )}
            </div>

            {/* Pre-Trip Vehicle Safety Checklist */}
            <form onSubmit={handleInspectionSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-bold text-white">Daily Pre-Trip Vehicle Inspection</span>
                </div>
                {inspectionSubmitted && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                    Certified Today
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'tyres', label: 'Tyre Pressure & Tread' },
                  { key: 'brakes', label: 'Air Brakes & Pressure' },
                  { key: 'reefer', label: 'Reefer Temp (-18°C / 4°C)' },
                  { key: 'fluids', label: 'Engine Oil & DEF Level' },
                  { key: 'lights', label: 'Headlights & Blinkers' },
                  { key: 'safetyKit', label: 'Fire Extinguisher & Kit' }
                ].map(item => (
                  <label 
                    key={item.key} 
                    className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(inspectionChecks as any)[item.key]}
                      onChange={(e) => setInspectionChecks(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-4 h-4"
                    />
                    <span className="text-[11px] text-slate-300 leading-tight">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-[10px] text-slate-400 block mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-slate-600"
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-[10px] text-slate-400 block mb-1">Notes / Faults</label>
                  <input
                    type="text"
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    placeholder="e.g. All optimal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={inspectionSubmitting}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{inspectionSubmitted ? 'Update Vehicle Inspection Pass' : 'Certify & Submit Inspection'}</span>
              </button>
            </form>

          </div>
        )}

        {/* ================= TAB 4: DISPATCH CHAT & EMERGENCY SOS ================= */}
        {activeTab === 'dispatch' && (
          <div className="p-3 space-y-3">
            
            {/* Two-Way Dispatch Communication Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">Central HQ Dispatch Channel</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live 2-Way Link</span>
              </div>

              {/* Message List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {messages.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-xs">No active dispatch messages.</div>
                ) : (
                  messages.map(m => {
                    const isDriver = m.role === 'driver';
                    return (
                      <div 
                        key={m.id} 
                        className={`p-2.5 rounded-2xl text-xs max-w-[85%] ${
                          isDriver 
                            ? 'ml-auto bg-sky-950/80 border border-sky-800 text-sky-100 rounded-br-xs' 
                            : 'mr-auto bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] mb-1 font-semibold">
                          <span className={isDriver ? 'text-sky-300' : 'text-slate-400'}>{m.sender}</span>
                          <span className="text-[9px] text-slate-500">{m.time}</span>
                        </div>
                        <p className="leading-relaxed text-[11px]">{m.text}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Reply Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Acknowledged', 'Detour Taken', 'Delayed at Toll', 'At DC Loading'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setNewMessageText(chip);
                    }}
                    className="text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Message Input Bar with Voice-to-Text */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={isListeningDispatch ? "Listening... Speak now" : "Message HQ Dispatch..."}
                  className={`flex-1 bg-slate-950 border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    isListeningDispatch ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-slate-800 focus:border-slate-600'
                  }`}
                />

                <button
                  type="button"
                  onClick={isListeningDispatch ? stopSpeechToText : () => startSpeechToText('dispatch')}
                  className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                    isListeningDispatch 
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse ring-2 ring-rose-400/50 shadow-md' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title={isListeningDispatch ? "Stop Listening" : "Voice Dictate Message"}
                >
                  {isListeningDispatch ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="submit"
                  disabled={isSendingMessage || !newMessageText.trim()}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Roadside Emergency SOS Reporting Section */}
            <div className="bg-rose-950/30 border border-rose-900/60 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Roadside Emergency SOS
                </span>
                <span className="text-[10px] text-slate-500">Alerts Fleet Orchestration</span>
              </div>

              {/* Quick Hazard Category Selector */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { id: 'HIGHWAY_BLOCKAGE', label: 'Flood / Bridge Closed' },
                  { id: 'TOLL_STRIKE', label: 'Toll Strike / Blockade' },
                  { id: 'VEHICLE_BREAKDOWN', label: 'Engine / Tyre Failure' },
                  { id: 'ACCIDENT_POLICE', label: 'Accident / Police Delay' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedEmergencyType(opt.id)}
                    className={`p-2 rounded-xl text-left font-medium border transition-all ${
                      selectedEmergencyType === opt.id
                        ? 'bg-rose-950/90 border-rose-600 text-rose-200 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* SOS Notes with Voice Dictation */}
              <div className="relative">
                <input
                  type="text"
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder={isListeningEmergency ? "Listening... describe the road emergency" : "Optional hazard note: e.g. Bridge submerged at KM 204"}
                  className={`w-full bg-slate-950 border rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    isListeningEmergency ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-slate-800 focus:border-rose-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={isListeningEmergency ? stopSpeechToText : () => startSpeechToText('emergency')}
                  className={`absolute right-1.5 top-1.5 p-1 rounded-lg border transition-colors ${
                    isListeningEmergency 
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-xs' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title={isListeningEmergency ? "Stop Listening" : "Voice SOS Dictation"}
                >
                  {isListeningEmergency ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>

              {emergencyAlertSent && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>SOS Dispatched. HQ and AI rerouting agents alerted.</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleEmergencySOS}
                disabled={isSubmittingEmergency}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{isSubmittingEmergency ? 'Transmitting SOS...' : 'TRANSMIT EMERGENCY SOS TO FLEET'}</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 5. PERSISTENT MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-900 px-2 py-1.5 flex items-center justify-around text-xs shadow-2xl safe-bottom">
        
        <button
          type="button"
          onClick={() => setActiveTab('nav')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-xl transition-all ${
            activeTab === 'nav' 
              ? (isDetourActive ? 'text-emerald-400 font-bold' : 'text-sky-400 font-bold')
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span className="text-[10px]">Route Nav</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('eway')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-xl transition-all ${
            activeTab === 'eway' 
              ? 'text-emerald-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span className="text-[10px]">e-Way Bill</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('duty')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-xl transition-all ${
            activeTab === 'duty' 
              ? 'text-amber-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[10px]">Duty Clock</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dispatch')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-xl transition-all ${
            activeTab === 'dispatch' 
              ? 'text-rose-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[10px]">Dispatch / SOS</span>
        </button>

      </div>

    </div>
  );
};
