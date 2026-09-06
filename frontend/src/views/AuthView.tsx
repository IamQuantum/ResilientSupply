import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  MapPin, 
  Sparkles, 
  FileText 
} from 'lucide-react';
import { AuthResponse } from '../types';

interface AuthViewProps {
  onLoginSuccess: (auth: AuthResponse) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Company Registration Form State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Automotive & Precision Manufacturing');
  const [gstin, setGstin] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminTitle, setAdminTitle] = useState('VP Supply Chain');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail, password: signInPassword })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Sign in failed');
      }
      const data = await res.json();
      onLoginSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/register-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          industry,
          gstin,
          headquarters,
          adminName,
          adminEmail,
          password: adminPassword,
          adminTitle
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Registration failed');
      }
      const data = await res.json();
      onLoginSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not register company');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/demo');
      if (!res.ok) throw new Error('Demo server unavailable');
      const data = await res.json();
      onLoginSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load demo environment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        {/* Brand Monogram */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          ResilientChain AI
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Autonomous Supply Chain Disruption Sensing, OR-Tools Optimization & Governance
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl space-y-6">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('signin'); setErrorMsg(''); }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'signin'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'register'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Enroll New Company
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: Sign In */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: Enroll New Company */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterCompany} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Precision Logistics Ltd"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    placeholder="e.g. Retail / FMCG"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Indian GSTIN</label>
                  <input
                    type="text"
                    required
                    value={gstin}
                    onChange={e => setGstin(e.target.value)}
                    placeholder="27AAACA0000A1Z5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase focus:outline-none focus:bg-white focus:border-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Headquarters City / State</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={headquarters}
                    onChange={e => setHeadquarters(e.target.value)}
                    placeholder="e.g. Mumbai / Pune, Maharashtra"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Account Administrator (You)
                </span>
                
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={e => setAdminName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
                    <input
                      type="text"
                      required
                      value={adminTitle}
                      onChange={e => setAdminTitle(e.target.value)}
                      placeholder="e.g. VP Logistics"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Set Password</label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Workspace...' : 'Complete Enrollment & Launch'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Benchmark Demo 1-Click Access Card */}
          <div className="pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Reference Evaluation Environment
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">
                  BENCHMARK
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800">
                Tata Motors CV (Western Corridor Benchmark)
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Pre-configured with the NH-48 Surat disruption, OR-Tools multi-agent solver, IMD radar, and GST e-Way Bill.
              </p>
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={loading}
                className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Explore Benchmark Demo</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
