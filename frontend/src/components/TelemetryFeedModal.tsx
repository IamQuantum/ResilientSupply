import React, { useState, useEffect } from 'react';
import { Radio, Truck, CloudRain, Anchor, AlertTriangle, ShieldCheck, X, RefreshCw, Zap, Thermometer } from 'lucide-react';
import { API_BASE } from '../services/api';

interface TelemetryFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnomalyDetected?: (anomaly: any) => void;
}

export const TelemetryFeedModal: React.FC<TelemetryFeedModalProps> = ({
  isOpen,
  onClose,
  onAnomalyDetected
}) => {
  const [fleet, setFleet] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const [fRes, sRes, aRes] = await Promise.all([
        fetch(`${API_BASE}/telemetry/fleet`),
        fetch(`${API_BASE}/telemetry/environmental`),
        fetch(`${API_BASE}/telemetry/anomalies`)
      ]);
      const [fData, sData, aData] = await Promise.all([fRes.json(), sRes.json(), aRes.json()]);
      setFleet(fData);
      setSensors(sData);
      setAnomalies(aData);
    } catch (err) {
      console.warn('Telemetry fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
    }
  }, [isOpen]);

  const handleSimulate = async (eventType: string, label: string) => {
    try {
      await fetch(`${API_BASE}/telemetry/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType })
      });
      setStatusMessage(`Event Triggered: ${label}`);
      await fetchTelemetry();
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <Radio className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Live IoT Fleet Telematics & Sensory Radar
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              </h3>
              <p className="text-xs text-slate-500">
                Phase 1 Sensing Engine: Streaming commercial vehicle GPS, IMD precipitation radar & port dwell
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTelemetry}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Simulation Controls */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-bold text-slate-700">Simulate Sensory Spike:</span>
            {statusMessage && (
              <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                {statusMessage}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSimulate('FLASH_FLOOD', 'Flash Flood Downpour at Surat')}
              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded-lg text-xs transition-colors"
            >
              🌊 Flood Spike (72 mm/h)
            </button>
            <button
              onClick={() => handleSimulate('REEFER_EXCURSION', 'Reefer Temp Alert')}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold rounded-lg text-xs transition-colors"
            >
              🌡️ Reefer Temp Excursion (12.8°C)
            </button>
            <button
              onClick={() => handleSimulate('RECOVER_NH48', 'NH-48 Traffic Restored')}
              className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold rounded-lg text-xs transition-colors"
            >
              ✅ Clear Corridor Traffic
            </button>
          </div>
        </div>

        {/* Active Automated Anomaly Detections (Sensing Agent) */}
        {anomalies.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-red-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                Automated Sensing Agent Anomalies Auto-Flagged ({anomalies.length}):
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {anomalies.map((a, idx) => (
                <div key={idx} className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-red-900">
                    <span>{a.type}</span>
                    <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[10px] font-mono">{a.severity}</span>
                  </div>
                  <div className="text-slate-700 font-medium">
                    {a.location || a.route}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {a.reading || a.speed} • {a.actionRequired}
                  </div>
                  {onAnomalyDetected && (
                    <button
                      onClick={() => onAnomalyDetected(a)}
                      className="mt-2 w-full py-1 px-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-[11px] transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Engage Sensing Agent</span>
                      <Zap className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commercial Fleet Telematics Table */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Commercial Fleet IoT In-Transit Radar:</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Vehicle / Carrier</th>
                  <th className="py-2.5 px-3">Consignment</th>
                  <th className="py-2.5 px-3">Corridor Location</th>
                  <th className="py-2.5 px-3">Speed</th>
                  <th className="py-2.5 px-3">Reefer Temp</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fleet.map((truck) => {
                  const isStalled = truck.telematicsStatus === 'ANOMALY_STALLED';
                  const isBreach = truck.telematicsStatus === 'COLD_CHAIN_BREACH';
                  return (
                    <tr key={truck.truckId} className={`hover:bg-slate-50/80 ${isStalled || isBreach ? 'bg-red-50/40' : ''}`}>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 font-mono">{truck.truckId}</div>
                        <div className="text-[10px] text-slate-400">{truck.carrier}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {truck.consignment}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div className="font-semibold text-slate-800">{truck.route}</div>
                        <div className="text-[10px] text-slate-400">{truck.location}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={truck.speedKmh < 10 ? 'text-red-600' : 'text-slate-800'}>
                          {truck.speedKmh} km/h
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs">
                        {truck.reeferTempC !== null ? (
                          <span className={`inline-flex items-center gap-1 ${
                            truck.reeferTempC > 8.0 ? 'text-red-600 font-bold' : 'text-emerald-700'
                          }`}>
                            <Thermometer className="w-3 h-3" />
                            {truck.reeferTempC}°C
                          </span>
                        ) : (
                          <span className="text-slate-300">N/A (Dry)</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {isStalled ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                            STALLED
                          </span>
                        ) : isBreach ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
                            TEMP BREACH
                          </span>
                        ) : truck.telematicsStatus === 'PORT_DELAY' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            PORT QUEUE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            CRUISING
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Environmental & Port Infrastructure Sensors */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <CloudRain className="w-3.5 h-3.5 text-blue-600" />
            <span>Environmental Radar & Port Infrastructure Sensors:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {sensors.map((sensor) => (
              <div key={sensor.sensorId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{sensor.sensorId}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    sensor.status.includes('CRITICAL') || sensor.status.includes('SEVERE')
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {sensor.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="font-bold text-slate-900">{sensor.metricName}</div>
                <div className="text-lg font-extrabold font-mono text-blue-700">{sensor.currentValue}</div>
                <div className="text-[11px] text-slate-500 leading-tight">{sensor.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
