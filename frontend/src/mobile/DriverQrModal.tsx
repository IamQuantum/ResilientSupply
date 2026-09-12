import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  Play, 
  Wifi, 
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';
import { fetchHostInfo } from '../services/api';
import { DriverMobileApp } from './DriverMobileApp';

interface DriverQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedRouteCode?: string;
}

export const DriverQrModal: React.FC<DriverQrModalProps> = ({
  isOpen,
  onClose,
  assignedRouteCode = 'PUN-DEL-EXP'
}) => {
  const [modalMode, setModalMode] = useState<'qr' | 'simulator'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [mobileUrl, setMobileUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [customIp, setCustomIp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const initHostInfo = async () => {
    setLoading(true);
    try {
      const info = await fetchHostInfo();
      const host = info.localIp || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
      setCustomIp(host);
      const url = `http://${host}:5173/driver`;
      setMobileUrl(url);

      const qr = await QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        color: { dark: '#020617', light: '#ffffff' }
      });
      setQrDataUrl(qr);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initHostInfo();
    }
  }, [isOpen]);

  const handleUpdateIp = async (newIp: string) => {
    setCustomIp(newIp);
    const url = `http://${newIp.trim()}:5173/driver`;
    setMobileUrl(url);
    try {
      const qr = await QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        color: { dark: '#020617', light: '#ffffff' }
      });
      setQrDataUrl(qr);
    } catch (e) {}
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-all ${
        modalMode === 'simulator' ? 'max-w-md w-full h-[90vh]' : 'max-w-2xl w-full max-h-[90vh]'
      }`}>
        
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                ResilientChain Driver Mobile Companion
              </h3>
              <p className="text-[11px] text-slate-400">
                PWA • Connect real smartphone via WiFi or test on-screen simulator
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800 flex gap-4 text-xs font-bold bg-slate-900">
          <button
            type="button"
            onClick={() => setModalMode('qr')}
            className={`pb-1.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              modalMode === 'qr'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Launch on Physical Smartphone (QR Code)</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('simulator')}
            className={`pb-1.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              modalMode === 'simulator'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Phone Simulator</span>
          </button>
        </div>

        {/* TAB 1: QR CODE & REAL PHONE INSTRUCTIONS */}
        {modalMode === 'qr' && (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* QR Code Canvas Card */}
              <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-lg border border-slate-200 text-center">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Driver App QR Code" 
                    className="w-56 h-56 rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                    Generating Pairing QR...
                  </div>
                )}
                
                <div className="mt-3 text-slate-800 text-xs font-extrabold uppercase tracking-wide">
                  Scan with iPhone / Android Camera
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Connect phone to same WiFi / Hotspot
                </div>
              </div>

              {/* Instructions & Manual Link */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Instant Smartphone Launch</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Point any smartphone camera at this code to open the driver portal. It functions as a complete <strong>Progressive Web App (PWA)</strong> with real-time GPS streaming, offline mode, and digital e-Way Bill passes.
                  </p>
                </div>

                {/* Direct Link / Copy Box */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold block">Mobile Direct URL:</span>
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                    <input 
                      type="text" 
                      readOnly 
                      value={mobileUrl} 
                      className="bg-transparent text-slate-200 font-mono text-[11px] px-2 flex-1 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1"
                      title="Copy URL"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={mobileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* IP Configuration (if phone is on another subnet) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 block">Host Network IP (Auto-Detected):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customIp}
                      onChange={(e) => handleUpdateIp(e.target.value)}
                      placeholder="e.g. 192.168.1.50"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-slate-600 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateIp(customIp)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      Update QR
                    </button>
                  </div>
                </div>

                {/* Features Highlights */}
                <div className="space-y-1 text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-2 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Hardware HTML5 Geolocation streaming to Central Map</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Official GST e-Way Bill full-brightness QR for RTO checkposts</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Driver duty shifts, rest countdown & pre-trip vehicle checklist</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE ON-SCREEN SIMULATOR */}
        {modalMode === 'simulator' && (
          <div className="flex-1 overflow-hidden p-3 bg-slate-950 flex flex-col items-center justify-center">
            {/* iPhone Chassis Frame */}
            <div className="w-full max-w-sm h-full bg-slate-950 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
              <DriverMobileApp isEmbedded={true} defaultTruckId="MH-04-GP-8821" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-950 text-slate-500 text-[10px] text-center border-t border-slate-800">
          ResilientChain Fleet Mobile Platform • Standalone PWA v2.5
        </div>

      </div>
    </div>
  );
};
