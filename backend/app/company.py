"""
Customer Enrollment, Authentication, Role-Based Workforce & Custom Network Engine
Only 1 reference demo company (Tata Motors CV) is pre-seeded.
All customer companies are registered fresh with clean workspaces and user-defined roles.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib
from sqlalchemy.orm import Session
from .models import Organization, User, CustomRole, UserSupplyChainNode, UserSupplyChainRoute

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

DEMO_ORG_ID = "tata-motors"

class CompanyEngine:
    def seed_demo_if_empty(self, db: Session):
        """Seeds strictly ONE benchmark reference demo organization."""
        demo_org = db.query(Organization).filter(Organization.id == DEMO_ORG_ID).first()
        if not demo_org:
            demo_org = Organization(
                id=DEMO_ORG_ID,
                name="Tata Motors CV (Western Corridor Benchmark)",
                industry="Automotive OEM & Commercial Vehicles",
                gstin="27AAACT0000A1Z5",
                headquarters="Pune / Mumbai, Maharashtra",
                is_demo=True,
                is_active=True
            )
            db.add(demo_org)
            db.commit()
        else:
            demo_org.name = "Tata Motors CV (Western Corridor Benchmark)"
            demo_org.is_demo = True
            db.commit()

        # Check if demo user exists
        demo_user = db.query(User).filter(User.id == "usr-demo-01").first()
        if not demo_user:
            demo_user = User(
                id="usr-demo-01",
                org_id=DEMO_ORG_ID,
                name="Aditya",
                email="aditya@tatamotors.com",
                password_hash=hash_pw("demo123"),
                role_title="VP Global Supply Chain",
                department="Executive Supply Chain",
                is_owner=True,
                status="ONLINE"
            )
            db.add(demo_user)
            db.commit()
        else:
            if demo_user.name != "Aditya":
                demo_user.name = "Aditya"
                demo_user.email = "aditya@tatamotors.com"
                db.commit()

        # Demo Team Member
        demo_user2 = db.query(User).filter(User.id == "usr-demo-02").first()
        if not demo_user2:
            demo_user2 = User(
                id="usr-demo-02",
                org_id=DEMO_ORG_ID,
                name="Pranath",
                email="pranath@tatamotors.com",
                password_hash=hash_pw("demo123"),
                role_title="Senior Logistics Planner",
                department="Corridor Logistics",
                is_owner=False,
                status="ONLINE"
            )
            db.add(demo_user2)
            db.commit()
        else:
            if demo_user2.name != "Pranath":
                demo_user2.name = "Pranath"
                demo_user2.email = "pranath@tatamotors.com"
                db.commit()

        # Predefined Demo Roles if missing
        if not db.query(CustomRole).filter(CustomRole.org_id == DEMO_ORG_ID).first():
            roles = [
                CustomRole(
                    id="role-demo-01",
                    org_id=DEMO_ORG_ID,
                    name="VP Global Supply Chain",
                    description="Full sign-off and enterprise dispatch authority",
                    can_approve=True,
                    can_tune_solver=True,
                    can_modify_buffer=True,
                    can_dispatch_eway=True,
                    can_manage_team=True
                ),
                CustomRole(
                    id="role-demo-02",
                    org_id=DEMO_ORG_ID,
                    name="Senior Logistics Planner",
                    description="Route optimization tuning and contingency analysis",
                    can_approve=False,
                    can_tune_solver=True,
                    can_modify_buffer=True,
                    can_dispatch_eway=False,
                    can_manage_team=False
                )
            ]
            for r in roles:
                db.add(r)
            db.commit()

        # Benchmark Supply Chain Nodes if missing
        if not db.query(UserSupplyChainNode).filter(UserSupplyChainNode.org_id == DEMO_ORG_ID).first():
            demo_nodes = [
                UserSupplyChainNode(id="node-w1", org_id=DEMO_ORG_ID, name="Bhiwandi Central DC", city="Mumbai Bhiwandi", pincode="421302", capacity_units=12000, safety_buffer_pct=25, status="Available"),
                UserSupplyChainNode(id="node-w2", org_id=DEMO_ORG_ID, name="Pune Chakan DC", city="Pune Chakan", pincode="410501", capacity_units=8500, safety_buffer_pct=40, status="Available"),
                UserSupplyChainNode(id="node-w3", org_id=DEMO_ORG_ID, name="Ahmedabad Sanand Hub", city="Ahmedabad Sanand", pincode="382110", capacity_units=6000, safety_buffer_pct=15, status="Critical"),
                UserSupplyChainNode(id="node-w4", org_id=DEMO_ORG_ID, name="Indore Outer Hub", city="Indore", pincode="452010", capacity_units=5000, safety_buffer_pct=30, status="Available")
            ]
            for n in demo_nodes:
                db.add(n)
            db.commit()

    def authenticate_user(self, db: Session, email: str, password: Optional[str] = None) -> Optional[Dict[str, Any]]:
        self.seed_demo_if_empty(db)
        user = db.query(User).filter(User.email.ilike(email.strip())).first()
        if not user:
            # If demo email shortcut
            if email in ["demo@tatamotors.com", "aditya@tatamotors.com"]:
                user = db.query(User).filter(User.id == "usr-demo-01").first()
            elif email in ["pranath@tatamotors.com", "p.deshmukh@tatamotors.com"]:
                user = db.query(User).filter(User.id == "usr-demo-02").first()
            else:
                return None

        # Verify password if supplied
        if password and user.password_hash != hash_pw(password):
            return None

        org = db.query(Organization).filter(Organization.id == user.org_id).first()
        roles = db.query(CustomRole).filter(CustomRole.org_id == user.org_id).all()

        return {
            "status": "success",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "roleTitle": user.role_title,
                "department": user.department,
                "isOwner": user.is_owner,
                "status": user.status
            },
            "organization": {
                "id": org.id,
                "name": org.name,
                "industry": org.industry,
                "gstin": org.gstin,
                "headquarters": org.headquarters,
                "isDemo": org.is_demo
            },
            "roles": [
                {
                    "id": r.id,
                    "name": r.name,
                    "description": r.description,
                    "canApprove": r.can_approve,
                    "canTuneSolver": r.can_tune_solver,
                    "canModifyBuffer": r.can_modify_buffer,
                    "canDispatchEway": r.can_dispatch_eway,
                    "canManageTeam": r.can_manage_team
                }
                for r in roles
            ]
        }

    def register_customer_company(
        self,
        db: Session,
        company_name: str,
        industry: str,
        gstin: str,
        headquarters: str,
        admin_name: str,
        admin_email: str,
        password: str,
        admin_title: str = "VP Supply Chain"
    ) -> Dict[str, Any]:
        """Enrolls a brand-new customer company with their own clean workspace and user-defined roles."""
        self.seed_demo_if_empty(db)

        # Check existing user
        existing_user = db.query(User).filter(User.email.ilike(admin_email.strip())).first()
        if existing_user:
            return {"status": "error", "message": f"An account with email '{admin_email}' already exists."}

        # Generate unique org ID
        clean_name = company_name.lower().replace(" ", "-").replace(".", "")[:25]
        org_id = f"cust-{clean_name}-{int(datetime.utcnow().timestamp()) % 10000}"

        # Create Organization
        new_org = Organization(
            id=org_id,
            name=company_name,
            industry=industry,
            gstin=gstin.upper().strip(),
            headquarters=headquarters,
            is_demo=False,
            is_active=True
        )
        db.add(new_org)

        # Create Owner User
        user_id = f"usr-{int(datetime.utcnow().timestamp())}"
        owner_user = User(
            id=user_id,
            org_id=org_id,
            name=admin_name,
            email=admin_email.strip().lower(),
            password_hash=hash_pw(password),
            role_title=admin_title,
            department="Executive Supply Chain",
            is_owner=True,
            status="ONLINE"
        )
        db.add(owner_user)

        # Create initial custom roles defined for this organization
        default_role = CustomRole(
            id=f"role-{int(datetime.utcnow().timestamp())}",
            org_id=org_id,
            name=admin_title,
            description="Organization Owner / Administrator (Full Authority)",
            can_approve=True,
            can_tune_solver=True,
            can_modify_buffer=True,
            can_dispatch_eway=True,
            can_manage_team=True
        )
        db.add(default_role)

        planner_role = CustomRole(
            id=f"role-{int(datetime.utcnow().timestamp()) + 1}",
            org_id=org_id,
            name="Logistics Operations Planner",
            description="Optimization solver tuning and buffer modification",
            can_approve=False,
            can_tune_solver=True,
            can_modify_buffer=True,
            can_dispatch_eway=False,
            can_manage_team=False
        )
        db.add(planner_role)

        db.commit()

        return self.authenticate_user(db, admin_email, password)

    def create_custom_role(
        self,
        db: Session,
        org_id: str,
        role_name: str,
        description: str,
        can_approve: bool,
        can_tune_solver: bool,
        can_modify_buffer: bool,
        can_dispatch_eway: bool,
        can_manage_team: bool
    ) -> Dict[str, Any]:
        """Allows the company owner/admin to create and define brand new roles."""
        role_id = f"role-{int(datetime.utcnow().timestamp())}"
        new_role = CustomRole(
            id=role_id,
            org_id=org_id,
            name=role_name,
            description=description,
            can_approve=can_approve,
            can_tune_solver=can_tune_solver,
            can_modify_buffer=can_modify_buffer,
            can_dispatch_eway=can_dispatch_eway,
            can_manage_team=can_manage_team
        )
        db.add(new_role)
        db.commit()
        return {
            "status": "success",
            "role": {
                "id": new_role.id,
                "name": new_role.name,
                "description": new_role.description,
                "canApprove": new_role.can_approve,
                "canTuneSolver": new_role.can_tune_solver,
                "canModifyBuffer": new_role.can_modify_buffer,
                "canDispatchEway": new_role.can_dispatch_eway,
                "canManageTeam": new_role.can_manage_team
            }
        }

    def invite_workforce_member(
        self,
        db: Session,
        org_id: str,
        name: str,
        email: str,
        role_title: str,
        department: str
    ) -> Dict[str, Any]:
        """Allows the company owner to invite a team member with their selected role."""
        existing = db.query(User).filter(User.email.ilike(email.strip())).first()
        if existing:
            return {"status": "error", "message": f"User with email '{email}' is already registered."}

        new_user = User(
            id=f"usr-{int(datetime.utcnow().timestamp())}",
            org_id=org_id,
            name=name,
            email=email.strip().lower(),
            password_hash=hash_pw("welcome123"), # Default onboarding password
            role_title=role_title,
            department=department or "Supply Chain Operations",
            is_owner=False,
            status="ONLINE"
        )
        db.add(new_user)
        db.commit()

        return {
            "status": "success",
            "message": f"Invited {name} as '{role_title}'.",
            "member": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "roleTitle": new_user.role_title,
                "department": new_user.department,
                "status": new_user.status
            }
        }

    def get_workforce_members(self, db: Session, org_id: str) -> List[Dict[str, Any]]:
        self.seed_demo_if_empty(db)
        users = db.query(User).filter(User.org_id == org_id).all()
        return [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "roleTitle": u.role_title,
                "department": u.department,
                "isOwner": u.is_owner,
                "status": u.status
            }
            for u in users
        ]

    def get_custom_roles(self, db: Session, org_id: str) -> List[Dict[str, Any]]:
        self.seed_demo_if_empty(db)
        roles = db.query(CustomRole).filter(CustomRole.org_id == org_id).all()
        return [
            {
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "canApprove": r.can_approve,
                "canTuneSolver": r.can_tune_solver,
                "canModifyBuffer": r.can_modify_buffer,
                "canDispatchEway": r.can_dispatch_eway,
                "canManageTeam": r.can_manage_team
            }
            for r in roles
        ]

    def get_network(self, db: Session, org_id: str) -> Dict[str, Any]:
        """Returns the custom company's DC nodes and corridors."""
        self.seed_demo_if_empty(db)
        nodes = db.query(UserSupplyChainNode).filter(UserSupplyChainNode.org_id == org_id).all()
        routes = db.query(UserSupplyChainRoute).filter(UserSupplyChainRoute.org_id == org_id).all()
        return {
            "nodes": [
                {
                    "id": n.id,
                    "name": n.name,
                    "city": n.city,
                    "pincode": n.pincode,
                    "address": n.address or f"{n.name}, {n.city} {n.pincode}",
                    "lat": n.lat,
                    "lng": n.lng,
                    "capacity": n.capacity_units,
                    "safetyBufferPct": n.safety_buffer_pct,
                    "status": n.status
                }
                for n in nodes
            ],
            "routes": [
                {
                    "id": r.id,
                    "routeCode": r.route_code,
                    "origin": r.origin_node,
                    "destination": r.destination_node,
                    "originAddress": r.origin_address or r.origin_node,
                    "destinationAddress": r.destination_address or r.destination_node,
                    "distanceKm": r.distance_km or (r.transit_hours * 45 if r.transit_hours else 450),
                    "waypoints": r.waypoints or "",
                    "transitHours": r.transit_hours,
                    "carrier": r.primary_carrier,
                    "status": r.status
                }
                for r in routes
            ]
        }

    def add_node(
        self,
        db: Session,
        org_id: str,
        name: str,
        city: str,
        pincode: str,
        capacity: int,
        safety_buffer: int,
        address: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None
    ) -> Dict[str, Any]:
        node_id = f"node-{int(datetime.utcnow().timestamp())}"
        new_node = UserSupplyChainNode(
            id=node_id,
            org_id=org_id,
            name=name,
            city=city,
            pincode=pincode,
            address=address or f"{name}, {city} {pincode}",
            lat=lat,
            lng=lng,
            capacity_units=capacity or 10000,
            safety_buffer_pct=safety_buffer or 25,
            status="Available"
        )
        db.add(new_node)
        db.commit()
        return {"status": "success", "nodeId": node_id}

    def add_route(
        self,
        db: Session,
        org_id: str,
        route_code: str,
        origin: str,
        destination: str,
        transit_hours: int,
        carrier: str,
        origin_address: Optional[str] = None,
        destination_address: Optional[str] = None,
        distance_km: Optional[int] = None,
        waypoints: Optional[str] = None
    ) -> Dict[str, Any]:
        route_id = f"route-{int(datetime.utcnow().timestamp())}"
        new_route = UserSupplyChainRoute(
            id=route_id,
            org_id=org_id,
            route_code=route_code,
            origin_node=origin,
            destination_node=destination,
            origin_address=origin_address or origin,
            destination_address=destination_address or destination,
            distance_km=distance_km or (transit_hours * 45 if transit_hours else 450),
            waypoints=waypoints or "",
            transit_hours=transit_hours or 24,
            primary_carrier=carrier or "Dedicated Fleet",
            status="Optimal"
        )
        db.add(new_route)
        db.commit()
        return {"status": "success", "routeId": route_id}

    def update_node(
        self,
        db: Session,
        node_id: str,
        name: Optional[str] = None,
        city: Optional[str] = None,
        pincode: Optional[str] = None,
        capacity: Optional[int] = None,
        safety_buffer: Optional[int] = None,
        status: Optional[str] = None,
        address: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None
    ) -> Dict[str, Any]:
        node = db.query(UserSupplyChainNode).filter(UserSupplyChainNode.id == node_id).first()
        if not node:
            return {"status": "error", "message": f"Node '{node_id}' not found."}
        if name is not None:
            node.name = name
        if city is not None:
            node.city = city
        if pincode is not None:
            node.pincode = pincode
        if capacity is not None:
            node.capacity_units = capacity
        if safety_buffer is not None:
            node.safety_buffer_pct = safety_buffer
        if status is not None:
            node.status = status
        if address is not None:
            node.address = address
        if lat is not None:
            node.lat = lat
        if lng is not None:
            node.lng = lng
        db.commit()
        return {"status": "success", "nodeId": node_id}

    def delete_node(self, db: Session, node_id: str) -> Dict[str, Any]:
        node = db.query(UserSupplyChainNode).filter(UserSupplyChainNode.id == node_id).first()
        if not node:
            return {"status": "error", "message": f"Node '{node_id}' not found."}
        db.delete(node)
        db.commit()
        return {"status": "success", "deletedNodeId": node_id}

    def update_route(
        self,
        db: Session,
        route_id: str,
        route_code: Optional[str] = None,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        transit_hours: Optional[int] = None,
        carrier: Optional[str] = None,
        origin_address: Optional[str] = None,
        destination_address: Optional[str] = None,
        distance_km: Optional[int] = None,
        waypoints: Optional[str] = None,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        route = db.query(UserSupplyChainRoute).filter(UserSupplyChainRoute.id == route_id).first()
        if not route:
            return {"status": "error", "message": f"Route '{route_id}' not found."}
        if route_code is not None:
            route.route_code = route_code
        if origin is not None:
            route.origin_node = origin
        if destination is not None:
            route.destination_node = destination
        if transit_hours is not None:
            route.transit_hours = transit_hours
        if carrier is not None:
            route.primary_carrier = carrier
        if origin_address is not None:
            route.origin_address = origin_address
        if destination_address is not None:
            route.destination_address = destination_address
        if distance_km is not None:
            route.distance_km = distance_km
        if waypoints is not None:
            route.waypoints = waypoints
        if status is not None:
            route.status = status
        db.commit()
        return {"status": "success", "routeId": route_id}

    def delete_route(self, db: Session, route_id: str) -> Dict[str, Any]:
        route = db.query(UserSupplyChainRoute).filter(UserSupplyChainRoute.id == route_id).first()
        if not route:
            return {"status": "error", "message": f"Route '{route_id}' not found."}
        db.delete(route)
        db.commit()
        return {"status": "success", "deletedRouteId": route_id}

    def get_all_organizations(self, db: Session) -> List[Dict[str, Any]]:
        self.seed_demo_if_empty(db)
        orgs = db.query(Organization).filter(Organization.is_active == True).all()
        return [
            {
                "id": o.id,
                "name": o.name,
                "industry": o.industry,
                "gstin": o.gstin,
                "headquarters": o.headquarters,
                "isDemo": bool(o.is_demo)
            }
            for o in orgs
        ]
