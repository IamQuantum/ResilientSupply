"""
Unstructured Document & Disruption Parser
Uses Google Gemini 2.5 Flash via official `google-genai` SDK for structured extraction.
Includes deterministic offline heuristics fallback if GEMINI_API_KEY is not configured.
"""

import os
import json
import re
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ExtractedDisruption(BaseModel):
    id: str = Field(default="D-CUSTOM")
    eventType: str = Field(description="Type of disruption: Route Blocked, Port Congestion, Weather Delay, Industrial Strike")
    route: str = Field(description="Short route identifier, e.g. NH-48 or JNPT")
    affectedRoute: str = Field(description="Full corridor description and specific bottleneck location")
    severity: str = Field(description="Critical, High, or Medium")
    affectedShipments: int = Field(default=5, description="Estimated number of affected consignments")
    estimatedDelay: str = Field(description="Expected transit delay, e.g. 2 Days or 36 Hours")
    stockOutRisk: int = Field(description="Estimated probability percentage of stockout (0-100)")
    additionalCost: str = Field(description="Estimated cost variance in Indian Rupees, e.g. ₹95K")
    description: str = Field(description="Executive disruption summary extracted from document")

class DocumentParserEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print("Gemini client initialization warning:", e)

    def parse_document(self, raw_text: str) -> Dict[str, Any]:
        """
        Parses unstructured circulars, emails, or bulletins into a validated Disruption schema.
        Uses Gemini 2.5 Flash if API key is provided; otherwise uses deterministic parser.
        """
        if self.client:
            try:
                return self._parse_with_gemini(raw_text)
            except Exception as e:
                print("Gemini extraction error, falling back to heuristic engine:", e)
                return self._parse_heuristic(raw_text)
        else:
            return self._parse_heuristic(raw_text)

    def _parse_with_gemini(self, text: str) -> Dict[str, Any]:
        """Uses Gemini 2.5 Flash structured output mode."""
        prompt = f"""
        You are an expert AI logistics dispatch analyst for an Indian enterprise supply chain platform.
        Extract the operational parameters from the following unstructured incident notice, freight email, or government circular:

        --- DOCUMENT START ---
        {text}
        --- DOCUMENT END ---

        Format the output strictly as a JSON object matching this schema:
        {{
            "eventType": "Route Blocked | Port Congestion | Weather Delay | Industrial Strike",
            "route": "Short route code (e.g. NH-48, JNPT, NH-66)",
            "affectedRoute": "Full corridor name with specific landmark/junction",
            "severity": "Critical | High | Medium",
            "affectedShipments": <integer number of estimated impacted containers/trucks>,
            "estimatedDelay": "<e.g. 2 Days or 36 Hours>",
            "stockOutRisk": <integer 0-100 representing stock-out percentage>,
            "additionalCost": "<formatted in Indian Rupees, e.g. ₹85K or ₹1,20,000>",
            "description": "<concise 2-sentence executive disruption summary>"
        }}
        """

        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        raw_json = response.text.strip()
        # Clean any markdown code fences if present
        if "```json" in raw_json:
            raw_json = raw_json.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_json:
            raw_json = raw_json.split("```")[1].split("```")[0].strip()

        data = json.loads(raw_json)
        data["id"] = f"D-{abs(hash(text)) % 900 + 100}"
        return data

    def _parse_heuristic(self, text: str) -> Dict[str, Any]:
        """
        Deterministic NLP extractor for zero-dependency offline demonstration.
        """
        lower = text.lower()
        incident_id = f"D-{abs(hash(text)) % 900 + 100}"

        if "port" in lower or "jnpt" in lower or "vessel" in lower or "berth" in lower:
            event_type = "Port Congestion"
            route = "JNPT-Terminal"
            affected_route = "Jawaharlal Nehru Port Trust (JNPT) Maritime Gateway"
            severity = "High"
            delay = "4 Days"
            risk = 64
            cost = "₹1,45,000"
            shipments = 14
        elif "weather" in lower or "monsoon" in lower or "rain" in lower or "landslide" in lower or "flood" in lower:
            event_type = "Weather Delay"
            route = "R5 (NH-66)"
            affected_route = "Western Ghats Konkan Transit Pass (NH-66)"
            severity = "Medium"
            delay = "24 Hours"
            risk = 35
            cost = "₹45,000"
            shipments = 4
        else:
            event_type = "Route Blocked"
            route = "R1 (NH-48)"
            affected_route = "NH-48 Golden Quadrilateral (Surat-Bharuch Corridor)"
            severity = "Critical"
            delay = "2 Days"
            risk = 75
            cost = "₹92,000"
            shipments = 6

        # Check for explicit numbers
        shipment_match = re.search(r'(\d+)\s*(trucks|shipments|containers|consignments)', lower)
        if shipment_match:
            shipments = int(shipment_match.group(1))

        return {
            "id": incident_id,
            "eventType": event_type,
            "route": route,
            "affectedRoute": affected_route,
            "severity": severity,
            "affectedShipments": shipments,
            "estimatedDelay": delay,
            "stockOutRisk": risk,
            "additionalCost": cost,
            "description": f"AI-Extracted Incident: {text.strip()[:200]}..."
        }
