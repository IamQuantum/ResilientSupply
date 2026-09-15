import { 
  DisruptionEvent, 
  WarehouseNode, 
  BusinessProjection, 
  RecoveryStrategy, 
  OptimizationWeight, 
  ComplianceCheck, 
  AuditTrailEvent 
} from '../types';

export const initialDisruptions: DisruptionEvent[] = [
  {
    id: 'D-001',
    eventType: 'Route Blocked',
    route: 'R1 (NH-44)',
    severity: 'Critical',
    impact: '5 shipments',
    time: '10:31 AM',
    affectedRoute: 'R1 (NH-44 Ambala-Karnal GT Road Corridor)',
    affectedShipments: 5,
    estimatedDelay: '2 Days',
    stockOutRisk: 72,
    additionalCost: '₹45K',
    description: 'Primary NH-44 arterial corridor compromised due to severe waterlogging and bridge maintenance near Ambala Cantt / Shambhu border. Immediate rerouting required to avert industrial supply gridlock between Kharar/Punjab and Delhi NCR.',
    timeline: [
      {
        title: 'Disruption Detected',
        description: 'Automated telematics sensor network flagged complete traffic stall on NH-44.',
        time: '10:31 AM'
      },
      {
        title: 'Shipments Identified',
        description: '5 high-priority pharma and automotive shipments mapped to affected corridor.',
        time: '10:33 AM'
      },
      {
        title: 'Impact Calculated',
        description: 'Financial penalty and NCR delivery models finalized by AI Sensing Agent.',
        time: '10:34 AM'
      }
    ]
  },
  {
    id: 'D-002',
    eventType: 'Toll Congestion',
    route: 'Shambhu-Ambala Toll',
    severity: 'High',
    impact: '12 shipments',
    time: '09:15 AM',
    affectedRoute: 'Shambhu Border Toll Plaza',
    affectedShipments: 12,
    estimatedDelay: '18 Hours',
    stockOutRisk: 48,
    additionalCost: '₹32K',
    description: 'Heavy freight queue exceeding 4 km at Shambhu border FASTag lanes. Rerouting freight via Kharar-Banur-Tepla arterial expressway required.',
    timeline: [
      {
        title: 'Congestion Alert',
        description: 'FASTag toll gate telematics reported transit velocity drop > 85%.',
        time: '09:15 AM'
      }
    ]
  },
  {
    id: 'D-003',
    eventType: 'Weather Delay',
    route: 'R4 (Siswan-Baddi)',
    severity: 'Medium',
    impact: '2 shipments',
    time: 'Yesterday',
    affectedRoute: 'Siswan Pass Hill Transit (HP Border)',
    affectedShipments: 2,
    estimatedDelay: '8 Hours',
    stockOutRisk: 20,
    additionalCost: '₹18K',
    description: 'Dense seasonal fog advisory along Siswan transit pass slowing freight velocity between Kharar logistics hub and Baddi pharma industrial corridor.',
    timeline: [
      {
        title: 'Weather Advisory Issued',
        description: 'IMD hill radar telemetry triggered freight transit speed restrictions.',
        time: 'Yesterday 16:40'
      }
    ]
  }
];

export const warehouseNodes: WarehouseNode[] = [
  {
    id: 'W1',
    name: 'W1 (Kharar Central Hub)',
    type: 'Primary Logistics DC',
    status: 'Below Safety Threshold',
    statusType: 'danger'
  },
  {
    id: 'W2',
    name: 'W2 (Chandigarh / Mohali Hub)',
    type: 'Satellite Industrial DC',
    status: 'Available',
    statusType: 'success'
  },
  {
    id: 'W3',
    name: 'W3 (Ludhiana Focal Point Hub)',
    type: 'Satellite Manufacturing DC',
    status: 'Available',
    statusType: 'success'
  },
  {
    id: 'W4',
    name: 'W4 (Baddi Pharma Hub)',
    type: 'Specialized Cold-Chain DC',
    status: 'Available',
    statusType: 'success'
  }
];

export const businessProjections: BusinessProjection[] = [
  {
    label: 'AVERAGE DELAY (HOURS)',
    baselineText: 'Baseline: 6h',
    baselineValue: 20,
    impactText: 'Impact: 48h',
    impactValue: 90,
    color: 'bg-red-600'
  },
  {
    label: 'DELIVERY FAILURE RISK (%)',
    baselineText: 'Baseline: 4%',
    baselineValue: 8,
    impactText: 'Impact: 72%',
    impactValue: 72,
    color: 'bg-amber-700'
  },
  {
    label: 'LOGISTICS COST VARIANCE (₹)',
    baselineText: 'Baseline: ₹8k',
    baselineValue: 22,
    impactText: 'Impact: ₹38.5k',
    impactValue: 95,
    color: 'bg-blue-700'
  }
];

