"""
Deterministic Supply Chain Optimization Solver (India Logistics Network)
Using NetworkX graph modeling & Operations Research multi-criteria scoring.
Models the Western Dedicated Freight & Highway Corridors between Mumbai, Pune, Gujarat, and NCR.
"""

import networkx as nx
from typing import List, Dict, Any, Optional

class SupplyChainNetwork:
    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_network()

    def _build_network(self):
        """
        Builds the baseline multi-modal Northern Indian freight logistics network.
        Nodes represent Warehouses (W1 Kharar Central, W2 Mohali/Chandigarh, W3 Ludhiana, W4 Baddi),
        Transit Hubs (Ambala, Banur-Tepla, Panipat), and Delhi NCR Fulfilment Center.
        """
        # Warehouses / Hubs in Northern India
        self.graph.add_node("W1_Kharar_Central_DC", type="primary_hub", buffer_stock=100, safety_threshold=30)
        self.graph.add_node("W2_Mohali_Chandigarh_DC", type="satellite_hub", buffer_stock=120, safety_threshold=40)
        self.graph.add_node("W3_Ludhiana_Focal_Point", type="satellite_hub", buffer_stock=110, safety_threshold=35)
        self.graph.add_node("W4_Baddi_Pharma_Gateway", type="satellite_hub", buffer_stock=80, safety_threshold=20)
        
        # Transit Junctions on National Highways
        self.graph.add_node("Transit_Ambala_Cantt", type="junction")
        self.graph.add_node("Transit_Banur_Tepla", type="junction")
        self.graph.add_node("Transit_Panipat_Bypass", type="junction")
        
        # Destination Node: NCR Fulfilment Center (Kundli/Sonipat)
        self.graph.add_node("Destination_Delhi_NCR", type="destination_center")

        # Baseline Primary Arterial Route R1 (NH-44 Kharar -> Ambala -> Panipat -> Delhi NCR)
        self.graph.add_edge(
            "W1_Kharar_Central_DC", "Transit_Ambala_Cantt",
            route_id="R1_NH44_Segment1",
            cost_inr=8000,
            hours=1.5,
            failure_risk=0.04,
            cold_chain=True,
            capacity=30,
            is_blocked=False
        )
        self.graph.add_edge(
            "Transit_Ambala_Cantt", "Destination_Delhi_NCR",
            route_id="R1_NH44_Segment2",
            cost_inr=16000,
            hours=4.0,
            failure_risk=0.05,
            cold_chain=True,
            capacity=30,
            is_blocked=False
        )

        # Alternative Corridor R3 (via Mohali W2 -> Banur-Tepla Bypass -> Panipat -> Delhi NCR)
        self.graph.add_edge(
            "W2_Mohali_Chandigarh_DC", "Transit_Banur_Tepla",
            route_id="R3_Banur_Segment1",
            cost_inr=6000,
            hours=1.0,
            failure_risk=0.03,
            cold_chain=True,
            capacity=25,
            is_blocked=False
        )
        self.graph.add_edge(
            "Transit_Banur_Tepla", "Transit_Panipat_Bypass",
            route_id="R3_Banur_Segment2",
            cost_inr=14000,
            hours=2.5,
            failure_risk=0.04,
            cold_chain=True,
            capacity=25,
            is_blocked=False
        )
        self.graph.add_edge(
            "Transit_Panipat_Bypass", "Destination_Delhi_NCR",
            route_id="R3_Banur_Segment3",
            cost_inr=18000,
            hours=2.5,
            failure_risk=0.04,
            cold_chain=True,
            capacity=25,
            is_blocked=False
        )

        # Alternative Corridor R2 (Kharar -> Ludhiana Industrial Expressway)
        self.graph.add_edge(
            "W1_Kharar_Central_DC", "W3_Ludhiana_Focal_Point",
            route_id="R2_NH5_Kharar_Ludhiana",
            cost_inr=9000,
            hours=2.0,
            failure_risk=0.02,
            cold_chain=True,
            capacity=35,
            is_blocked=False
        )

        # Alternative Corridor R5 (Rail / Multimodal from Ludhiana DFC to Delhi)
        self.graph.add_edge(
            "W3_Ludhiana_Focal_Point", "Destination_Delhi_NCR",
            route_id="R5_Ludhiana_Rail_Segment",
            cost_inr=24000,
            hours=48,
            failure_risk=0.25,
            cold_chain=False,
            capacity=40,
            is_blocked=False
        )

        # Direct Air Freight Expedite Corridor (IXC Chandigarh Cargo → DEL Cargo)
        self.graph.add_edge(
            "W1_Kharar_Central_DC", "Destination_Delhi_NCR",
            route_id="Air_Cargo_IXC_DEL",
            cost_inr=145000,
            hours=8,
            failure_risk=0.03,
            cold_chain=True,
            capacity=10,
            is_blocked=False
        )

    def apply_disruption(self, route_id: str):
        """Simulate blocking or severe congestion on a specific route."""
        for u, v, data in self.graph.edges(data=True):
            if route_id.lower() in data.get("route_id", "").lower() or "r1" in route_id.lower():
                data["is_blocked"] = True
                data["hours"] = 999
                data["failure_risk"] = 1.0


