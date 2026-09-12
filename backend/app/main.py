from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from sqlalchemy.orm import Session
import hashlib

from .database import get_db, Base, engine
from .models import Disruption, RecoveryStrategy, ComplianceCheck, ApprovalRecord, AuditLog, DispatchRecord, Organization, User, CustomRole, UserSupplyChainNode, UserSupplyChainRoute
from .seed import seed_database
from .agents import MultiAgentOrchestrator
from .document_parser import DocumentParserEngine
from .policy_rag import PolicyRAGEngine
from .telemetry import TelemetryEngine
from .dispatch import DispatchEngine
from .company import CompanyEngine

app = FastAPI(
    title="ResilientChain AI Backend (India Logistics & GenAI Edition)",
    description="Deterministic Optimization & Multi-Agent Supply Chain Engine backed by SQLite & Gemini 2.5 Flash",
    version="0.3.0"
)

# Seed and initialize the database on startup
@app.on_event("startup")
def on_startup():
    seed_database()

# Enable CORS for the local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = MultiAgentOrchestrator()
doc_parser = DocumentParserEngine()
policy_rag = PolicyRAGEngine()
telemetry_engine = TelemetryEngine()
dispatch_engine = DispatchEngine()
company_engine = CompanyEngine()

class OptimizationRequest(BaseModel):
    disruptionId: str = "D-001"
    routeBlocked: str = "R1 (NH-48)"
    orgId: Optional[str] = None
    customParams: Optional[Dict[str, Any]] = None
    weights: Optional[Dict[str, float]] = {
        "delivery": 0.4,
        "cost": 0.3,
        "inventory": 0.2,
        "compliance": 0.1
    }

class CustomDisruptionRequest(BaseModel):
    orgId: str
    routeCode: str
    origin: str
    destination: str
    facilityName: Optional[str] = "Regional Logistics DC"
    eventType: str = "National Highway Flooding & Bridge Outage"
    severity: str = "Critical"
    affectedShipments: int = 6
    estimatedDelay: str = "24 Hours"
    stockOutRisk: Union[int, str] = 68
    additionalCost: Union[str, int, float] = "₹78,000"
    carrier: Optional[str] = "Dedicated Fleet"
    description: Optional[str] = None

class DocumentParseRequest(BaseModel):
    documentText: str
    cargoType: Optional[str] = "Pharma & Auto Tier-1"

class ApprovalRequest(BaseModel):
    strategyId: str
    decision: str # APPROVED | REJECTED | MODIFIED
    humanNotes: Optional[str] = None
    modifiedBufferPct: Optional[int] = None
    carrierOverride: Optional[str] = None

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ResilientChain AI Core Engine (India)",
        "database": "SQLite (resilient_chain.db) Connected",
        "engine": "Google OR-Tools + NetworkX + Multi-Agent Orchestration",
        "genaiModel": "Gemini 2.5 Flash (google-genai SDK Active)"
    }

@app.get("/api/disruptions")
def get_disruptions(org_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Disruption)
    if org_id and org_id != "tata-motors":
        disruptions = query.filter(
            (Disruption.org_id == org_id) | (Disruption.org_id == "tata-motors") | (Disruption.org_id == None)
        ).order_by(Disruption.created_at.desc()).all()
    else:
        disruptions = query.order_by(Disruption.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "eventType": d.event_type,
            "route": d.route,
            "severity": d.severity,
            "impact": d.impact,
            "time": d.time,
            "affectedRoute": d.affected_route,
            "affectedShipments": d.affected_shipments,
            "estimatedDelay": d.estimated_delay,
            "stockOutRisk": d.stock_out_risk,
            "additionalCost": d.additional_cost,
            "description": d.description,
            "timeline": [
                {
                    "title": "Incident Detected by Telematics",
                    "description": d.description or f"Outage reported along {d.affected_route or d.route}",
                    "time": d.time or "T-0h"
                },
                {
                    "title": "OR-Tools Solver Evaluated",
                    "description": "Automated multi-echelon contingency optimization calculated",
                    "time": "T+5m"
                }
            ]
        }
        for d in disruptions
    ]