export const recoveryStrategies: RecoveryStrategy[] = [
  {
    id: 'strat-a',
    name: 'Strategy A',
    type: 'Direct Air Cargo (Over Budget)',
    route: 'Direct Air Cargo (IXC → DEL Terminal 3)',
    cost: '₹1,45,000',
    costNumeric: 145000,
    risk: 'Low',
    delivery: '+0.5 Days'
  },
  {
    id: 'strat-b',
    name: 'Strategy B',
    badge: 'RECOMMENDED',
    type: 'Regional Reroute + Safety Stock',
    route: 'Via Corridor R3 (Kharar-Banur-Tepla Bypass via Mohali Hub W2)',
    cost: '₹38,000',
    costNumeric: 38000,
    risk: 'Low',
    delivery: '+1 Day',
    isRecommended: true
  },
  {
    id: 'strat-c',
    name: 'Strategy C',
    type: 'Consolidated Rail Freight (Ludhiana DFC)',
    route: 'Via Ludhiana Dedicated Freight Corridor (Rail/Road)',
    cost: '₹24,000',
    costNumeric: 24000,
    risk: 'Medium',
    delivery: '+2 Days'
  }
];

export const optimizationWeights: OptimizationWeight[] = [
  { label: 'Delivery Time (Risk)', percentage: 40, color: 'bg-blue-600' },
  { label: 'Cost', percentage: 30, color: 'bg-slate-500' },
  { label: 'Inventory Impact', percentage: 20, color: 'bg-slate-400' },
  { label: 'Compliance', percentage: 10, color: 'bg-slate-300' }
];

export const complianceChecks: ComplianceCheck[] = [
  {
    id: 'c1',
    title: 'Cold-chain satisfied',
    description: 'Logistics Agent confirmed active reefer temperature telemetry on Corridor R3.',
    passed: true,
    agent: 'Logistics Agent'
  },
  {
    id: 'c2',
    title: 'Safety stock maintained',
    description: 'Inventory Agent verified Warehouse W2 (Mohali / Chandigarh Hub) post-withdrawal buffer level > 25%.',
    passed: true,
    agent: 'Inventory Agent'
  },
  {
    id: 'c3',
    title: 'Capacity available',
    description: 'Fleet coordinator confirmed slot allotment for 5 critical containers via Banur-Tepla bypass.',
    passed: true,
    agent: 'Logistics Agent'
  },
  {
    id: 'c4',
    title: 'Policy checks passed',
    description: 'Compliance Agent validated Punjab/Haryana GST e-Way bills and Interstate SLA indemnity.',
    passed: true,
    agent: 'Compliance Agent'
  }
];

export const initialAuditTrail: AuditTrailEvent[] = [
  {
    time: '04:00Z',
    agent: 'Sensing Agent',
    action: 'Disruption Detected (W1 Kharar Central Hub on NH-44 Ambala Section)',
    status: 'normal'
  },
  {
    time: '04:05Z',
    agent: 'Orchestrator',
    action: 'Impact Assessment Complete (5 shipments at risk)',
    status: 'normal'
  },
  {
    time: '04:10Z',
    agent: 'AI Core',
    action: 'Google OR-Tools Mixed-Integer Graph Optimization Solved',
    status: 'normal'
  },
  {
    time: '04:12Z',
    agent: 'Financial Agent',
    action: 'Strategy A Evaluated: Over Emergency Budget Cap (₹1,45,000)',
    status: 'rejected'
  },
  {
    time: '04:15Z',
    agent: 'Orchestrator',
    action: 'Strategy B Selected as Multi-Objective Optimum',
    status: 'optimal'
  },
  {
    time: '04:16Z',
    agent: 'Compliance Agent',
    action: 'Constraint & SLA Validation Check: Passed (GST e-Way Validated PB/HR)',
    status: 'normal'
  },
  {
    time: '04:18Z',
    agent: 'Logistics Agent',
    action: 'Fleet Capacity Confirmed on Banur-Tepla Bypass',
    status: 'normal'
  },
  {
    time: '04:20Z',
    agent: 'Inventory Agent',
    action: 'Buffer Stock Verified at W2 (Mohali / Chandigarh Hub)',
    status: 'normal'
  },
  {
    time: '04:22Z',
    agent: 'Risk Agent',
    action: 'Residual Failure Probability Modeled at 6%',
    status: 'normal'
  },
  {
    time: 'CURRENT STATUS',
    agent: '',
    action: 'Pending Human Approval',
    status: 'pending'
  }
];
