from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Disruption(Base):
    __tablename__ = "disruptions"

    id = Column(String(50), primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    route = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    impact = Column(String(100), nullable=False)
    time = Column(String(50), nullable=False)
    affected_route = Column(String(50), nullable=False)
    affected_shipments = Column(Integer, default=5)
    estimated_delay = Column(String(50), default="2 Days")
    stock_out_risk = Column(Integer, default=72)
    additional_cost = Column(String(50), default="₹85K")
    description = Column(Text, nullable=False)
    org_id = Column(String(50), nullable=True, default="tata-motors")
    created_at = Column(DateTime, default=datetime.utcnow)

    strategies = relationship("RecoveryStrategy", back_populates="disruption", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="disruption", cascade="all, delete-orphan")

class RecoveryStrategy(Base):
    __tablename__ = "recovery_strategies"

    id = Column(String(50), primary_key=True, index=True)
    disruption_id = Column(String(50), ForeignKey("disruptions.id"), nullable=False)
    name = Column(String(100), nullable=False)
    badge = Column(String(50), nullable=True)
    type = Column(String(100), nullable=False)
    route = Column(String(100), nullable=False)
    cost = Column(String(50), nullable=False)
    cost_numeric = Column(Float, nullable=False)
    delay_hours = Column(Integer, default=24)
    delivery = Column(String(50), nullable=False)
    risk = Column(String(20), nullable=False)
    is_recommended = Column(Boolean, default=False)
    composite_score = Column(Float, default=0.0)

    disruption = relationship("Disruption", back_populates="strategies")
    compliance_checks = relationship("ComplianceCheck", back_populates="strategy", cascade="all, delete-orphan")

class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    id = Column(String(50), primary_key=True, index=True)
    strategy_id = Column(String(50), ForeignKey("recovery_strategies.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    passed = Column(Boolean, default=True)
    agent = Column(String(50), nullable=False)

    strategy = relationship("RecoveryStrategy", back_populates="compliance_checks")

class ApprovalRecord(Base):
    __tablename__ = "approval_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(50), nullable=False, index=True)
    strategy_id = Column(String(50), nullable=False)
    decision = Column(String(20), nullable=False) # APPROVED | REJECTED | MODIFIED
    human_notes = Column(Text, nullable=True)
    timestamp = Column(String(50), nullable=False)
    dispatched = Column(Boolean, default=False)
    audit_signature = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    disruption_id = Column(String(50), ForeignKey("disruptions.id"), nullable=True)
    time = Column(String(50), nullable=False)
    agent = Column(String(50), nullable=False)
    action = Column(Text, nullable=False)
    status = Column(String(20), default="normal") # normal | optimal | rejected | pending
    integrity_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    disruption = relationship("Disruption", back_populates="audit_logs")


class DispatchRecord(Base):
    __tablename__ = "dispatch_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(50), nullable=False, index=True)
    strategy_id = Column(String(50), nullable=False)
    eway_bill_no = Column(String(50), nullable=False, unique=True)
    eway_bill_date = Column(String(50), nullable=False)
    valid_until = Column(String(50), nullable=False)
    consignor_name = Column(String(100), nullable=False)
    consignor_gstin = Column(String(20), nullable=False)
    consignee_name = Column(String(100), nullable=False)
    consignee_gstin = Column(String(20), nullable=False)
    origin_pincode = Column(String(10), nullable=False)
    dest_pincode = Column(String(10), nullable=False)
    hsn_code = Column(String(20), nullable=False)
    item_description = Column(String(200), nullable=False)
    invoice_value_inr = Column(Float, nullable=False)
    carrier_name = Column(String(100), nullable=False)
    carrier_transporter_id = Column(String(50), nullable=False)
    vehicle_no = Column(String(30), nullable=False)
    lr_awb_no = Column(String(50), nullable=False)
    route_corridor = Column(String(100), nullable=False)
    sap_doc_id = Column(String(50), nullable=False)
    sap_status = Column(String(50), nullable=False)
    qr_data = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    industry = Column(String(50), nullable=False)
    gstin = Column(String(20), nullable=False)
    headquarters = Column(String(100), nullable=False)
    is_demo = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    roles = relationship("CustomRole", back_populates="organization", cascade="all, delete-orphan")
    nodes = relationship("UserSupplyChainNode", back_populates="organization", cascade="all, delete-orphan")
    routes = relationship("UserSupplyChainRoute", back_populates="organization", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(100), nullable=False)
    role_title = Column(String(100), nullable=False)
    department = Column(String(100), default="Supply Chain Operations")
    is_owner = Column(Boolean, default=False)
    status = Column(String(20), default="ONLINE")
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")


class CustomRole(Base):
    __tablename__ = "custom_roles"

    id = Column(String(50), primary_key=True, index=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(200), default="")
    can_approve = Column(Boolean, default=True)
    can_tune_solver = Column(Boolean, default=True)
    can_modify_buffer = Column(Boolean, default=True)
    can_dispatch_eway = Column(Boolean, default=True)
    can_manage_team = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="roles")


class UserSupplyChainNode(Base):
    __tablename__ = "user_supply_chain_nodes"

    id = Column(String(50), primary_key=True, index=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(100), nullable=False)
    city = Column(String(50), nullable=False)
    pincode = Column(String(10), nullable=False)
    address = Column(String(255), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    capacity_units = Column(Integer, default=10000)
    safety_buffer_pct = Column(Integer, default=25)
    status = Column(String(50), default="Available")
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="nodes")


class UserSupplyChainRoute(Base):
    __tablename__ = "user_supply_chain_routes"

    id = Column(String(50), primary_key=True, index=True)
    org_id = Column(String(50), ForeignKey("organizations.id"), nullable=False)
    route_code = Column(String(50), nullable=False)
    origin_node = Column(String(100), nullable=False)
    destination_node = Column(String(100), nullable=False)
    origin_address = Column(String(255), nullable=True)
    destination_address = Column(String(255), nullable=True)
    distance_km = Column(Integer, nullable=True)
    waypoints = Column(Text, nullable=True)
    transit_hours = Column(Integer, default=24)
    primary_carrier = Column(String(100), default="Dedicated Fleet")
    status = Column(String(50), default="Optimal")
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="routes")
