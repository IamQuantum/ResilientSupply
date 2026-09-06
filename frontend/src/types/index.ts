export type NavigationTab = 
  | 'control-center'
  | 'monitor'
  | 'analysis'
  | 'options'
  | 'approvals'
  | 'audit';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface DisruptionEvent {
  id: string;
  eventType: string;
  route: string;
  severity: SeverityLevel;
  impact: string;
  time: string;
  description: string;
  affectedRoute: string;
  affectedShipments: number;
  estimatedDelay: string;
  stockOutRisk: number;
  additionalCost: string;
  timeline: {
    title: string;
    description: string;
    time: string;
  }[];
}

export interface WarehouseNode {
  id: string;
  name: string;
  type: string;
  status: 'Below Safety Threshold' | 'Available' | 'Constrained';
  statusType: 'danger' | 'success' | 'warning';
}

export interface BusinessProjection {
  label: string;
  baselineText: string;
  baselineValue: number;
  impactText: string;
  impactValue: number;
  color: string;
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  badge?: string;
  type: string;
  route: string;
  cost: string;
  costNumeric: number;
  risk: 'Low' | 'Medium' | 'High';
  delivery: string;
  isRecommended?: boolean;
}

export interface OptimizationWeight {
  label: string;
  percentage: number;
  color: string;
}

export interface ComplianceCheck {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  agent: string;
}

export interface AuditTrailEvent {
  time: string;
  agent: string;
  action: string;
  status: 'normal' | 'optimal' | 'rejected' | 'pending';
}

export interface EWayBillInfo {
  ewayBillNo: string;
  ewayBillDate: string;
  validUntil: string;
  supplyType: string;
  docType: string;
  consignor: {
    legalName: string;
    gstin: string;
    address: string;
    pincode: string;
    state: string;
  };
  consignee: {
    legalName: string;
    gstin: string;
    address: string;
    pincode: string;
    state: string;
  };
  goods: {
    hsnCode: string;
    description: string;
    taxableAmountINR?: number;
    cgstINR?: number;
    sgstINR?: number;
    totalAmountINR: number;
  };
  partB: {
    transporterId: string;
    transporterName: string;
    vehicleNo: string;
    vehicleType?: string;
    docNo: string;
    docDate?: string;
    corridor: string;
  };
  qrPayload: string;
}

export interface CarrierBookingInfo {
  provider: string;
  transporterId?: string;
  bookingRef: string;
  lrNumber: string;
  vehicleAssigned: string;
  driverAssigned: string;
  pickupETA?: string;
  destinationETA?: string;
  telematicsLiveUrl?: string;
  dispatchStatus: string;
}

export interface SAPIntegrationInfo {
  erpSystem: string;
  oDataService?: string;
  sapDocumentId: string;
  salesOrderRef?: string;
  purchaseOrderRef?: string;
  scheduleLineStatus: string;
  bapiReturnCode?: string;
}

export interface DispatchBundle {
  status: string;
  ewayBill: EWayBillInfo;
  carrierBooking: CarrierBookingInfo;
  sapIntegration: SAPIntegrationInfo;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  department: string;
  isOwner: boolean;
  status: string;
}

export interface CustomRoleInfo {
  id: string;
  name: string;
  description: string;
  canApprove: boolean;
  canTuneSolver: boolean;
  canModifyBuffer: boolean;
  canDispatchEway: boolean;
  canManageTeam: boolean;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  industry: string;
  gstin: string;
  headquarters: string;
  isDemo: boolean;
}

export interface CustomerNode {
  id: string;
  name: string;
  city: string;
  pincode: string;
  address?: string;
  lat?: number;
  lng?: number;
  capacity: number;
  safetyBufferPct: number;
  status: string;
}

export interface CustomerRoute {
  id: string;
  routeCode: string;
  origin: string;
  destination: string;
  originAddress?: string;
  destinationAddress?: string;
  distanceKm?: number;
  waypoints?: string;
  transitHours: number;
  carrier: string;
  status: string;
}

export interface AuthResponse {
  status: string;
  user: UserProfile;
  organization: OrganizationInfo;
  roles: CustomRoleInfo[];
}

