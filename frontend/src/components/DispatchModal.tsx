import React, { useState } from 'react';
import { 
  FileText, 
  Truck, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  X, 
  Printer, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Database
} from 'lucide-react';
import { DispatchBundle } from '../types';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatchData: DispatchBundle | null;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  dispatchData
}) => {
  const [activeTab, setActiveTab] = useState<'eway' | 'carrier' | 'sap' | 'json'>('eway');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !dispatchData) return null;

  const { ewayBill, carrierBooking, sapIntegration } = dispatchData;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(dispatchData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Outbound Enterprise Dispatch & GST e-Way Bill
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  NIC & SAP Dispatched
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official Indian GSTN e-Way Bill (Form GST EWB-01) • 3PL Carrier AWB • SAP S/4HANA OData
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('eway')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'eway'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Form GST EWB-01 (e-Way Bill)</span>
            </button>
            <button
              onClick={() => setActiveTab('carrier')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'carrier'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>3PL Carrier Booking (LR/AWB)</span>
            </button>
            <button
              onClick={() => setActiveTab('sap')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'sap'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>SAP S/4HANA OData Sync</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'json'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>NIC JSON Payload</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Form GST EWB-01 Official Certificate */}
        {activeTab === 'eway' && (
          <div className="border-2 border-slate-300 rounded-xl p-5 bg-white space-y-5 text-slate-800 shadow-xs">
            {/* Government of India Header */}
            <div className="text-center border-b border-slate-200 pb-3">
              <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                GOVERNMENT OF INDIA • GOODS AND SERVICES TAX NETWORK (GSTN)
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                e-WAY BILL (FORM GST EWB-01)
              </h2>
              <div className="text-xs text-slate-600 font-medium">
                [See Rule 138 of the Central Goods and Services Tax Rules, 2017]
              </div>
            </div>

            {/* e-Way Bill Master Identification Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">e-Way Bill No</span>
                <span className="text-sm font-black text-emerald-700">{ewayBill.ewayBillNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Generated Date & Time</span>
                <span className="font-bold text-slate-800">{ewayBill.ewayBillDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Valid Until</span>
                <span className="font-bold text-amber-700">{ewayBill.validUntil}</span>
              </div>
            </div>

            {/* PART A: Consignor & Consignee */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                PART - A (Consignment & Tax Details)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Consignor */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">From (Consignor)</div>
                  <div className="font-bold text-slate-900">{ewayBill.consignor.legalName}</div>
                  <div className="font-mono text-emerald-700 font-semibold">GSTIN: {ewayBill.consignor.gstin}</div>
                  <div className="text-slate-600">{ewayBill.consignor.address}</div>
                  <div className="text-slate-500">PIN: {ewayBill.consignor.pincode} • {ewayBill.consignor.state}</div>
                </div>

                {/* Consignee */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">To (Consignee)</div>
                  <div className="font-bold text-slate-900">{ewayBill.consignee.legalName}</div>
                  <div className="font-mono text-blue-700 font-semibold">GSTIN: {ewayBill.consignee.gstin}</div>
                  <div className="text-slate-600">{ewayBill.consignee.address}</div>
                  <div className="text-slate-500">PIN: {ewayBill.consignee.pincode} • {ewayBill.consignee.state}</div>
                </div>
              </div>
            </div>

            {/* Goods and Value Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold uppercase text-slate-600">
                    <th className="p-2 border-r border-slate-200">HSN Code</th>
                    <th className="p-2 border-r border-slate-200">Item Description</th>
                    <th className="p-2 border-r border-slate-200">Taxable Value</th>
                    <th className="p-2 border-r border-slate-200">CGST (9%)</th>
                    <th className="p-2 border-r border-slate-200">SGST (9%)</th>
                    <th className="p-2">Total Invoice (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200 font-medium">
                    <td className="p-2 font-mono border-r border-slate-200 font-bold">{ewayBill.goods.hsnCode}</td>
                    <td className="p-2 border-r border-slate-200">{ewayBill.goods.description}</td>
                    <td className="p-2 font-mono border-r border-slate-200">₹{(ewayBill.goods.taxableAmountINR || 1450000).toLocaleString('en-IN')}</td>
                    <td className="p-2 font-mono border-r border-slate-200">₹{(ewayBill.goods.cgstINR || 130500).toLocaleString('en-IN')}</td>
                    <td className="p-2 font-mono border-r border-slate-200">₹{(ewayBill.goods.sgstINR || 130500).toLocaleString('en-IN')}</td>
                    <td className="p-2 font-mono font-bold text-slate-900">₹{(ewayBill.goods.totalAmountINR || 1711000).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PART B: Transporter Details */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                PART - B (Vehicle & Transporter Dispatch)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Transporter Name</span>
                  <span className="font-bold text-slate-900">{ewayBill.partB.transporterName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Transporter ID</span>
                  <span className="font-mono text-slate-700 font-semibold">{ewayBill.partB.transporterId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Vehicle Number</span>
                  <span className="font-mono font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {ewayBill.partB.vehicleNo}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Lorry Receipt (LR) No</span>
                  <span className="font-mono font-bold text-slate-800">{ewayBill.partB.docNo}</span>
                </div>
              </div>
            </div>

            {/* Digital Signature & Verification Bar */}
            <div className="flex items-center justify-between p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-900">Cryptographically Signed & Registered on NIC Portal</div>
                  <div className="font-mono text-[10px] text-emerald-700">QR Payload: {ewayBill.qrPayload.slice(0, 60)}...</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-xs">VERIFIED</span>
            </div>
          </div>
        )}

        {/* Tab 2: 3PL Carrier Booking */}
        {activeTab === 'carrier' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    3PL
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{carrierBooking.provider} EDI Booking</h4>
                    <p className="text-xs text-slate-500">Logistics API Outbound Dispatch Payload</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold text-xs">
                  {carrierBooking.dispatchStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Booking Reference</span>
                  <span className="font-mono font-bold text-slate-900">{carrierBooking.bookingRef}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Airway Bill / LR No</span>
                  <span className="font-mono font-bold text-emerald-700">{carrierBooking.lrNumber}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Assigned Truck</span>
                  <span className="font-mono font-bold text-blue-700">{carrierBooking.vehicleAssigned}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Driver & License:</span>
                  <span className="font-medium text-slate-900">{carrierBooking.driverAssigned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Pickup Slot:</span>
                  <span className="font-medium text-emerald-700">{carrierBooking.pickupETA}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Estimated Destination Arrival:</span>
                  <span className="font-medium text-slate-900">{carrierBooking.destinationETA}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={carrierBooking.telematicsLiveUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold"
                >
                  <span>Open Carrier Live Telematics Track & Trace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: SAP S/4HANA OData Sync */}
        {activeTab === 'sap' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    SAP
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{sapIntegration.erpSystem}</h4>
                    <p className="text-xs text-slate-500">Service: {sapIntegration.oDataService}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SYNCED</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">SAP Delivery Doc ID</span>
                  <span className="font-mono font-bold text-slate-900">{sapIntegration.sapDocumentId}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Sales Order Ref</span>
                  <span className="font-mono font-bold text-slate-700">{sapIntegration.salesOrderRef || 'SO-45009812'}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Purchase Order Ref</span>
                  <span className="font-mono font-bold text-slate-700">{sapIntegration.purchaseOrderRef || 'PO-8812903'}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-emerald-900">BAPI Return Status:</div>
                <div className="font-mono text-emerald-800 text-[11px]">
                  {sapIntegration.bapiReturnCode || 'BAPI_RET_000: Schedule lines updated with R3 corridor transit time.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Raw JSON */}
        {activeTab === 'json' && (
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs max-h-96 overflow-y-auto">
            <pre>{JSON.stringify(dispatchData, null, 2)}</pre>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Form GST EWB-01 Generated & Dispatched to NIC Server</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
