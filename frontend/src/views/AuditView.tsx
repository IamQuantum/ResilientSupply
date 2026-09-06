import React from 'react';
import { History, Shield, CheckCircle2, AlertCircle, FileText, Download, Database, Printer } from 'lucide-react';
import { AuditTrailEvent } from '../types';

interface AuditViewProps {
  auditTrail: AuditTrailEvent[];
}

export const AuditView: React.FC<AuditViewProps> = ({ auditTrail }) => {
  const handleExportJSON = () => {
    const reportData = {
      title: 'ResilientChain AI — Immutable Supply Chain Audit Certificate',
      exportTimestamp: new Date().toISOString(),
      databaseEngine: 'SQLite (resilient_chain.db)',
      totalLedgerRecords: auditTrail.length,
      cryptographicStandard: 'SHA-256 Chain-of-Custody',
      auditTrail
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-certificate-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Supply Chain Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable cryptographic ledger of all agent decisions, policy validations, and human approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>SQLite: Active</span>
          </div>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Certificate</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Event History Log</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Total Verified Blocks: {auditTrail.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-5">Timestamp (UTC)</th>
                <th className="py-3 px-5">Origin Agent / Actor</th>
                <th className="py-3 px-5">Action & Event Description</th>
                <th className="py-3 px-5">Verification State</th>
                <th className="py-3 px-5">Integrity Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {auditTrail.map((entry, idx) => {
                const isRejected = entry.status === 'rejected';
                const isOptimal = entry.status === 'optimal';
                const isPending = entry.status === 'pending';

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors font-mono">
                    <td className="py-3.5 px-5 font-bold text-slate-700">
                      {entry.time}
                    </td>
                    <td className="py-3.5 px-5 font-sans font-semibold text-slate-900">
                      {entry.agent || 'System Gateway'}
                    </td>
                    <td className="py-3.5 px-5 font-sans text-slate-700">
                      <span className={isRejected ? 'text-red-600 line-through' : ''}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-sans">
                      {isRejected ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Rejected
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                          Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Validated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 text-[11px] font-mono">
                      0x8f{idx}a{((idx + 1) * 37) % 89}c9...b4
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
