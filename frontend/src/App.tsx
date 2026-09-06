import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ControlCenter } from './views/ControlCenter';
import { DisruptionMonitor } from './views/DisruptionMonitor';
import { ScenarioAnalysis } from './views/ScenarioAnalysis';
import { OptionsComparison } from './views/OptionsComparison';
import { ReviewApproval } from './views/ReviewApproval';
import { AuditView } from './views/AuditView';
import { AuthView } from './views/AuthView';
import { AgentExecutionModal } from './components/AgentExecutionModal';
import { DocumentIngestModal } from './components/DocumentIngestModal';
import { TelemetryFeedModal } from './components/TelemetryFeedModal';
import { DispatchModal } from './components/DispatchModal';
import { WorkforceModal } from './components/WorkforceModal';
import { NetworkConfigModal } from './components/NetworkConfigModal';
import { CustomDisruptionModal } from './components/CustomDisruptionModal';
import { DriverCompanionModal } from './components/DriverCompanionModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { 
  NavigationTab, 
  DisruptionEvent, 
  AuditTrailEvent,
  RecoveryStrategy,
  DispatchBundle,
  OrganizationInfo,
  UserProfile,
  CustomRoleInfo,
  CustomerNode,
  CustomerRoute,
  AuthResponse,
  WarehouseNode
} from './types';
import { 
  initialDisruptions, 
  warehouseNodes, 
  businessProjections, 
  recoveryStrategies, 
  optimizationWeights, 
  complianceChecks, 
  initialAuditTrail 
} from './data/mockData';
import { fetchHealth, runOptimization, submitApproval, fetchDispatch, fetchDisruptions } from './services/api';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeOrg, setActiveOrg] = useState<OrganizationInfo | null>(null);
  const [userRoles, setUserRoles] = useState<CustomRoleInfo[]>([]);
  const [availableTeam, setAvailableTeam] = useState<UserProfile[]>([]);
  const [customNodes, setCustomNodes] = useState<CustomerNode[]>([]);
  const [customRoutes, setCustomRoutes] = useState<CustomerRoute[]>([]);
  const [isNetworkConfigOpen, setIsNetworkConfigOpen] = useState<boolean>(false);
  const [isWorkforceModalOpen, setIsWorkforceModalOpen] = useState<boolean>(false);
  const [isCustomDisruptionOpen, setIsCustomDisruptionOpen] = useState<boolean>(false);

  const [currentTab, setCurrentTab] = useState<NavigationTab>('control-center');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>(initialDisruptions);
  const [selectedDisruption, setSelectedDisruption] = useState<DisruptionEvent>(initialDisruptions[0]);
  const [strategies, setStrategies] = useState<RecoveryStrategy[]>(recoveryStrategies);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('strat-b');
  const [auditTrail, setAuditTrail] = useState<AuditTrailEvent[]>(initialAuditTrail);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(1);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState<boolean>(false);
  const [isDocParserOpen, setIsDocParserOpen] = useState<boolean>(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState<boolean>(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState<boolean>(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [dispatchData, setDispatchData] = useState<DispatchBundle | null>(null);
  const [aiRationale, setAiRationale] = useState<string>('');

  const fetchNetworkData = async (orgId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/network/${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomNodes(data.nodes || []);
        setCustomRoutes(data.routes || []);
      }
    } catch (err) {
      console.warn('Network fetch error:', err);
    }
  };

  const fetchTeamMembers = async (orgId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/workforce/${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableTeam(data);
      }
    } catch (err) {
      console.warn('Workforce team fetch error:', err);
    }
  };

  const fetchOrgDisruptions = async (orgId: string) => {
    try {
      const data = await fetchDisruptions(orgId);
      if (data && Array.isArray(data) && data.length > 0) {
        const enriched = data.map((item: any) => ({
          ...item,
          timeline: item.timeline && Array.isArray(item.timeline) && item.timeline.length > 0
            ? item.timeline
            : [
                {
                  title: 'Incident Telematics Logged',
                  description: item.description || 'Corridor telemetry anomaly flagged',
                  time: item.time || '10:30 AM'
                },
                {
                  title: 'OR-Tools Optimization Evaluated',
                  description: 'MILP rerouting calculated with buffer inventory analysis',
                  time: '10:32 AM'
                }
              ]
        }));
        setDisruptions(enriched);
        setSelectedDisruption(enriched[0]);
      }
    } catch (err) {
      console.warn('Disruptions fetch error:', err);
    }
  };

  // Derive granular permissions based on active role title and ownership
  const userPermissions: CustomRoleInfo = React.useMemo(() => {
    if (!currentUser) {
      return {
        id: 'none',
        name: 'None',
        description: 'Unauthenticated',
        canApprove: false,
        canTuneSolver: false,
        canModifyBuffer: false,
        canDispatchEway: false,
        canManageTeam: false
      };
    }
    if (currentUser.isOwner) {
      return {
        id: 'owner',
        name: currentUser.roleTitle,
        description: 'Organization Owner with Full Administrative Authority',
        canApprove: true,
        canTuneSolver: true,
        canModifyBuffer: true,
        canDispatchEway: true,
        canManageTeam: true
      };
    }
    const matchedRole = userRoles.find(
      r => r.name.toLowerCase().trim() === currentUser.roleTitle.toLowerCase().trim()
    );
    if (matchedRole) {
      return matchedRole;
    }
    return {
      id: 'default',
      name: currentUser.roleTitle,
      description: 'Standard Workspace Member',
      canApprove: false,
      canTuneSolver: false,
      canModifyBuffer: false,
      canDispatchEway: false,
      canManageTeam: false
    };
  }, [currentUser, userRoles]);

  // Check health and restore session from localStorage on load
  useEffect(() => {
    const saved = localStorage.getItem('resilient_chain_auth');
    if (saved) {
      try {
        const parsed: AuthResponse = JSON.parse(saved);
        if (parsed && parsed.user && parsed.organization) {
          setCurrentUser(parsed.user);
          setActiveOrg(parsed.organization);
          setUserRoles(parsed.roles || []);
          fetchNetworkData(parsed.organization.id);
          fetchTeamMembers(parsed.organization.id);
          fetchOrgDisruptions(parsed.organization.id);
        }
      } catch (e) {
        localStorage.removeItem('resilient_chain_auth');
      }
    }

    fetchHealth().then(res => {
      setBackendConnected(res && res.status === 'healthy');
    });

    fetchDispatch('D-001').then(d => {
      if (d && d.ewayBill) {
        setDispatchData(d);
        setIsApproved(true);
        setPendingApprovalsCount(0);
      }
    });
  }, []);

  const handleLoginSuccess = (auth: AuthResponse) => {
    localStorage.setItem('resilient_chain_auth', JSON.stringify(auth));
    setCurrentUser(auth.user);
    setActiveOrg(auth.organization);
    setUserRoles(auth.roles || []);
    fetchNetworkData(auth.organization.id);
    fetchTeamMembers(auth.organization.id);
    fetchOrgDisruptions(auth.organization.id);
  };

  const handleSignOut = () => {
    localStorage.removeItem('resilient_chain_auth');
    setCurrentUser(null);
    setActiveOrg(null);
    setUserRoles([]);
    setAvailableTeam([]);
    setCustomNodes([]);
    setCustomRoutes([]);
  };

  const handleSwitchUser = (selectedUser: UserProfile) => {
    setCurrentUser(selectedUser);
    const saved = localStorage.getItem('resilient_chain_auth');
    if (saved) {
      try {
        const parsed: AuthResponse = JSON.parse(saved);
        parsed.user = selectedUser;
        localStorage.setItem('resilient_chain_auth', JSON.stringify(parsed));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleSwitchToDemo = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/demo');
      if (res.ok) {
        const data: AuthResponse = await res.json();
        handleLoginSuccess(data);
      }
    } catch (err) {
      console.error('Failed to switch to demo:', err);
    }
  };

  const handleSimulateDisruption = async (disruptionId: string) => {
    const found = disruptions.find(d => d.id === disruptionId) || disruptions[0];
    setSelectedDisruption(found);
    setIsApproved(false);
    setPendingApprovalsCount(1);

    // Call backend optimization solver
    const solverRes = await runOptimization(disruptionId, found.route);
    if (solverRes) {
      if (solverRes.strategies) setStrategies(solverRes.strategies);
      if (solverRes.auditTrail) setAuditTrail(solverRes.auditTrail);
      if (solverRes.aiRationale) setAiRationale(solverRes.aiRationale);
      if (solverRes.recommendedStrategy) setSelectedStrategyId(solverRes.recommendedStrategy);
    }
  };

  const handleDeployExtractedDisruption = async (extracted: any) => {
    const newDisruption: DisruptionEvent = {
      id: extracted.id,
      eventType: extracted.eventType,
      route: extracted.route,
      severity: extracted.severity as any,
      impact: `${extracted.affectedShipments} shipments`,
      time: 'Just now',
      affectedRoute: extracted.affectedRoute,
      affectedShipments: extracted.affectedShipments,
      estimatedDelay: extracted.estimatedDelay,
      stockOutRisk: extracted.stockOutRisk,
      additionalCost: extracted.additionalCost,
      description: extracted.description,
      timeline: [
        {
          title: 'Document Parsed by Gemini 2.5',
          description: 'Official circular extracted into operational parameters.',
          time: 'Just now'
        }
      ]
    };

    setDisruptions(prev => [newDisruption, ...prev]);
    setSelectedDisruption(newDisruption);
    setIsApproved(false);
    setPendingApprovalsCount(1);

    // Run solver on new disruption
    const solverRes = await runOptimization(extracted.id, extracted.route);
    if (solverRes) {
      if (solverRes.strategies) setStrategies(solverRes.strategies);
      if (solverRes.auditTrail) setAuditTrail(solverRes.auditTrail);
      if (solverRes.aiRationale) setAiRationale(solverRes.aiRationale);
      if (solverRes.recommendedStrategy) setSelectedStrategyId(solverRes.recommendedStrategy);
    }

    setCurrentTab('control-center');
  };

  const handleCustomDisruptionInjected = (result: {
    disruption: any;
    solverStrategies: any;
    recommendedStrategy: string;
    aiRationale: string;
    auditTrail: any;
  }) => {
    if (!result || !result.disruption) return;
    const newD: DisruptionEvent = {
      id: result.disruption.id,
      eventType: result.disruption.eventType,
      route: result.disruption.route,
      severity: result.disruption.severity,
      impact: result.disruption.impact,
      time: result.disruption.time || 'Just now',
      affectedRoute: result.disruption.affectedRoute,
      affectedShipments: result.disruption.affectedShipments,
      estimatedDelay: result.disruption.estimatedDelay,
      stockOutRisk: result.disruption.stockOutRisk,
      additionalCost: result.disruption.additionalCost,
      description: result.disruption.description,
      timeline: result.disruption.timeline || [
        {
          title: 'Custom Incident Injected',
          description: result.disruption.description,
          time: 'Just now'
        }
      ]
    };

    setDisruptions(prev => [newD, ...prev.filter(d => d.id !== newD.id)]);
    setSelectedDisruption(newD);
    if (result.solverStrategies) setStrategies(result.solverStrategies);
    if (result.recommendedStrategy) setSelectedStrategyId(result.recommendedStrategy);
    if (result.aiRationale) setAiRationale(result.aiRationale);
    if (result.auditTrail) setAuditTrail(result.auditTrail);
    setIsApproved(false);
    setPendingApprovalsCount(1);
    setCurrentTab('options');
  };

  const handleTriggerAgentPipeline = () => {
    setIsAgentModalOpen(true);
  };

  const handleAgentPipelineComplete = () => {
    setIsAgentModalOpen(false);
    setCurrentTab('options');
  };

  const handleUpdateWeights = async (weights: Record<string, number>) => {
    const res = await runOptimization(selectedDisruption.id, selectedDisruption.route, weights);
    if (res) {
      if (res.strategies) setStrategies(res.strategies);
      if (res.aiRationale) setAiRationale(res.aiRationale);
      if (res.recommendedStrategy) setSelectedStrategyId(res.recommendedStrategy);
    }
  };

  const handleApprove = async () => {
    if (isApproved) return;
    setIsApproved(true);
    setPendingApprovalsCount(0);

    // Submit to FastAPI backend (saved into SQLite db + generates e-way bill)
    const approvalRes = await submitApproval(selectedDisruption.id, selectedStrategyId, 'APPROVED');
    if (approvalRes && approvalRes.dispatchInfo) {
      setDispatchData(approvalRes.dispatchInfo);
      setIsDispatchModalOpen(true);
    } else {
      const d = await fetchDispatch(selectedDisruption.id);
      if (d) {
        setDispatchData(d);
        setIsDispatchModalOpen(true);
      }
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAuditTrail(prev => [
      ...prev.filter(item => item.status !== 'pending'),
      {
        time: nowTime,
        agent: 'Human Logistics Director',
        action: `Strategy ${selectedStrategyId.replace('strat-', '').toUpperCase()} Authorized: Dispatched to Carrier Corridor`,
        status: 'optimal'
      },
      {
        time: 'CURRENT STATUS',
        agent: 'Logistics Execution Engine',
        action: 'Recovery in Progress • Indian Freight Telematics Active',
        status: 'normal'
      }
    ]);
  };

  const handleModifySubmit = async (data: { bufferPct: number; carrier: string; notes: string }) => {
    setIsApproved(true);
    setPendingApprovalsCount(0);

    try {
      const res = await fetch(`http://localhost:8000/api/approvals/${selectedDisruption.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          decision: 'MODIFIED',
          humanNotes: data.notes,
          carrierOverride: data.carrier,
          modifiedBufferPct: data.bufferPct
        })
      });
      if (res.ok) {
        const body = await res.json();
        if (body && body.dispatchInfo) {
          setDispatchData(body.dispatchInfo);
          setIsDispatchModalOpen(true);
        }
      }
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAuditTrail(prev => [
      ...prev.filter(item => item.status !== 'pending'),
      {
        time: nowTime,
        agent: 'Human Logistics Director',
        action: `Plan Modified & Approved: Carrier '${data.carrier}' (W2 Buffer ${data.bufferPct}%)`,
        status: 'optimal'
      },
      {
        time: 'CURRENT STATUS',
        agent: 'Logistics Execution Engine',
        action: 'Dispatched with Custom Human Override • SQLite Committed',
        status: 'normal'
      }
    ]);
  };

  const handleReject = async () => {
    setPendingApprovalsCount(0);
    await submitApproval(selectedDisruption.id, selectedStrategyId, 'REJECTED');

    setAuditTrail(prev => [
      ...prev.filter(item => item.status !== 'pending'),
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agent: 'Human Logistics Director',
        action: 'Strategy Rejected by Human Planner',
        status: 'rejected'
      }
    ]);
    alert('Plan has been rejected. Routing back to Scenario Analysis for alternative formulation.');
    setCurrentTab('analysis');
  };

  const handleQuickApprove = () => {
    setCurrentTab('approvals');
  };

  // If user is not authenticated, present the clean monochrome authentication & enrollment gateway
  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  // Map custom company nodes to warehouse nodes format if configured
  const displayedWarehouseNodes: WarehouseNode[] = (customNodes.length > 0)
    ? customNodes.map(n => ({
        id: n.id,
        name: `${n.name} (${n.city})`,
        type: `Capacity: ${n.capacity.toLocaleString()} MT`,
        status: (n.safetyBufferPct < 20 ? 'Below Safety Threshold' : 'Available') as 'Below Safety Threshold' | 'Available' | 'Constrained',
        statusType: (n.safetyBufferPct < 20 ? 'danger' : 'success') as 'danger' | 'success'
      }))
    : warehouseNodes;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeDisruptionsCount={disruptions.length}
          backendConnected={backendConnected}
          selectedDisruptionId={selectedDisruption.id}
          onSimulateDisruption={handleSimulateDisruption}
          onOpenDocParser={() => setIsDocParserOpen(true)}
          onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
          onOpenWorkforce={() => setIsWorkforceModalOpen(true)}
          onOpenDispatch={() => setIsDispatchModalOpen(true)}
          onOpenNetworkConfig={() => setIsNetworkConfigOpen(true)}
          onOpenCustomDisruption={() => setIsCustomDisruptionOpen(true)}
          onOpenDriverApp={() => setIsDriverModalOpen(true)}
          disruptionsList={disruptions}
          onSignOut={handleSignOut}
          onSwitchToDemo={handleSwitchToDemo}
          activeOrg={activeOrg}
          currentUser={currentUser}
          hasActiveDispatch={!!dispatchData}
          userPermissions={userPermissions}
          availableTeam={availableTeam}
          onSwitchUser={handleSwitchUser}
        />

        {/* View Container */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'control-center' && (
              <ErrorBoundary fallbackTitle="Control Center Issue">
                <ControlCenter
                  onNavigate={setCurrentTab}
                  onQuickApprove={handleQuickApprove}
                  pendingApprovalsCount={pendingApprovalsCount}
                  onTriggerAgentSim={handleTriggerAgentPipeline}
                  canApprove={userPermissions.canApprove}
                  selectedDisruption={selectedDisruption}
                  onOpenCustomDisruption={() => setIsCustomDisruptionOpen(true)}
                  disruptionsCount={disruptions.length}
                  customNodes={customNodes}
                  customRoutes={customRoutes}
                  orgId={activeOrg?.id || 'tata-motors'}
                  orgName={activeOrg?.name || 'Tata Motors CV'}
                  onRouteAllotted={() => {
                    if (activeOrg) fetchNetworkData(activeOrg.id);
                  }}
                  onSimulateDisruptionOnLane={(laneCode) => {
                    setIsCustomDisruptionOpen(true);
                  }}
                  onOpenDriverApp={() => setIsDriverModalOpen(true)}
                />
              </ErrorBoundary>
            )}

            {currentTab === 'monitor' && (
              <ErrorBoundary fallbackTitle="Disruption Monitor Issue">
                <DisruptionMonitor
                  disruptions={disruptions}
                  selectedDisruption={selectedDisruption}
                  onSelectDisruption={(d) => {
                    setSelectedDisruption(d);
                    handleSimulateDisruption(d.id);
                  }}
                  onNavigate={setCurrentTab}
                  onOpenTelemetry={() => setIsTelemetryModalOpen(true)}
                  onOpenCustomDisruption={() => setIsCustomDisruptionOpen(true)}
                />
              </ErrorBoundary>
            )}

            {currentTab === 'analysis' && (
              <ErrorBoundary fallbackTitle="Scenario Analysis Issue">
                <ScenarioAnalysis
                  warehouseNodes={displayedWarehouseNodes}
                  projections={businessProjections}
                  onNavigate={setCurrentTab}
                  onTriggerAgentSim={handleTriggerAgentPipeline}
                />
              </ErrorBoundary>
            )}

            {currentTab === 'options' && (
              <ErrorBoundary fallbackTitle="Options Comparison Issue">
                <OptionsComparison
                  strategies={strategies}
                  weights={optimizationWeights}
                  selectedStrategyId={selectedStrategyId}
                  onSelectStrategy={setSelectedStrategyId}
                  onNavigate={setCurrentTab}
                  onUpdateWeights={handleUpdateWeights}
                  aiRationale={aiRationale}
                  canTuneSolver={userPermissions.canTuneSolver}
                />
              </ErrorBoundary>
            )}

            {currentTab === 'approvals' && (
              <ErrorBoundary fallbackTitle="Review & Approvals Issue">
                <ReviewApproval
                  complianceChecks={complianceChecks}
                  auditTrail={auditTrail}
                  isApproved={isApproved}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onNavigate={setCurrentTab}
                  onModifySubmit={handleModifySubmit}
                  onOpenDispatch={() => setIsDispatchModalOpen(true)}
                  aiRationale={aiRationale}
                  canApprove={userPermissions.canApprove}
                  canModifyBuffer={userPermissions.canModifyBuffer}
                  canDispatchEway={userPermissions.canDispatchEway}
                  roleTitle={currentUser.roleTitle}
                />
              </ErrorBoundary>
            )}

            {currentTab === 'audit' && (
              <ErrorBoundary fallbackTitle="Audit Trail Issue">
                <AuditView auditTrail={auditTrail} />
              </ErrorBoundary>
            )}
          </div>
        </main>
      </div>

      {/* Live Agent Execution Modal */}
      <AgentExecutionModal
        isOpen={isAgentModalOpen}
        onComplete={handleAgentPipelineComplete}
      />

      {/* AI Document Ingestion Modal */}
      <DocumentIngestModal
        isOpen={isDocParserOpen}
        onClose={() => setIsDocParserOpen(false)}
        onDeployDisruption={handleDeployExtractedDisruption}
      />

      {/* Live IoT Telematics & Sensory Modal */}
      <TelemetryFeedModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        onAnomalyDetected={(anomaly) => {
          setIsTelemetryModalOpen(false);
          handleSimulateDisruption('D-001');
          setIsAgentModalOpen(true);
        }}
      />

      {/* Outbound Enterprise Dispatch & GST e-Way Bill Modal */}
      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        dispatchData={dispatchData}
      />

      {/* Enterprise Workforce & Custom Roles Modal */}
      <WorkforceModal
        isOpen={isWorkforceModalOpen}
        onClose={() => setIsWorkforceModalOpen(false)}
        orgId={activeOrg?.id || 'tata-motors'}
        orgName={activeOrg?.name || 'Tata Motors CV'}
        currentUser={currentUser}
        canManageTeam={userPermissions.canManageTeam}
      />

      {/* Customer Supply Chain Network Configuration Modal */}
      <NetworkConfigModal
        isOpen={isNetworkConfigOpen}
        onClose={() => setIsNetworkConfigOpen(false)}
        orgId={activeOrg?.id || 'tata-motors'}
        orgName={activeOrg?.name || 'Tata Motors CV'}
        onNetworkUpdated={() => {
          if (activeOrg) fetchNetworkData(activeOrg.id);
        }}
      />

      {/* Custom Supply Chain Incident Simulator Modal */}
      <CustomDisruptionModal
        isOpen={isCustomDisruptionOpen}
        onClose={() => setIsCustomDisruptionOpen(false)}
        orgId={activeOrg?.id || 'tata-motors'}
        orgName={activeOrg?.name || 'Tata Motors CV'}
        customRoutes={customRoutes}
        customNodes={customNodes}
        onDisruptionInjected={handleCustomDisruptionInjected}
      />

      {/* Driver Mobile Companion Portal */}
      <DriverCompanionModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        assignedRouteCode={selectedDisruption?.route || 'PUN-DEL-EXP'}
        onEmergencyDispatched={() => {
          setIsDriverModalOpen(false);
          if (activeOrg) fetchNetworkData(activeOrg.id);
        }}
      />
    </div>
  );
}

export default App;
