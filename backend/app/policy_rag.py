"""
Supply Chain Policy & Contract SLA Knowledge Store (Hybrid RAG)
Indexes standing customer Master Service Agreements (MSAs), carrier SLA penalties,
and regulatory cold-chain transit mandates.
"""

from typing import List, Dict, Any

# Standing SLA Policies & Contractual Knowledge Base
SLA_POLICY_DOCUMENTS = [
    {
        "id": "SLA-TATA-01",
        "customer": "Tata Motors & OEM Assembly Plants (Ludhiana / Pantnagar)",
        "cargo_type": "Automotive Tier-1 Assemblies & Powertrain",
        "corridor": "Northern Freight Corridor (NH-44 / Kharar-NCR)",
        "clause": "Clause 8.4: Just-In-Time delivery mandatory. Late arrivals exceeding 24h incur penalty of ₹50,000 per delayed consignment per day. Rerouting via approved expressway corridors permitted.",
        "cold_chain_required": False,
        "max_delay_hours": 24,
        "penalty_per_day_inr": 50000
    },
    {
        "id": "SLA-PHARMA-02",
        "customer": "Sun Pharma / Cipla Distribution Network (Baddi / Kharar)",
        "cargo_type": "Temperature-Controlled Biologics & Vaccines",
        "corridor": "Baddi / Kharar to Delhi NCR Medical Depot",
        "clause": "Clause 14.2: Strict Cold-Chain Mandate. Reefer temperature must remain between 2°C and 8°C throughout transit with active telematics logging. Dispatch via non-refrigerated road routes is strictly breach of contract.",
        "cold_chain_required": True,
        "max_delay_hours": 36,
        "penalty_per_day_inr": 120000
    },
    {
        "id": "SLA-RELIANCE-03",
        "customer": "Reliance Retail Fulfilment (Northern Hubs)",
        "cargo_type": "FMCG, Dry Groceries & Consumer Electronics",
        "corridor": "Punjab & Haryana National Highways",
        "clause": "Clause 19.1: Economical transit favored over premium air dispatch. Grace window of 72 hours allowed for seasonal delays before liquidated damages apply.",
        "cold_chain_required": False,
        "max_delay_hours": 72,
        "penalty_per_day_inr": 15000
    },
    {
        "id": "REG-NHAI-GST-04",
        "customer": "Interstate Freight Compliance & Tax Authority",
        "cargo_type": "All Commercial Road Freight",
        "corridor": "National Highways (NH-44, NH-5, NH-152D)",
        "clause": "Statutory Mandate: All commercial consignments exceeding ₹50,000 value must maintain valid GST e-Way Bill with RFID toll integration. Emergency reroute requires automated route update on GST portal within 8 hours.",
        "cold_chain_required": False,
        "max_delay_hours": 999,
        "penalty_per_day_inr": 25000
    }
]

class PolicyRAGEngine:
    def __init__(self):
        self.documents = SLA_POLICY_DOCUMENTS

    def query_relevant_policies(self, query: str, cargo_type: str = "") -> List[Dict[str, Any]]:
        """
        Hybrid semantic & keyword matching across customer contracts and SLAs.
        Returns matching clauses to feed the Compliance Agent.
        """
        results = []
        tokens = query.lower().split() + cargo_type.lower().split()

        for doc in self.documents:
            score = 0
            text_content = (doc["customer"] + " " + doc["cargo_type"] + " " + doc["clause"] + " " + doc["corridor"]).lower()

            for t in tokens:
                if len(t) > 2 and t in text_content:
                    score += 1
            
            if "pharma" in tokens and doc["cold_chain_required"]:
                score += 3
            if "tata" in tokens or "automotive" in tokens:
                score += 2

            if score > 0:
                results.append((score, doc))

        # Sort by match score
        results.sort(key=lambda x: x[0], reverse=True)
        return [r[1] for r in results] if results else self.documents[:2]