@app.post("/api/disruptions/custom")
def inject_custom_disruption(req: CustomDisruptionRequest, db: Session = Depends(get_db)):
    """
    Enables newly enrolled customers to inject and simulate disruption events
    on their own registered freight lanes and DC facilities.
    """
    disruption_id = f"CUST-{int(datetime.utcnow().timestamp()) % 10000}"
    desc = req.description or (
        f"Critical disruption reported on corridor {req.routeCode} between {req.origin} and {req.destination}. "
        f"{req.eventType} causing transit halt. {req.affectedShipments} high-priority shipments immobilized."
    )

    try:
        clean_stock = str(req.stockOutRisk).replace("%", "").strip()
        stock_risk_int = int(clean_stock)
    except Exception:
        stock_risk_int = 75

    cost_str = str(req.additionalCost)
    if not cost_str.startswith("₹") and not cost_str.startswith("Rs"):
        try:
            val = float(cost_str)
            cost_str = f"₹{val:,.0f}" if val >= 1000 else f"₹{val:.0f}"
        except Exception:
            cost_str = f"₹{cost_str}"

    new_disruption = Disruption(
        id=disruption_id,
        event_type=req.eventType,
        route=req.routeCode,
        severity=req.severity,
        impact=f"{req.affectedShipments} shipments",
        time=datetime.utcnow().strftime("%I:%M %p"),
        affected_route=f"{req.routeCode} ({req.origin} → {req.destination})",
        affected_shipments=req.affectedShipments,
        estimated_delay=req.estimatedDelay,
        stock_out_risk=stock_risk_int,
        additional_cost=cost_str,
        description=desc,
        org_id=req.orgId
    )
    db.add(new_disruption)
    db.commit()

    custom_params = {
        "eventType": req.eventType,
        "origin": req.origin,
        "destination": req.destination,
        "facilityName": req.facilityName or "Regional Logistics DC",
        "carrier": req.carrier or "Dedicated Fleet",
        "affectedShipments": req.affectedShipments,
        "stockOutRisk": req.stockOutRisk,
        "estimatedDelay": req.estimatedDelay
    }

    solver_res = orchestrator.run_disruption_pipeline(
        disruption_id=disruption_id,
        route_blocked=req.routeCode,
        custom_params=custom_params
    )

    return {
        "status": "success",
        "disruption": {
            "id": new_disruption.id,
            "eventType": new_disruption.event_type,
            "route": new_disruption.route,
            "severity": new_disruption.severity,
            "impact": new_disruption.impact,
            "time": new_disruption.time,
            "affectedRoute": new_disruption.affected_route,
            "affectedShipments": new_disruption.affected_shipments,
            "estimatedDelay": new_disruption.estimated_delay,
            "stockOutRisk": new_disruption.stock_out_risk,
            "additionalCost": new_disruption.additional_cost,
            "description": new_disruption.description,
            "timeline": [
                {
                    "title": "Incident Injected by Operator",
                    "description": desc,
                    "time": "Just now"
                }
            ]
        },
        "solverStrategies": solver_res["strategies"],
        "recommendedStrategy": solver_res["recommendedStrategy"],
        "aiRationale": solver_res["aiRationale"],
        "auditTrail": solver_res["auditTrail"]
    }


@app.get("/api/policies")
def get_sla_policies():
    """Retrieves indexed customer SLA and contract policies from the RAG store."""
    return policy_rag.documents

