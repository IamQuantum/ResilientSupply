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

    # 1. Northern Supply Chain Disruptions (Kharar, Ludhiana, Chandigarh, Delhi)
    d1 = Disruption(
        id="D-001",
        event_type="Route Blocked",
        route="R1 (NH-44)",
        severity="Critical",
        impact="5 shipments",
        time="10:31 AM",
        affected_route="R1 (NH-44 Ambala-Karnal GT Road Corridor)",
        affected_shipments=5,
        estimated_delay="2 Days",
        stock_out_risk=72,
        additional_cost="₹45K",
        description="Primary NH-44 arterial corridor compromised due to severe waterlogging and bridge maintenance near Ambala Cantt / Shambhu border. Immediate rerouting required to prevent supply gridlock between Kharar/Punjab and Delhi NCR."
    )

    d2 = Disruption(
        id="D-002",
        event_type="Toll Congestion",
        route="Shambhu-Ambala Toll",
        severity="High",
        impact="12 shipments",
        time="09:15 AM",
        affected_route="Shambhu Border Toll Plaza",
        affected_shipments=12,
        estimated_delay="18 Hours",
        stock_out_risk=48,
        additional_cost="₹32K",
        description="Heavy freight queue exceeding 4 km at Shambhu border FASTag lanes. Rerouting freight via Kharar-Banur-Tepla arterial expressway required."
    )

    d3 = Disruption(
        id="D-003",
        event_type="Weather Delay",
        route="R4 (Siswan-Baddi)",
        severity="Medium",
        impact="2 shipments",
        time="Yesterday",
        affected_route="Siswan Pass Hill Transit (HP Border)",
        affected_shipments=2,
        estimated_delay="8 Hours",
        stock_out_risk=20,
        additional_cost="₹18K",
        description="Dense seasonal fog advisory along Siswan transit pass slowing freight velocity between Kharar logistics hub and Baddi pharma industrial corridor."
    )

    db.add_all([d1, d2, d3])
    db.commit()

    # 2. Strategies for D-001
    s_a = RecoveryStrategy(
        id="strat-a",
        disruption_id="D-001",
        name="Strategy A",
        type="Air Freight Expedite (Over Budget)",
        route="Direct Air Cargo (IXC Chandigarh → DEL Terminal 3)",
        cost="₹1,45,000",
        cost_numeric=145000,
        delay_hours=8,
        delivery="+0.5 Days",
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
        route="Via Corridor R3 (Kharar-Banur-Tepla Bypass via Mohali Hub W2)",
        cost="₹38,000",
        cost_numeric=38000,
        delay_hours=14,
        delivery="+1 Day",
        risk="Low",
        is_recommended=True,
        composite_score=0.18
    )

    s_c = RecoveryStrategy(
        id="strat-c",
        disruption_id="D-001",
        name="Strategy C",
        type="Consolidated Rail Freight (Ludhiana DFC)",
        route="Via Ludhiana Dedicated Freight Corridor (Rail/Road)",
        cost="₹24,000",
        cost_numeric=24000,
        delay_hours=48,
        delivery="+2 Days",
        risk="Medium",
        is_recommended=False,
        composite_score=0.74
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
            description="Inventory Agent verified Warehouse W2 (Mohali / Chandigarh Hub) post-withdrawal buffer level > 25%.",
            passed=True,
            agent="Inventory Agent"
        ),
        ComplianceCheck(
            id="c3",
            strategy_id="strat-b",
            title="Capacity available",
            description="Fleet coordinator confirmed slot allotment for 5 critical containers via Banur-Tepla bypass.",
            passed=True,
            agent="Logistics Agent"
        ),
        ComplianceCheck(
            id="c4",
            strategy_id="strat-b",
            title="Policy checks passed",
            description="Compliance Agent validated Punjab/Haryana GST e-Way bills and Interstate SLA indemnity.",
            passed=True,
            agent="Compliance Agent"
        )
    ]
    db.add_all(checks)

    # 4. Audit Log
    logs = [
        ("04:00Z", "Sensing Agent", "Disruption Detected (W1 Kharar Central Hub on NH-44 Ambala Section)", "normal"),
        ("04:05Z", "Orchestrator", "Impact Assessment Complete (5 shipments at risk)", "normal"),
        ("04:10Z", "AI Core", "Google OR-Tools MIP Solver Run Initialized", "normal"),
        ("04:12Z", "Financial Agent", "Strategy A Rejected: Cost ₹1,45,000 exceeds ₹80,000 budget cap", "rejected"),
        ("04:15Z", "Orchestrator", "Strategy B Identified as Multi-Objective Optimum", "optimal"),
        ("04:16Z", "Compliance Agent", "Constraint & SLA Check: Passed (GST e-Way PB/HR valid)", "normal"),
        ("04:18Z", "Logistics Agent", "Reefer Capacity Confirmed on Banur-Tepla Bypass", "normal"),
        ("04:20Z", "Inventory Agent", "Buffer Stock Verified at W2 (Mohali / Chandigarh Hub)", "normal"),
        ("04:22Z", "Risk Agent", "Residual Failure Probability Modeled at 6%", "normal"),
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
    print("Database seeded with Northern India (Kharar/Ludhiana/Chandigarh/Delhi) operational data.")
