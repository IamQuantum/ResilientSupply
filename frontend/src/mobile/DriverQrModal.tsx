import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  Radio,
  Maximize2
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
  // Default to 'simulator' so user/presenter can immediately interact without phone pairing
  const [modalMode, setModalMode] = useState<'simulator' | 'qr'>('simulator');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [mobileUrl, setMobileUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [customIp, setCustomIp] = useState<string>('');
  const [selectedPort, setSelectedPort] = useState<string>('5173');
  const [loading, setLoading] = useState<boolean>(false);

  const generateQrForUrl = useCallback(async (targetUrl: string) => {
    try {
      const qr = await QRCode.toDataURL(targetUrl, {
        width: 280,
        margin: 2,
        color: { dark: '#020617', light: '#ffffff' }
      });
      setQrDataUrl(qr);
    } catch (e) {
      console.warn('QR code generation warning:', e);
    }
  }, []);

  const initHostInfo = useCallback(async () => {
    // 1. Instant synchronous fallback using window location
    const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const defaultPort = (typeof window !== 'undefined' && window.location.port) ? window.location.port : '5173';
    setSelectedPort(defaultPort);
    setCustomIp(defaultHost);
    
    const initialUrl = `http://${defaultHost}:${defaultPort}/driver`;
    setMobileUrl(initialUrl);
    await generateQrForUrl(initialUrl);

    // 2. Query backend to obtain local LAN IP if running on localhost
    try {
      const info = await fetchHostInfo();
      if (info && info.localIp && info.localIp !== '127.0.0.1') {
        const lanHost = info.localIp;
        setCustomIp(lanHost);
        const resolvedUrl = `http://${lanHost}:${defaultPort}/driver`;
        setMobileUrl(resolvedUrl);
        await generateQrForUrl(resolvedUrl);
      }
    } catch (e) {
      console.warn('Backend host-info unreachable, using browser host:', e);
    }
  }, [generateQrForUrl]);

  useEffect(() => {
    if (isOpen) {
      initHostInfo();
    }
  }, [isOpen, initHostInfo]);

  const handleUpdateIpAndPort = async (newIp: string, newPort: string) => {
    const trimmedIp = newIp.trim() || 'localhost';
    const trimmedPort = newPort.trim() || '5173';
    setCustomIp(trimmedIp);
    setSelectedPort(trimmedPort);
    const url = `http://${trimmedIp}:${trimmedPort}/driver`;
    setMobileUrl(url);
    await generateQrForUrl(url);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenDedicatedTab = () => {
    window.open('/driver', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-all ${
        modalMode === 'simulator' ? 'max-w-md w-full h-[92vh]' : 'max-w-2xl w-full max-h-[92vh]'
      }`}>
        
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                ResilientChain Driver Mobile Companion
              </h3>
              <p className="text-[11px] text-slate-400">
                PWA • Interactive On-Screen Phone & Physical Mobile Pairing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenDedicatedTab}
              title="Open full page in new tab (/driver)"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Full Page</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800 flex gap-4 text-xs font-bold bg-slate-900">
          <button
            type="button"
            onClick={() => setModalMode('simulator')}
            className={`pb-1.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              modalMode === 'simulator'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Interactive Phone Simulator</span>
          </button>

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
            <span>Launch on Real Smartphone (QR Code)</span>
          </button>
        </div>

        {/* TAB 1: INTERACTIVE ON-SCREEN SIMULATOR */}
        {modalMode === 'simulator' && (
          <div className="flex-1 overflow-hidden p-3 bg-slate-950 flex flex-col items-center justify-center">
            {/* Phone Chassis Frame */}
            <div className="w-full max-w-sm h-full bg-slate-950 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
              <DriverMobileApp isEmbedded={true} defaultTruckId="MH-04-GP-8821" />
            </div>
          </div>
        )}

        {/* TAB 2: QR CODE & REAL PHONE PAIRING */}
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
                  Point camera to launch standalone PWA
                </div>
              </div>

              {/* Instructions & Manual Link */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Instant Mobile App Launch</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Point any smartphone camera at this code to open the driver portal. Functions as an installable <strong>PWA</strong> with real GPS streaming, offline storage, turn-by-turn speech guidance, and digital GST e-Way bills.
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

                {/* Port Selector (Dev vs Unified Single-Port) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 block">Select Active Server Port:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateIpAndPort(customIp, '5173')}
                      className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        selectedPort === '5173'
                          ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Port 5173 (Vite Dev)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateIpAndPort(customIp, '8000')}
                      className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        selectedPort === '8000'
                          ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Port 8000 (Unified Server)
                    </button>
                  </div>
                </div>

                {/* IP Configuration (if phone is on another subnet) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 block">Host Network IP:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customIp}
                      onChange={(e) => handleUpdateIpAndPort(e.target.value, selectedPort)}
                      placeholder="e.g. 192.168.1.50"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-slate-600 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateIpAndPort(customIp, selectedPort)}
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
                    <span>Official GST e-Way Bill full-brightness QR for checkposts</span>
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

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-950 text-slate-500 text-[10px] text-center border-t border-slate-800 flex items-center justify-between">
          <span>ResilientChain Fleet Mobile Platform • Standalone PWA v2.5</span>
          <button
            type="button"
            onClick={handleOpenDedicatedTab}
            className="text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Launch Standalone View ➔
          </button>
        </div>

      </div>
    </div>
  );
};
