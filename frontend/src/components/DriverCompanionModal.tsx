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
  Route, 
  Compass, 
  Wifi, 
  WifiOff, 
  ChevronRight, 
  ShieldCheck,
  Send,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { sendDriverTelemetry, sendDriverDuty, sendDriverEmergency } from '../services/api';

interface DriverCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedRouteCode?: string;
  onEmergencyDispatched?: () => void;
}

export const DriverCompanionModal: React.FC<DriverCompanionModalProps> = ({
  isOpen,
  onClose,
  assignedRouteCode = 'PUN-DEL-EXP',
  onEmergencyDispatched
}) => {
  // Driver & Vehicle Profile
  const [driverName, setDriverName] = useState<string>('Rameshwar Yadav');
  const [truckId, setTruckId] = useState<string>('MH-14-BT-9901');
  const [carrier, setCarrier] = useState<string>('Allcargo Logistics Express');

  // Real GPS & Device State
  const [isPhoneGpsActive, setIsPhoneGpsActive] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string>('');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 18.7606, // Pune Chakan
    lng: 73.8643
  });
  const [speedKmh, setSpeedKmh] = useState<number>(54.2);
  const [accuracyMeters, setAccuracyMeters] = useState<number>(4);
  const [batteryPct, setBatteryPct] = useState<number>(88);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Duty Status & Breaks
  // ON_DUTY_DRIVING | MANDATORY_REST_BREAK | AT_DC_UNLOADING | OFF_DUTY | EMERGENCY_HALT
  const [dutyStatus, setDutyStatus] = useState<string>('ON_DUTY_DRIVING');
  const [dutySeconds, setDutySeconds] = useState<number>(1420); // ~23 mins
  const [breakTimerSeconds, setBreakTimerSeconds] = useState<number>(0);
  const [isBreakTimerActive, setIsBreakTimerActive] = useState<boolean>(false);

  // Emergency SOS State
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string>('HIGHWAY_BLOCKAGE');
  const [emergencyNotes, setEmergencyNotes] = useState<string>('');
  const [isSubmittingEmergency, setIsSubmittingEmergency] = useState<boolean>(false);
  const [emergencyAlertSent, setEmergencyAlertSent] = useState<boolean>(false);

  // Simulated Road Trip Driving Mode (for desktop browser testing)
  const [isSimulatingDrive, setIsSimulatingDrive] = useState<boolean>(false);
  const simIntervalRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // Duty status timer tick
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setDutySeconds(prev => prev + 1);
      if (isBreakTimerActive && breakTimerSeconds > 0) {
        setBreakTimerSeconds(prev => Math.max(0, prev - 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isBreakTimerActive, breakTimerSeconds]);

  // Battery detection if browser supports Battery API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryPct(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryPct(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }
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
          const spd = position.coords.speed !== null ? Number((position.coords.speed * 3.6).toFixed(1)) : 48.0;
          const acc = Math.round(position.coords.accuracy || 5);

          setCurrentCoords({ lat, lng });
          setSpeedKmh(spd);
          setAccuracyMeters(acc);
          setIsPhoneGpsActive(true);

          // Transmit to backend
          sendDriverTelemetry({
            driverId: driverName,
            truckId: truckId,
            lat,
            lng,
            speedKmh: spd,
            dutyStatus,
            batteryPct,
            isPhoneGps: true
          });
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        },
        (err) => {
          setGpsError(`GPS Permission/Signal Error: ${err.message}`);
          setIsPhoneGpsActive(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 3000
        }
      );
      watchIdRef.current = id;
    }
  };

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // Simulation Mode (Advances GPS along Pune -> Mumbai -> Delhi Highway)
  const toggleSimulatedDrive = () => {
    if (isSimulatingDrive) {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      setIsSimulatingDrive(false);
    } else {
      setIsSimulatingDrive(true);
      simIntervalRef.current = setInterval(() => {
        setCurrentCoords(prev => {
          // Increment North-West slightly towards Delhi (approx +0.008 lat, +0.004 lng per tick)
          const newLat = Number((prev.lat + 0.008).toFixed(4));
          const newLng = Number((prev.lng + 0.004).toFixed(4));
          const simulatedSpeed = Math.floor(Math.random() * 15) + 55; // 55-70 km/h
          setSpeedKmh(simulatedSpeed);

          sendDriverTelemetry({
            driverId: driverName,
            truckId: truckId,
            lat: newLat,
            lng: newLng,
            speedKmh: simulatedSpeed,
            dutyStatus: 'ON_DUTY_DRIVING',
            batteryPct,
            isPhoneGps: true
          });
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          return { lat: newLat, lng: newLng };
        });
      }, 3000);
    }
  };

  // Change Duty Status
  const handleDutyChange = async (newStatus: string) => {
    setDutyStatus(newStatus);
    if (newStatus === 'MANDATORY_REST_BREAK') {
      setBreakTimerSeconds(45 * 60); // 45 min mandatory safety break
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

  // Trigger Emergency SOS
  const handleEmergencySOS = async () => {
    setIsSubmittingEmergency(true);
    try {
      const msg = emergencyNotes.trim() || `Driver flagged ${selectedEmergencyType.replace(/_/g, ' ')} at location`;
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
      if (onEmergencyDispatched) onEmergencyDispatched();
    } catch (err: any) {
      alert(`Emergency dispatch failed: ${err.message || err}`);
    } finally {
      setIsSubmittingEmergency(false);
    }
  };

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Mobile Shell Card */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-auto border-t-2 border-t-slate-700">
        
        {/* Phone Top Speaker & Sensor Bar */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between text-slate-400 text-xs border-b border-slate-800/80">
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="w-16 h-1 bg-slate-800 rounded-full" />
          <div className="flex items-center gap-2">
            {isPhoneGpsActive ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <Wifi className="w-3 h-3" /> GPS ON
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <WifiOff className="w-3 h-3" /> Standby
              </span>
            )}
            <span className="flex items-center gap-0.5 text-[11px] font-mono">
              <BatteryCharging className="w-3.5 h-3.5 text-slate-300" />
              {batteryPct}%
            </span>
            <button 
              onClick={onClose} 
              className="ml-2 text-slate-400 hover:text-white p-1"
              title="Close Driver Console"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Driver App Header */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">{truckId}</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {carrier.split(' ')[0]}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Driver: <strong className="text-slate-200">{driverName}</strong></p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            dutyStatus === 'ON_DUTY_DRIVING' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
            dutyStatus === 'MANDATORY_REST_BREAK' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
            dutyStatus === 'EMERGENCY_HALT' ? 'bg-red-950 text-red-300 border border-red-800' :
            'bg-slate-800 text-slate-300 border border-slate-700'
          }`}>
            {dutyStatus.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Phone GPS Streaming Toggle Card */}
        <div className="p-4 space-y-3">
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${isPhoneGpsActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold text-white">Stream Phone GPS to Fleet</div>
                  <div className="text-[10px] text-slate-400">Uses device hardware Geolocation API</div>
                </div>
              </div>
              <button
                onClick={togglePhoneGps}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                  isPhoneGpsActive
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
              >
                {isPhoneGpsActive ? 'Active (Tap to Stop)' : 'Activate GPS'}
              </button>
            </div>

            {gpsError && (
              <div className="text-[10px] text-red-400 bg-red-950/60 border border-red-800/80 p-2 rounded-lg">
                {gpsError}
              </div>
            )}

            {/* Live GPS Telemetry Readout */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400">Velocity</span>
                <div className="font-mono font-bold text-white text-sm mt-0.5">{speedKmh} km/h</div>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400">GPS Accuracy</span>
                <div className="font-mono font-bold text-slate-200 text-sm mt-0.5">±{accuracyMeters}m</div>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400">Last Sync</span>
                <div className="font-mono font-bold text-slate-200 text-sm mt-0.5">{lastSyncTime}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>Lat: <strong className="text-white">{currentCoords.lat}° N</strong>, Lng: <strong className="text-white">{currentCoords.lng}° E</strong></span>
              <button
                type="button"
                onClick={toggleSimulatedDrive}
                className={`underline hover:text-white ${isSimulatingDrive ? 'text-amber-400' : 'text-slate-400'}`}
              >
                {isSimulatingDrive ? 'Stop Highway Sim' : 'Test Simulator Drive'}
              </button>
            </div>
          </div>

          {/* Assigned Corridor Bulletin */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
            <Route className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-semibold text-slate-200">Active Corridor: {assignedRouteCode}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pune Chakan DC → Bhiwandi DC → Delhi NCR Hub (1,450 km)
              </p>
            </div>
          </div>

          {/* Duty Status Clock-In Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Driver Duty & Rest Clock</span>
              <span className="font-mono text-[11px]">Shift: {formatTimer(dutySeconds)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDutyChange('ON_DUTY_DRIVING')}
                className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                  dutyStatus === 'ON_DUTY_DRIVING'
                    ? 'bg-slate-100 text-slate-900 border-white shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Driving</span>
              </button>

              <button
                onClick={() => handleDutyChange('MANDATORY_REST_BREAK')}
                className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                  dutyStatus === 'MANDATORY_REST_BREAK'
                    ? 'bg-slate-100 text-slate-900 border-white shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Rest Break</span>
              </button>

              <button
                onClick={() => handleDutyChange('AT_DC_UNLOADING')}
                className={`py-2 px-1 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                  dutyStatus === 'AT_DC_UNLOADING'
                    ? 'bg-slate-100 text-slate-900 border-white shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>At DC Terminal</span>
              </button>
            </div>

            {isBreakTimerActive && (
              <div className="bg-amber-950/60 border border-amber-800/80 rounded-xl p-2.5 text-xs text-amber-300 flex items-center justify-between mt-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  Mandatory Rest Countdown
                </span>
                <span className="font-mono font-bold text-amber-200">{formatTimer(breakTimerSeconds)}</span>
              </div>
            )}
          </div>

          {/* Roadside Emergency SOS Reporting Section */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                One-Touch Emergency SOS
              </span>
              <span className="text-[10px] text-slate-500">Alerts Fleet Dispatch Instantly</span>
            </div>

            {/* Quick Emergency Category Selector */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {[
                { id: 'HIGHWAY_BLOCKAGE', label: 'Waterlogging / Bridge Closed' },
                { id: 'TOLL_STRIKE', label: 'Toll Plaza Strike / Blockade' },
                { id: 'VEHICLE_BREAKDOWN', label: 'Engine Failure / Flat Tyre' },
                { id: 'ACCIDENT_POLICE', label: 'Accident / Police Delay' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedEmergencyType(opt.id)}
                  className={`p-2 rounded-lg text-left font-medium border transition-all ${
                    selectedEmergencyType === opt.id
                      ? 'bg-red-950/80 border-red-600 text-red-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={emergencyNotes}
              onChange={(e) => setEmergencyNotes(e.target.value)}
              placeholder="Optional notes: e.g. Bridge flooded at KM 204"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />

            {emergencyAlertSent && (
              <div className="p-2.5 bg-emerald-950/70 border border-emerald-800 rounded-lg text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>SOS Alert Dispatched. Management & agents notified of outage.</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleEmergencySOS}
              disabled={isSubmittingEmergency}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {isSubmittingEmergency ? (
                <span>Transmitting Coordinates...</span>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>TRANSMIT EMERGENCY SOS TO FLEET</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 text-center border-t border-slate-800/80 text-[10px] text-slate-500">
          ResilientChain Telematics • Driver Hardware Interface v2.4
        </div>
      </div>
    </div>
  );
};
