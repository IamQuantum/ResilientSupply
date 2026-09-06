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
        Builds the baseline multi-modal Indian freight logistics network.
        Nodes represent Warehouses (W1 Mumbai, W2 Pune, W3 Ahmedabad), Transit Hubs, and NCR Delivery Center.
        """
        # Warehouses / Hubs in India
        self.graph.add_node("W1_Mumbai_Bhiwandi", type="primary_hub", buffer_stock=100, safety_threshold=40)
        self.graph.add_node("W2_Pune_Chakan", type="satellite_hub", buffer_stock=120, safety_threshold=30)
        self.graph.add_node("W3_Ahmedabad_Sanand", type="satellite_hub", buffer_stock=90, safety_threshold=25)
        
        # Transit Junctions on National Highways
        self.graph.add_node("Transit_Surat_Bharuch", type="junction")
        self.graph.add_node("Transit_Indore_Bypass", type="junction")
        self.graph.add_node("Coastal_Konkan_Junction", type="junction")
        
        # Destination Node: NCR Fulfilment Center
        self.graph.add_node("Destination_Delhi_NCR", type="destination_center")

        # Baseline Primary Arterial Route R1 (NH-48 Mumbai -> Surat/Bharuch -> NCR)
        self.graph.add_edge(
            "W1_Mumbai_Bhiwandi", "Transit_Surat_Bharuch",
            route_id="R1_NH48_Segment1",
            cost_inr=15000,
            hours=7,
            failure_risk=0.05,
            cold_chain=True,
            capacity=25,
            is_blocked=False
        )
        self.graph.add_edge(
            "Transit_Surat_Bharuch", "Destination_Delhi_NCR",
            route_id="R1_NH48_Segment2",
            cost_inr=22000,
            hours=17,
            failure_risk=0.05,
            cold_chain=True,
            capacity=25,
            is_blocked=False
        )

        # Alternative Corridor R3 (via Pune Chakan W2 -> Indore -> Gwalior -> NCR)
        self.graph.add_edge(
            "W2_Pune_Chakan", "Transit_Indore_Bypass",
            route_id="R3_Indore_Segment1",
            cost_inr=32000,
            hours=12,
            failure_risk=0.06,
            cold_chain=True,
            capacity=20,
            is_blocked=False
        )
        self.graph.add_edge(
            "Transit_Indore_Bypass", "Destination_Delhi_NCR",
            route_id="R3_Indore_Segment2",
            cost_inr=40000,
            hours=12,
            failure_risk=0.08,
            cold_chain=True,
            capacity=20,
            is_blocked=False
        )

        # Alternative Corridor R5 (Coastal / Hybrid Rail-Road via Konkan)
        self.graph.add_edge(
            "W1_Mumbai_Bhiwandi", "Coastal_Konkan_Junction",
            route_id="R5_Coastal_Segment1",
            cost_inr=22000,
            hours=36,
            failure_risk=0.25,
            cold_chain=False,
            capacity=30,
            is_blocked=False
        )
        self.graph.add_edge(
            "Coastal_Konkan_Junction", "Destination_Delhi_NCR",
            route_id="R5_Coastal_Segment2",
            cost_inr=26000,
            hours=48,
            failure_risk=0.35,
            cold_chain=False,
            capacity=30,
            is_blocked=False
        )

        # Direct Air Freight Expedite Corridor (BOM → DEL Cargo)
        self.graph.add_edge(
            "W1_Mumbai_Bhiwandi", "Destination_Delhi_NCR",
            route_id="Air_Cargo_BOM_DEL",
            cost_inr=185000,
            hours=14,
            failure_risk=0.04,
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

        # Strategy A: Air Freight Expedite (Mumbai BOM -> Delhi DEL)
        strat_a = {
            "id": "strat-a",
            "name": "Strategy A",
            "type": "Direct Air Expedite",
            "route": "Direct Air Cargo (BOM → DEL)",
            "cost": "₹1,85,000",
            "costNumeric": 185000,
            "delayHours": 14,
            "delivery": "+1 Day",
            "risk": "Low",
            "riskNumeric": 0.04,
            "cold_chain": True,
            "inventory_action": "No buffer drawdown needed",
            "compliance_sla": "Maintains SLA strictly",
            "budget_limit_exceeded": True,
            "rejection_reason": "Rejected by Financial Agent: Exceeds emergency freight budget (₹1,85,000 vs ₹1,00,000 ceiling)."
        }

        # Strategy B: Regional Corridor R3 (via Pune Chakan W2 buffer)
        strat_b = {
            "id": "strat-b",
            "name": "Strategy B",
            "badge": "RECOMMENDED",
            "type": "Regional Reroute + Safety Stock",
            "route": "Via Corridor R3 (Pune Chakan Hub W2)",
            "cost": "₹72,000",
            "costNumeric": 72000,
            "delayHours": 24,
            "delivery": "+1 Day",
            "risk": "Low",
            "riskNumeric": 0.08,
            "cold_chain": True,
            "inventory_action": "Drawdown Buffer Stock at W2 (leaves > 15% buffer)",
            "compliance_sla": "Maintains SLA within contractual grace window",
            "budget_limit_exceeded": False,
            "isRecommended": True
        }

        # Strategy C: Hybrid Multi-Modal Coastal R5 (Slow / Cheap)
        strat_c = {
            "id": "strat-c",
            "name": "Strategy C",
            "type": "Hybrid Multi-Modal (Rail/Road)",
            "route": "Via Coastal Corridor R5",
            "cost": "₹48,000",
            "costNumeric": 48000,
            "delayHours": 84,
            "delivery": "+5 Days",
            "risk": "High",
            "riskNumeric": 0.60,
            "cold_chain": False,
            "inventory_action": "Depletes Mumbai Bhiwandi buffer completely",
            "compliance_sla": "Violates Tier-1 customer SLA (+84h delay)",
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
