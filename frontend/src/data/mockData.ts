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
    route: 'R1 (NH-48)',
    severity: 'Critical',
    impact: '5 shipments',
    time: '10:31 AM',
    affectedRoute: 'R1 (NH-48 Surat-Bharuch Corridor)',
    affectedShipments: 5,
    estimatedDelay: '2 Days',
    stockOutRisk: 72,
    additionalCost: '₹85K',
    description: 'Primary NH-48 arterial corridor compromised due to severe bridge maintenance and monsoon waterlogging between Surat and Bharuch. Immediate rerouting required to avert industrial supply gridlock towards NCR.',
    timeline: [
      {
        title: 'Disruption Detected',
        description: 'Automated telematics sensor network flagged complete traffic stall on NH-48.',
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
    eventType: 'Port Congestion',
    route: 'JNPT-NaviMumbai',
    severity: 'High',
    impact: '12 shipments',
    time: '09:15 AM',
    affectedRoute: 'JNPT Container Terminal',
    affectedShipments: 12,
    estimatedDelay: '4 Days',
    stockOutRisk: 58,
    additionalCost: '₹140K',
    description: 'Vessel queue buildup at Jawaharlal Nehru Port Trust (JNPT) exceeds berth capacity. Average berthing delay increased to 96 hours cascading to ICD inland terminals.',
    timeline: [
      {
        title: 'Congestion Alert',
        description: 'Port AIS vessel tracking feed reported berthing queue > 18 container vessels.',
        time: '09:15 AM'
      }
    ]
  },
  {
    id: 'D-003',
    eventType: 'Weather Delay',
    route: 'R5 (NH-66)',
    severity: 'Medium',
    impact: '2 shipments',
    time: 'Yesterday',
    affectedRoute: 'R5 Western Ghats Transit Pass',
    affectedShipments: 2,
    estimatedDelay: '18 Hours',
    stockOutRisk: 24,
    additionalCost: '₹32K',
    description: 'Monsoon landslide advisory along Western Ghats transit pass slowing freight velocity between Pune and coastal industrial corridors.',
    timeline: [
      {
        title: 'Weather Advisory Issued',
        description: 'IMD radar telemetry triggered freight transit speed restrictions.',
        time: 'Yesterday 16:40'
      }
    ]
  }
];

export const warehouseNodes: WarehouseNode[] = [
  {
    id: 'W1',
    name: 'W1 (Mumbai Bhiwandi Hub)',
    type: 'Primary Logistics DC',
    status: 'Below Safety Threshold',
    statusType: 'danger'
  },
  {
    id: 'W2',
    name: 'W2 (Pune Chakan Hub)',
    type: 'Satellite Industrial DC',
    status: 'Available',
    statusType: 'success'
  },
  {
    id: 'W3',
    name: 'W3 (Ahmedabad Sanand Hub)',
    type: 'Satellite Industrial DC',
    status: 'Available',
    statusType: 'success'
  }
];

export const businessProjections: BusinessProjection[] = [
  {
    label: 'AVERAGE DELAY (HOURS)',
    baselineText: 'Baseline: 12h',
    baselineValue: 20,
    impactText: 'Impact: 60h',
    impactValue: 90,
    color: 'bg-red-600'
  },
  {
    label: 'DELIVERY FAILURE RISK (%)',
    baselineText: 'Baseline: 5%',
    baselineValue: 8,
    impactText: 'Impact: 72%',
    impactValue: 72,
    color: 'bg-amber-700'
  },
  {
    label: 'LOGISTICS COST VARIANCE (₹)',
    baselineText: 'Baseline: ₹12k',
    baselineValue: 22,
    impactText: 'Impact: ₹54.5k',
    impactValue: 95,
    color: 'bg-blue-700'
  }
];

export const recoveryStrategies: RecoveryStrategy[] = [
  {
    id: 'strat-a',
    name: 'Strategy A',
    type: 'Direct Air Cargo (Over Budget)',
    route: 'Direct Air Cargo (BOM → DEL)',
    cost: '₹1,85,000',
    costNumeric: 185000,
    risk: 'Low',
    delivery: '+1 Day'
  },
  {
    id: 'strat-b',
    name: 'Strategy B',
    badge: 'RECOMMENDED',
    type: 'Regional Reroute + Safety Stock',
    route: 'Via Corridor R3 (Pune Chakan Hub W2)',
    cost: '₹72,000',
    costNumeric: 72000,
    risk: 'Low',
    delivery: '+1 Day',
    isRecommended: true
  },
  {
    id: 'strat-c',
    name: 'Strategy C',
    type: 'Hybrid Multi-Modal (Rail/Road)',
    route: 'Via Coastal Corridor R5',
    cost: '₹48,000',
    costNumeric: 48000,
    risk: 'High',
    delivery: '+5 Days'
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
    description: 'Inventory Agent verified Warehouse W2 (Pune Chakan) post-withdrawal buffer level > 15%.',
    passed: true,
    agent: 'Inventory Agent'
  },
  {
    id: 'c3',
    title: 'Capacity available',
    description: 'Fleet coordinator confirmed slot allotment for 5 critical containers via Western Express bypass.',
    passed: true,
    agent: 'Logistics Agent'
  },
  {
    id: 'c4',
    title: 'Policy checks passed',
    description: 'Compliance Agent validated GST e-Way bills and Interstate SLA penalty indemnity.',
    passed: true,
    agent: 'Compliance Agent'
  }
];

export const initialAuditTrail: AuditTrailEvent[] = [
  {
    time: '04:00Z',
    agent: 'Sensing Agent',
    action: 'Disruption Detected (W1 Bhiwandi Outage on NH-48)',
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
    action: 'Strategy A Evaluated: Over Emergency Budget Cap (₹1,85,000)',
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
    action: 'Constraint & SLA Validation Check: Passed (GST e-Way Validated)',
    status: 'normal'
  },
  {
    time: '04:18Z',
    agent: 'Logistics Agent',
    action: 'Fleet Capacity Confirmed on Corridor R3',
    status: 'normal'
  },
  {
    time: '04:20Z',
    agent: 'Inventory Agent',
    action: 'Buffer Stock Verified at W2 (Pune Chakan Hub)',
    status: 'normal'
  },
  {
    time: '04:22Z',
    agent: 'Risk Agent',
    action: 'Residual Failure Probability Modeled at 8%',
    status: 'normal'
  },
  {
    time: 'CURRENT STATUS',
    agent: '',
    action: 'Pending Human Approval',
    status: 'pending'
  }
];