@app.post("/api/documents/parse")
def parse_unstructured_document(req: DocumentParseRequest, db: Session = Depends(get_db)):
    """
    Phase 2 GenAI Pipeline:
    1. Extracts structured incident parameters using Gemini 2.5 Flash.
    2. Inserts new disruption record into SQLite database.
    3. Queries Policy RAG for contractual SLA clauses.
    4. Triggers deterministic OR-Tools solver to rank recovery strategies.
    """
    extracted = doc_parser.parse_document(req.documentText)

    # Check if disruption already exists, or insert
    existing = db.query(Disruption).filter(Disruption.id == extracted["id"]).first()
    if not existing:
        new_d = Disruption(
            id=extracted["id"],
            event_type=extracted["eventType"],
            route=extracted["route"],
            severity=extracted["severity"],
            impact=f"{extracted['affectedShipments']} shipments",
            time=datetime.utcnow().strftime("%H:%M AM"),
            affected_route=extracted["affectedRoute"],
            affected_shipments=extracted["affectedShipments"],
            estimated_delay=extracted["estimatedDelay"],
            stock_out_risk=extracted["stockOutRisk"],
            additional_cost=extracted["additionalCost"],
            description=extracted["description"]
        )
        db.add(new_d)
        db.commit()

    # Query Policy RAG
    matched_policies = policy_rag.query_relevant_policies(
        query=f"{extracted['eventType']} {extracted['route']} {extracted['affectedRoute']}",
        cargo_type=req.cargoType or ""
    )

    # Run Solver optimization
    solver_results = orchestrator.run_disruption_pipeline(
        disruption_id=extracted["id"],
        route_blocked=extracted["route"]
    )

    return {
        "status": "success",
        "extractedDisruption": extracted,
        "matchedSLAPolicies": matched_policies,
        "solverStrategies": solver_results["strategies"],
        "recommendedStrategy": solver_results["recommendedStrategy"],
        "aiRationale": solver_results["aiRationale"],
        "auditTrail": solver_results["auditTrail"]
    }

