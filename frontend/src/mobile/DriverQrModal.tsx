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
  Globe,
  Cloud,
  Terminal
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
  // Modes: 'simulator' | 'qr' | 'remote'
  const [modalMode, setModalMode] = useState<'simulator' | 'qr' | 'remote'>('simulator');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [mobileUrl, setMobileUrl] = useState<string>('');
  const [remotePublicUrl, setRemotePublicUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);
  const [customIp, setCustomIp] = useState<string>('');
  const [selectedPort, setSelectedPort] = useState<string>('5173');

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
    const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const defaultPort = (typeof window !== 'undefined' && window.location.port) ? window.location.port : '5173';
    setSelectedPort(defaultPort);
    setCustomIp(defaultHost);
    
    const initialUrl = `http://${defaultHost}:${defaultPort}/driver`;
    setMobileUrl(initialUrl);
    await generateQrForUrl(initialUrl);

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

  const handleApplyPublicUrl = async (publicUrlInput: string) => {
    let clean = publicUrlInput.trim();
    if (clean && !clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    if (clean && !clean.includes('/driver')) {
      clean = clean.replace(/\/+$/, '') + '/driver';
    }
    setRemotePublicUrl(publicUrlInput);
    if (clean) {
      setMobileUrl(clean);
      await generateQrForUrl(clean);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyTunnelCmd = (cmd: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  };

  const handleOpenDedicatedTab = () => {
    window.open(mobileUrl || '/driver', '_blank');
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
                PWA • Simulator • Local Wi-Fi • Remote 5G / Cloud Access
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenDedicatedTab}
              title="Open standalone page (/driver)"
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
        <div className="px-5 pt-3 pb-2 border-b border-slate-800 flex gap-4 text-xs font-bold bg-slate-900 overflow-x-auto">
          <button
            type="button"
            onClick={() => setModalMode('simulator')}
            className={`pb-1.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              modalMode === 'simulator'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Interactive Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setModalMode('qr');
              handleUpdateIpAndPort(customIp, selectedPort);
            }}
            className={`pb-1.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              modalMode === 'qr'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Local Wi-Fi Pairing</span>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('remote')}
            className={`pb-1.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              modalMode === 'remote'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Remote 5G / Public Cloud (Any Network)</span>
          </button>
        </div>

        {/* TAB 1: INTERACTIVE ON-SCREEN SIMULATOR */}
        {modalMode === 'simulator' && (
          <div className="flex-1 overflow-hidden p-3 bg-slate-950 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm h-full bg-slate-950 rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
              <DriverMobileApp isEmbedded={true} defaultTruckId="MH-04-GP-8821" />
            </div>
          </div>
        )}

        {/* TAB 2: LOCAL WI-FI PAIRING */}
        {modalMode === 'qr' && (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
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
                  Smartphone must be on same Wi-Fi
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Local Network Pairing</h4>
                  <p className="text-slate-400 leading-relaxed">
                    Connect your phone to the same Wi-Fi hotspot or local subnet to test real HTML5 Geolocation and e-Way bills directly from this computer.
                  </p>
                </div>

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
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: REMOTE 5G / PUBLIC CLOUD (ANY NETWORK) */}
        {modalMode === 'remote' && (
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              <div className="bg-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-lg border border-slate-200 text-center">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Public Driver QR Code" 
                    className="w-56 h-56 rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                    Paste URL to Generate QR...
                  </div>
                )}
                
                <div className="mt-3 text-slate-800 text-xs font-extrabold uppercase tracking-wide">
                  Scan Anywhere via 4G / 5G / LTE
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  No shared Wi-Fi needed • Secure HTTPS
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Public Cloud / Tunnel Access
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Use this when your smartphone is on cellular data or another Wi-Fi network. Paste your <strong>public tunnel</strong> or <strong>deployed cloud domain</strong> below to immediately generate a worldwide pairing QR.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold block">Enter Public / Tunnel URL:</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={remotePublicUrl}
                      onChange={(e) => handleApplyPublicUrl(e.target.value)}
                      placeholder="e.g. https://your-app.trycloudflare.com or https://resilientsupply.onrender.com"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 flex-1"
                    />
                  </div>
                </div>

                {/* Instant Tunnel Quick Guide Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-2">
                  <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    <span>Instant 30s Free Tunnel Command:</span>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-2 font-mono text-[11px] text-emerald-300 flex items-center justify-between border border-slate-800">
                    <span>npx localtunnel --port 8000</span>
                    <button
                      type="button"
                      onClick={() => handleCopyTunnelCmd('npx localtunnel --port 8000')}
                      className="text-slate-400 hover:text-white p-1"
                      title="Copy command"
                    >
                      {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Run this in terminal to generate a public HTTPS tunnel. Paste the resulting URL above!
                  </p>
                </div>

                <div className="space-y-1 text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>HTTPS enables native phone GPS & speech recognition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Permanent cloud deployment: Render, Railway, or Docker</span>
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
