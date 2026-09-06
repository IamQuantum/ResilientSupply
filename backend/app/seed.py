import hashlib
from datetime import datetime
from .database import engine, Base, SessionLocal
from .models import Disruption, RecoveryStrategy, ComplianceCheck, AuditLog

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Disruption).first():
        db.close()
        return

    # 1. Indian Supply Chain Disruptions
    d1 = Disruption(
        id="D-001",
        event_type="Route Blocked",
        route="R1 (NH-48)",
        severity="Critical",
        impact="5 shipments",
        time="10:31 AM",
        affected_route="R1 (NH-48 Surat-Bharuch Corridor)",
        affected_shipments=5,
        estimated_delay="2 Days",
        stock_out_risk=72,
        additional_cost="₹85K",
        description="Primary NH-48 arterial corridor compromised due to severe bridge maintenance and waterlogging between Surat and Bharuch. Immediate rerouting required to prevent supply gridlock towards NCR."
    )

    d2 = Disruption(
        id="D-002",
        event_type="Port Congestion",
        route="JNPT-NaviMumbai",
        severity="High",
        impact="12 shipments",
        time="09:15 AM",
        affected_route="JNPT Container Terminal",
        affected_shipments=12,
        estimated_delay="4 Days",
        stock_out_risk=58,
        additional_cost="₹140K",
        description="Berthing queue exceeds 18 container vessels at Jawaharlal Nehru Port Trust (JNPT). Inbound customs clearance backlog cascading to ICD inland distribution."
    )

    d3 = Disruption(
        id="D-003",
        event_type="Weather Delay",
        route="R5 (NH-66)",
        severity="Medium",
        impact="2 shipments",
        time="Yesterday",
        affected_route="R5 Western Ghats Transit Pass",
        affected_shipments=2,
        estimated_delay="18 Hours",
        stock_out_risk=24,
        additional_cost="₹32K",
        description="Monsoon landslide advisory along Western Ghats transit pass slowing freight velocity between Pune and coastal industrial corridors."
    )

    db.add_all([d1, d2, d3])
    db.commit()

    # 2. Strategies for D-001
    s_a = RecoveryStrategy(
        id="strat-a",
        disruption_id="D-001",
        name="Strategy A",
        type="Air Freight Expedite (Over Budget)",
        route="Direct Air Cargo (BOM → DEL)",
        cost="₹1,85,000",
        cost_numeric=185000,
        delay_hours=14,
        delivery="+1 Day",
        risk="Low",
        is_recommended=False,
        composite_score=0.68
    )

    s_b = RecoveryStrategy(
        id="strat-b",
        disruption_id="D-001",
        name="Strategy B",
        badge="RECOMMENDED",
        type="Regional Reroute + Safety Stock",
        route="Via Corridor R3 (Pune Chakan Hub W2)",
        cost="₹72,000",
        cost_numeric=72000,
        delay_hours=24,
        delivery="+1 Day",
        risk="Low",
        is_recommended=True,
        composite_score=0.22
    )

    s_c = RecoveryStrategy(
        id="strat-c",
        disruption_id="D-001",
        name="Strategy C",
        type="Hybrid Multi-Modal (Rail/Road)",
        route="Via Coastal Corridor R5",
        cost="₹48,000",
        cost_numeric=48000,
        delay_hours=84,
        delivery="+5 Days",
        risk="High",
        is_recommended=False,
        composite_score=0.84
    )

    db.add_all([s_a, s_b, s_c])
    db.commit()

    # 3. Compliance Checks for Strategy B
    checks = [
        ComplianceCheck(
            id="c1",
            strategy_id="strat-b",
            title="Cold-chain satisfied",
            description="Logistics Agent confirmed active reefer temperature telemetry on Corridor R3.",
            passed=True,
            agent="Logistics Agent"
        ),
        ComplianceCheck(
            id="c2",
            strategy_id="strat-b",
            title="Safety stock maintained",
            description="Inventory Agent verified Warehouse W2 (Pune Chakan) post-withdrawal buffer level > 15%.",
            passed=True,
            agent="Inventory Agent"
        ),
        ComplianceCheck(
            id="c3",
            strategy_id="strat-b",
            title="Capacity available",
            description="Fleet coordinator confirmed slot allotment for 5 critical containers via Western Express bypass.",
            passed=True,
            agent="Logistics Agent"
        ),
        ComplianceCheck(
            id="c4",
            strategy_id="strat-b",
            title="Policy checks passed",
            description="Compliance Agent validated GST e-Way bills and Interstate SLA penalty indemnity.",
            passed=True,
            agent="Compliance Agent"
        )
    ]
    db.add_all(checks)

    # 4. Audit Log
    logs = [
        ("04:00Z", "Sensing Agent", "Disruption Detected (W1 Bhiwandi Outage on NH-48)", "normal"),
        ("04:05Z", "Orchestrator", "Impact Assessment Complete (5 shipments at risk)", "normal"),
        ("04:10Z", "AI Core", "Google OR-Tools MIP Solver Run Initialized", "normal"),
        ("04:12Z", "Financial Agent", "Strategy A Rejected: Cost ₹1,85,000 exceeds ₹1,00,000 budget cap", "rejected"),
        ("04:15Z", "Orchestrator", "Strategy B Identified as Multi-Objective Optimum", "optimal"),
        ("04:16Z", "Compliance Agent", "Constraint & SLA Check: Passed (GST e-Way valid)", "normal"),
        ("04:18Z", "Logistics Agent", "Reefer Capacity Confirmed on Corridor R3", "normal"),
        ("04:20Z", "Inventory Agent", "Buffer Stock Verified at W2 (Pune Chakan)", "normal"),
        ("04:22Z", "Risk Agent", "Residual Failure Probability Modeled at 8%", "normal"),
        ("CURRENT STATUS", "", "Pending Human Approval", "pending")
    ]

    for t, agent, action, st in logs:
        h = hashlib.sha256(f"{t}-{agent}-{action}".encode()).hexdigest()[:16]
        db.add(AuditLog(
            disruption_id="D-001",
            time=t,
            agent=agent,
            action=action,
            status=st,
            integrity_hash=f"0x{h}"
        ))

    db.commit()
    db.close()
    print("Database seeded with Indian supply chain operational data.")