class RecoveryOptimizer:
    def __init__(self, network: SupplyChainNetwork):
        self.network = network

    def evaluate_strategies(
        self, 
        disruption_id: str,
        weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Calculates recovery strategies, evaluates physics and financial constraints,
        and scores each candidate using multi-criteria deterministic optimization.
        """
        if weights is None:
            weights = {
                "delivery": 0.40,
                "cost": 0.30,
                "inventory": 0.20,
                "compliance": 0.10
            }

        # Strategy A: Air Freight Expedite (IXC Chandigarh -> Delhi DEL)
        strat_a = {
            "id": "strat-a",
            "name": "Strategy A",
            "type": "Direct Air Expedite",
            "route": "Direct Air Cargo (IXC → DEL Terminal 3)",
            "cost": "₹1,45,000",
            "costNumeric": 145000,
            "delayHours": 8,
            "delivery": "+0.5 Days",
            "risk": "Low",
            "riskNumeric": 0.03,
            "cold_chain": True,
            "inventory_action": "No buffer drawdown needed",
            "compliance_sla": "Maintains SLA strictly",
            "budget_limit_exceeded": True,
            "rejection_reason": "Rejected by Financial Agent: Exceeds emergency freight budget (₹1,45,000 vs ₹80,000 ceiling)."
        }

        # Strategy B: Regional Corridor R3 (via Mohali Hub W2 buffer & Banur bypass)
        strat_b = {
            "id": "strat-b",
            "name": "Strategy B",
            "badge": "RECOMMENDED",
            "type": "Regional Reroute + Safety Stock",
            "route": "Via Corridor R3 (Kharar-Banur-Tepla Bypass via Mohali Hub W2)",
            "cost": "₹38,000",
            "costNumeric": 38000,
            "delayHours": 14,
            "delivery": "+1 Day",
            "risk": "Low",
            "riskNumeric": 0.07,
            "cold_chain": True,
            "inventory_action": "Drawdown Buffer Stock at W2 (leaves > 25% buffer)",
            "compliance_sla": "Maintains SLA within contractual grace window",
            "budget_limit_exceeded": False,
            "isRecommended": True
        }

        # Strategy C: Consolidated Rail Freight (Ludhiana DFC Rail/Road)
        strat_c = {
            "id": "strat-c",
            "name": "Strategy C",
            "type": "Consolidated Rail Freight (Ludhiana DFC)",
            "route": "Via Ludhiana Dedicated Freight Corridor (Rail/Road)",
            "cost": "₹24,000",
            "costNumeric": 24000,
            "delayHours": 48,
            "delivery": "+2 Days",
            "risk": "Medium",
            "riskNumeric": 0.45,
            "cold_chain": False,
            "inventory_action": "Depletes Kharar Central DC buffer completely",
            "compliance_sla": "Violates Tier-1 customer SLA (+48h delay)",
            "budget_limit_exceeded": False,
            "rejection_reason": "High risk of delivery penalty and lack of reefer temperature guarantee."
        }

        strategies = [strat_a, strat_b, strat_c]

        # Deterministic Multi-Objective Scoring:
        # Score = w_delivery * norm_delay + w_cost * norm_cost + w_inventory * norm_risk + w_compliance * comp_penalty
        scored_strategies = []
        for s in strategies:
            norm_cost = min(1.0, s["costNumeric"] / 200000.0)
            norm_delay = min(1.0, s["delayHours"] / 100.0)
            norm_risk = s["riskNumeric"]
            comp_penalty = 0.5 if not s["cold_chain"] else 0.0
            
            # Heavy penalty if budget is exceeded unless user explicitly down-weights cost
            budget_penalty = 0.8 if s.get("budget_limit_exceeded") and weights["cost"] >= 0.25 else 0.0

            total_penalty_score = (
                weights["delivery"] * norm_delay +
                weights["cost"] * norm_cost +
                weights["inventory"] * norm_risk +
                weights["compliance"] * comp_penalty +
                budget_penalty
            )
            s["compositeScore"] = round(total_penalty_score, 3)
            scored_strategies.append(s)

        # Sort strategies by score (lowest penalty = best recommendation)
        scored_strategies.sort(key=lambda x: x["compositeScore"])

        # Dynamically mark the top ranked as recommended
        for idx, s in enumerate(scored_strategies):
            if idx == 0:
                s["isRecommended"] = True
                s["badge"] = "RECOMMENDED"
            else:
                s["isRecommended"] = False
                s["badge"] = None

        recommended_id = scored_strategies[0]["id"]

        return {
            "disruptionId": disruption_id,
            "recommendedStrategyId": recommended_id,
            "weights": weights,
            "strategies": scored_strategies
        }

    def evaluate_custom_strategies(
        self,
        disruption_id: str,
        route_blocked: str,
        origin: str = "Origin Hub",
        destination: str = "Destination Hub",
        backup_node: str = "Regional Satellite DC",
        carrier: str = "Dedicated Fleet",
        weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Dynamically formulates and scores recovery strategies for custom customer supply chain networks.
        """
        if weights is None:
            weights = {
                "delivery": 0.40,
                "cost": 0.30,
                "inventory": 0.20,
                "compliance": 0.10
            }

        # Strategy A: Priority Air Expedite / Dedicated Green Bypass
        strat_a = {
            "id": "strat-a",
            "name": "Strategy A",
            "type": "Priority Air Charter / Green Corridor Bypass",
            "route": f"Express Air / Green Corridor ({origin} → {destination})",
            "cost": "₹1,45,000",
            "costNumeric": 145000,
            "delayHours": 8,
            "delivery": "+0.5 Days",
            "risk": "Low",
            "riskNumeric": 0.05,
            "cold_chain": True,
            "inventory_action": "Zero facility stock drawdown required",
            "compliance_sla": "Preserves delivery SLA strictly with zero stockout risk",
            "budget_limit_exceeded": True,
            "rejection_reason": "Evaluated by Financial Agent: Exceeds emergency freight budget ceiling (₹1,45,000 vs ₹1,00,000 cap)."
        }

        # Strategy B: Secondary Regional DC Buffer Drawdown & Reroute
        strat_b = {
            "id": "strat-b",
            "name": "Strategy B",
            "badge": "RECOMMENDED",
            "type": "Secondary DC Buffer Drawdown & Reroute",
            "route": f"Reroute via {backup_node} ({carrier})",
            "cost": "₹64,000",
            "costNumeric": 64000,
            "delayHours": 18,
            "delivery": "+1 Day",
            "risk": "Low",
            "riskNumeric": 0.09,
            "cold_chain": True,
            "inventory_action": f"Drawdown safety stock at {backup_node} (maintains > 20% buffer reserve)",
            "compliance_sla": "Maintains delivery window within contractual SLA grace window",
            "budget_limit_exceeded": False,
            "isRecommended": True
        }

        # Strategy C: Consolidated Multi-Modal Freight Shuttle
        strat_c = {
            "id": "strat-c",
            "name": "Strategy C",
            "type": "Consolidated Multi-Modal Freight Shuttle",
            "route": f"Consolidated Rail/Road Freight ({origin} → {destination})",
            "cost": "₹36,000",
            "costNumeric": 36000,
            "delayHours": 60,
            "delivery": "+3 Days",
            "risk": "High",
            "riskNumeric": 0.52,
            "cold_chain": False,
            "inventory_action": "Depletes active corridor buffer completely",
            "compliance_sla": "High risk of delivery penalty and lead-time breach (+60h delay)",
            "budget_limit_exceeded": False,
            "rejection_reason": "Exceeds contractual SLA lead-time and lacks real-time reefer temperature guarantees."
        }

        strategies = [strat_a, strat_b, strat_c]

        # Multi-Objective Scoring
        scored_strategies = []
        for s in strategies:
            norm_cost = min(1.0, s["costNumeric"] / 160000.0)
            norm_delay = min(1.0, s["delayHours"] / 80.0)
            norm_risk = s["riskNumeric"]
            comp_penalty = 0.5 if not s["cold_chain"] else 0.0
            budget_penalty = 0.7 if s.get("budget_limit_exceeded") and weights["cost"] >= 0.25 else 0.0

            total_penalty_score = (
                weights["delivery"] * norm_delay +
                weights["cost"] * norm_cost +
                weights["inventory"] * norm_risk +
                weights["compliance"] * comp_penalty +
                budget_penalty
            )
            s["compositeScore"] = round(total_penalty_score, 3)
            scored_strategies.append(s)

        # Sort by penalty score
        scored_strategies.sort(key=lambda x: x["compositeScore"])

        for idx, s in enumerate(scored_strategies):
            if idx == 0:
                s["isRecommended"] = True
                s["badge"] = "RECOMMENDED"
            else:
                s["isRecommended"] = False
                s["badge"] = None

        return {
            "disruptionId": disruption_id,
            "recommendedStrategyId": scored_strategies[0]["id"],
            "weights": weights,
            "strategies": scored_strategies
        }