@app.get("/api/audit-trail")
def get_audit_trail(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    return [
        {
            "id": l.id,
            "time": l.time,
            "agent": l.agent,
            "action": l.action,
            "status": l.status,
            "integrityHash": l.integrity_hash
        }
        for l in logs
    ]

@app.post("/api/optimize")
def run_recovery_optimizer(request: OptimizationRequest, db: Session = Depends(get_db)):
    result = orchestrator.run_disruption_pipeline(
        disruption_id=request.disruptionId,
        route_blocked=request.routeBlocked,
        weights=request.weights
    )
    return result

@app.post("/api/approvals/{incident_id}")
def record_approval(incident_id: str, payload: ApprovalRequest, db: Session = Depends(get_db)):
    timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    raw_sig = f"{incident_id}-{payload.strategyId}-{payload.decision}-{timestamp_str}"
    signature = f"0x{hashlib.sha256(raw_sig.encode()).hexdigest()[:16]}"

    record = ApprovalRecord(
        incident_id=incident_id,
        strategy_id=payload.strategyId,
        decision=payload.decision,
        human_notes=payload.humanNotes or (
            f"Buffer drawdown set to {payload.modifiedBufferPct}%" if payload.modifiedBufferPct else "Standard approval"
        ),
        timestamp=timestamp_str,
        dispatched=(payload.decision == "APPROVED"),
        audit_signature=signature
    )
    db.add(record)

    action_text = (
        f"Human Planner Action: {payload.decision} for Strategy {payload.strategyId} "
        f"(Carrier: {payload.carrierOverride or 'R3 Dedicated Fleet'}, Signature: {signature})"
    )
    db.add(AuditLog(
        disruption_id=incident_id,
        time=datetime.utcnow().strftime("%H:%MZ"),
        agent="Human Logistics Director",
        action=action_text,
        status="optimal" if payload.decision == "APPROVED" else "rejected",
        integrity_hash=signature
    ))
    db.commit()

    dispatch_info = None
    if payload.decision in ["APPROVED", "MODIFIED"]:
        dispatch_info = dispatch_engine.generate_eway_bill(
            db=db,
            incident_id=incident_id,
            strategy_id=payload.strategyId,
            carrier_name=payload.carrierOverride or "TCI Express",
            notes=payload.humanNotes
        )

    return {
        "status": "success",
        "incidentId": incident_id,
        "strategyId": payload.strategyId,
        "decision": payload.decision,
        "timestamp": timestamp_str,
        "dispatched": payload.decision == "APPROVED",
        "auditSignature": signature,
        "dispatchInfo": dispatch_info
    }

class EWayBillRequest(BaseModel):
    incidentId: str
    strategyId: str
    carrierName: Optional[str] = "TCI Express"
    vehicleNo: Optional[str] = None
    notes: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

class RegisterCustomerCompanyRequest(BaseModel):
    companyName: str
    industry: str = "Automotive & Manufacturing"
    gstin: str
    headquarters: str
    adminName: str
    adminEmail: str
    password: str
    adminTitle: str = "VP Supply Chain"

class CreateRoleRequest(BaseModel):
    orgId: str
    roleName: str
    description: Optional[str] = ""
    canApprove: bool = True
    canTuneSolver: bool = True
    canModifyBuffer: bool = True
    canDispatchEway: bool = True
    canManageTeam: bool = False

class InviteWorkforceRequest(BaseModel):
    orgId: str
    name: str
    email: str
    roleTitle: str
    department: Optional[str] = "Supply Chain Operations"

class AddNodeRequest(BaseModel):
    orgId: str
    name: str
    city: str
    pincode: str
    capacity: Optional[int] = 10000
    safetyBuffer: Optional[int] = 25
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class AddRouteRequest(BaseModel):
    orgId: str
    routeCode: str
    origin: str
    destination: str
    transitHours: Optional[int] = 24
    carrier: Optional[str] = "Dedicated Fleet"
    originAddress: Optional[str] = None
    destinationAddress: Optional[str] = None
    distanceKm: Optional[int] = None
    waypoints: Optional[str] = None

class UpdateNodeRequest(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    capacity: Optional[int] = None
    safetyBuffer: Optional[int] = None
    status: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class UpdateRouteRequest(BaseModel):
    routeCode: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    transitHours: Optional[int] = None
    carrier: Optional[str] = None
    originAddress: Optional[str] = None
    destinationAddress: Optional[str] = None
    distanceKm: Optional[int] = None
    waypoints: Optional[str] = None
    status: Optional[str] = None


# --- Phase 3 Enterprise Dispatch Endpoints ---
@app.post("/api/dispatch/generate")
def generate_dispatch(req: EWayBillRequest, db: Session = Depends(get_db)):
    """Generates official Indian GST e-Way Bill, 3PL carrier booking, and SAP S/4HANA OData sync."""
    result = dispatch_engine.generate_eway_bill(
        db=db,
        incident_id=req.incidentId,
        strategy_id=req.strategyId,
        carrier_name=req.carrierName or "TCI Express",
        vehicle_no=req.vehicleNo,
        notes=req.notes
    )
    return result

@app.get("/api/dispatch/{incident_id}")
def get_dispatch_details(incident_id: str, db: Session = Depends(get_db)):
    """Retrieves generated GST e-Way Bill and carrier dispatch certificate for an incident."""
    res = dispatch_engine.get_dispatch_record(db=db, incident_id=incident_id)
    if not res:
        raise HTTPException(status_code=404, detail="No dispatch record found for this incident")
    return res

# --- Customer Authentication & Enrollment Endpoints ---
@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    auth = company_engine.authenticate_user(db=db, email=req.email, password=req.password)
    if not auth:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return auth

@app.get("/api/auth/demo")
def get_demo_session(db: Session = Depends(get_db)):
    """Convenience endpoint to load the single Tata Motors CV demo benchmark."""
    auth = company_engine.authenticate_user(db=db, email="demo@tatamotors.com", password=None)
    return auth

@app.get("/api/companies")
def get_companies(db: Session = Depends(get_db)):
    """Lists registered organizations."""
    return company_engine.get_all_organizations(db=db)

@app.post("/api/auth/register-company")
def register_customer_company(req: RegisterCustomerCompanyRequest, db: Session = Depends(get_db)):
    """Enrolls a brand-new customer company with their own clean workspace and user-defined roles."""
    res = company_engine.register_customer_company(
        db=db,
        company_name=req.companyName,
        industry=req.industry,
        gstin=req.gstin,
        headquarters=req.headquarters,
        admin_name=req.adminName,
        admin_email=req.adminEmail,
        password=req.password,
        admin_title=req.adminTitle
    )
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

# --- User-Created Custom Roles & Governance ---
@app.get("/api/roles/{org_id}")
def get_org_roles(org_id: str, db: Session = Depends(get_db)):
    return company_engine.get_custom_roles(db=db, org_id=org_id)

@app.post("/api/roles")
def create_role(req: CreateRoleRequest, db: Session = Depends(get_db)):
    """Allows company owner/admin to create and define custom roles."""
    return company_engine.create_custom_role(
        db=db,
        org_id=req.orgId,
        role_name=req.roleName,
        description=req.description or "",
        can_approve=req.canApprove,
        can_tune_solver=req.canTuneSolver,
        can_modify_buffer=req.canModifyBuffer,
        can_dispatch_eway=req.canDispatchEway,
        can_manage_team=req.canManageTeam
    )

# --- Workforce Management ---
@app.get("/api/workforce/{org_id}")
def get_workforce(org_id: str, db: Session = Depends(get_db)):
    return company_engine.get_workforce_members(db=db, org_id=org_id)

@app.post("/api/workforce/invite")
def invite_workforce(req: InviteWorkforceRequest, db: Session = Depends(get_db)):
    res = company_engine.invite_workforce_member(
        db=db,
        org_id=req.orgId,
        name=req.name,
        email=req.email,
        role_title=req.roleTitle,
        department=req.department or "Supply Chain Operations"
    )
    if res.get("status") == "error":
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

# --- Customer Network (DCs & Routes) ---
@app.get("/api/network/{org_id}")
def get_company_network(org_id: str, db: Session = Depends(get_db)):
    return company_engine.get_network(db=db, org_id=org_id)

@app.post("/api/network/nodes")
def add_company_node(req: AddNodeRequest, db: Session = Depends(get_db)):
    return company_engine.add_node(
        db=db,
        org_id=req.orgId,
        name=req.name,
        city=req.city,
        pincode=req.pincode,
        capacity=req.capacity or 10000,
        safety_buffer=req.safetyBuffer or 25,
        address=req.address,
        lat=req.lat,
        lng=req.lng
    )

@app.post("/api/network/routes")
def add_company_route(req: AddRouteRequest, db: Session = Depends(get_db)):
    return company_engine.add_route(
        db=db,
        org_id=req.orgId,
        route_code=req.routeCode,
        origin=req.origin,
        destination=req.destination,
        transit_hours=req.transitHours or 24,
        carrier=req.carrier or "Dedicated Fleet",
        origin_address=req.originAddress,
        destination_address=req.destinationAddress,
        distance_km=req.distanceKm,
        waypoints=req.waypoints
    )

@app.put("/api/network/nodes/{node_id}")
def update_company_node(node_id: str, req: UpdateNodeRequest, db: Session = Depends(get_db)):
    res = company_engine.update_node(
        db=db,
        node_id=node_id,
        name=req.name,
        city=req.city,
        pincode=req.pincode,
        capacity=req.capacity,
        safety_buffer=req.safetyBuffer,
        status=req.status,
        address=req.address,
        lat=req.lat,
        lng=req.lng
    )
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res

@app.delete("/api/network/nodes/{node_id}")
def delete_company_node(node_id: str, db: Session = Depends(get_db)):
    res = company_engine.delete_node(db=db, node_id=node_id)
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res

@app.put("/api/network/routes/{route_id}")
def update_company_route(route_id: str, req: UpdateRouteRequest, db: Session = Depends(get_db)):
    res = company_engine.update_route(
        db=db,
        route_id=route_id,
        route_code=req.routeCode,
        origin=req.origin,
        destination=req.destination,
        transit_hours=req.transitHours,
        carrier=req.carrier,
        origin_address=req.originAddress,
        destination_address=req.destinationAddress,
        distance_km=req.distanceKm,
        waypoints=req.waypoints,
        status=req.status
    )
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res

@app.delete("/api/network/routes/{route_id}")
def delete_company_route(route_id: str, db: Session = Depends(get_db)):
    res = company_engine.delete_route(db=db, route_id=route_id)
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res


class TelemetrySimRequest(BaseModel):
    eventType: str = "FLASH_FLOOD" # FLASH_FLOOD | REEFER_EXCURSION | RECOVER_NH48

@app.get("/api/telemetry/fleet")
def get_fleet_telematics():
    """Returns live IoT GPS telematics from commercial fleet in transit."""
    return telemetry_engine.get_fleet_telematics()

@app.get("/api/telemetry/environmental")
def get_environmental_sensors():
    """Returns real-time radar and port gate sensory readings."""
    return telemetry_engine.get_environmental_sensors()

@app.get("/api/telemetry/anomalies")
def get_telemetry_anomalies():
    """Scans telematics and returns any automated anomaly detections."""
    return telemetry_engine.run_anomaly_check()

@app.post("/api/telemetry/simulate")
def simulate_telemetry_event(req: TelemetrySimRequest):
    """Simulates a sensor spike or environmental shift."""
    return telemetry_engine.simulate_telemetry_event(req.eventType)


class DriverTelemetryRequest(BaseModel):
    driverId: Optional[str] = "Field Driver"
    truckId: str = "DRV-MOBILE-GPS"
    lat: float
    lng: float
    speedKmh: float = 0.0
    dutyStatus: str = "ON_DUTY_DRIVING"
    batteryPct: int = 100
    heading: float = 0.0
    isPhoneGps: bool = True

class DriverDutyRequest(BaseModel):
    truckId: str = "DRV-MOBILE-GPS"
    dutyStatus: str = "ON_DUTY_DRIVING"
    breakMinutes: int = 0

class DriverEmergencyRequest(BaseModel):
    truckId: str = "DRV-MOBILE-GPS"
    emergencyType: str = "HIGHWAY_BLOCKAGE"
    message: str = "Emergency roadside disruption"
    lat: float
    lng: float

@app.post("/api/driver/telemetry")
def update_driver_telemetry(req: DriverTelemetryRequest):
    """Ingests live GPS and telematics directly from driver mobile phone app."""
    return telemetry_engine.update_driver_telemetry(
        driver_id=req.driverId or "Field Driver",
        truck_id=req.truckId,
        lat=req.lat,
        lng=req.lng,
        speed_kmh=req.speedKmh,
        duty_status=req.dutyStatus,
        battery_pct=req.batteryPct,
        heading=req.heading,
        is_phone_gps=req.isPhoneGps
    )

@app.post("/api/driver/duty")
def set_driver_duty(req: DriverDutyRequest):
    """Updates driver duty clock (driving, rest break, DC loading)."""
    return telemetry_engine.set_driver_duty(
        truck_id=req.truckId,
        duty_status=req.dutyStatus,
        break_minutes=req.breakMinutes
    )

@app.post("/api/driver/emergency")
def report_driver_emergency(req: DriverEmergencyRequest, db: Session = Depends(get_db)):
    """Triggers emergency SOS broadcast from driver phone and flags incident."""
    res = telemetry_engine.report_driver_emergency(
        truck_id=req.truckId,
        emergency_type=req.emergencyType,
        message=req.message,
        lat=req.lat,
        lng=req.lng
    )
    return res

class DriverMessageRequest(BaseModel):
    truckId: str = "MH-04-GP-8821"
    sender: str = "Rameshwar Yadav"
    role: Optional[str] = "driver"
    text: str

class DriverInspectionRequest(BaseModel):
    truckId: str = "MH-04-GP-8821"
    driverName: str = "Rameshwar Yadav"
    odometer: Optional[int] = 42810
    tyresOk: bool = True
    brakesOk: bool = True
    reeferOk: bool = True
    fluidsOk: bool = True
    lightsOk: bool = True
    notes: Optional[str] = None

@app.get("/api/system/host-info")
def get_host_info():
    """Returns the local network IP and port for mobile pairing via QR code."""
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        local_ip = s.getsockname()[0]
    except Exception:
        local_ip = '127.0.0.1'
    finally:
        s.close()
    return {
        "localIp": local_ip,
        "frontendPort": 5173,
        "backendPort": 8000,
        "driverAppUrl": f"http://{local_ip}:5173/driver"
    }

@app.get("/api/driver/trip/{truck_id}")
def get_driver_trip(truck_id: str):
    """Returns active trip waypoints, e-way bill data, hazard warnings, and dispatch messages."""
    return telemetry_engine.get_trip_details(truck_id=truck_id)

@app.get("/api/driver/messages/{truck_id}")
def get_driver_messages(truck_id: str):
    """Retrieves two-way dispatch messages between HQ and driver."""
    return telemetry_engine.get_driver_messages(truck_id=truck_id)

@app.post("/api/driver/message")
def send_driver_message(req: DriverMessageRequest):
    """Sends a message from driver to HQ dispatch or vice versa."""
    return telemetry_engine.add_driver_message(
        truck_id=req.truckId,
        sender=req.sender,
        role=req.role or "driver",
        text=req.text
    )

@app.post("/api/driver/inspection")
def submit_driver_inspection(req: DriverInspectionRequest):
    """Submits pre-trip vehicle safety inspection checklist."""
    return telemetry_engine.submit_inspection(
        truck_id=req.truckId,
        data=req.model_dump()
    )



