"""
Real-Time Telematics & Sensory Ingestion Engine (India Logistics Network)
Simulates IoT fleet GPS streams, driver phone GPS feeds, duty clocks,
emergency alerts, and IMD weather / NHAI toll sensor telemetry.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import random

class TelemetryEngine:
    def __init__(self):
        self.fleet_telematics = [
            {
                "truckId": "MH-04-GP-8821",
                "driverName": "Rameshwar Yadav",
                "driverPhone": "+91 98201 44819",
                "carrier": "Allcargo Express Logistics",
                "consignment": "Pfizer / Sun Pharma Biologics (5 Containers)",
                "route": "R1 (NH-48)",
                "location": "Surat-Bharuch Transit Bridge (KM 204)",
                "lat": 21.7051,
                "lng": 72.9959,
                "heading": 25,
                "speedKmh": 4,  # Stalled in waterlogging
                "avgSpeedLast2h": 6.5,
                "reeferTempC": 4.2,  # Compliant 2-8°C
                "engineStatus": "IDLE_RUNNING",
                "telematicsStatus": "ANOMALY_STALLED",
                "dutyStatus": "ON_DUTY_DRIVING",
                "breakTimerMinutes": 0,
                "batteryPct": 84,
                "isPhoneGps": False,
                "emergencyAlert": None,
                "anomalyReason": "Speed < 10 km/h for 140 minutes on arterial highway."
            },
            {
                "truckId": "MH-12-QZ-4109",
                "driverName": "Gurvinder Singh",
                "driverPhone": "+91 98722 31908",
                "carrier": "TCI Express Reefer Fleet",
                "consignment": "Tata Motors Powertrain Sub-Assemblies",
                "route": "R3 (Pune-Indore Corridor)",
                "location": "Indore Outer Bypass (NH-52)",
                "lat": 22.7196,
                "lng": 75.8577,
                "heading": 15,
                "speedKmh": 68,
                "avgSpeedLast2h": 64.0,
                "reeferTempC": None,
                "engineStatus": "CRUISING",
                "telematicsStatus": "OPTIMAL",
                "dutyStatus": "ON_DUTY_DRIVING",
                "breakTimerMinutes": 0,
                "batteryPct": 92,
                "isPhoneGps": False,
                "emergencyAlert": None,
                "anomalyReason": None
            },
            {
                "truckId": "GJ-01-TX-9932",
                "driverName": "Bhikhabhai Patel",
                "driverPhone": "+91 94260 12890",
                "carrier": "Mahindra Logistics Regional Freight",
                "consignment": "FMCG / Dry Packaged Food Retail",
                "route": "R1 (NH-48 Northbound)",
                "location": "Navsari Junction, South Gujarat",
                "lat": 20.9500,
                "lng": 72.9300,
                "heading": 10,
                "speedKmh": 18,
                "avgSpeedLast2h": 22.0,
                "reeferTempC": None,
                "engineStatus": "SLOW_TRAFFIC",
                "telematicsStatus": "CONGESTED",
                "dutyStatus": "ON_DUTY_DRIVING",
                "breakTimerMinutes": 0,
                "batteryPct": 71,
                "isPhoneGps": False,
                "emergencyAlert": None,
                "anomalyReason": "Bottleneck tailback from Bharuch bridge."
            },
            {
                "truckId": "MH-46-AR-1155",
                "driverName": "Pradeep Salunke",
                "driverPhone": "+91 99670 55102",
                "carrier": "Gati KWE Inter-Modal Fleet",
                "consignment": "Automotive ECU Chips & Sensors",
                "route": "JNPT Maritime Outbound Corridor",
                "location": "Navi Mumbai ICD Feeder Road",
                "lat": 18.9499,
                "lng": 72.9510,
                "heading": 90,
                "speedKmh": 8,
                "avgSpeedLast2h": 9.2,
                "reeferTempC": 5.1,
                "engineStatus": "PORT_QUEUE",
                "telematicsStatus": "PORT_DELAY",
                "dutyStatus": "AT_DC_UNLOADING",
                "breakTimerMinutes": 0,
                "batteryPct": 65,
                "isPhoneGps": False,
                "emergencyAlert": None,
                "anomalyReason": "JNPT terminal gate-in queue exceeding 6 hours."
            },
            {
                "truckId": "DRV-MOBILE-GPS",
                "driverName": "Field Driver (Your Phone GPS)",
                "driverPhone": "+91 98900 12345",
                "carrier": "ResilientChain Direct Courier",
                "consignment": "High-Priority Tier-1 Assemblies",
                "route": "Assigned Live GPS Corridor",
                "location": "Awaiting Mobile GPS Stream",
                "lat": 18.5204,
                "lng": 73.8567,
                "heading": 0,
                "speedKmh": 0,
                "avgSpeedLast2h": 0,
                "reeferTempC": None,
                "engineStatus": "STANDBY",
                "telematicsStatus": "OPTIMAL",
                "dutyStatus": "ON_DUTY_DRIVING",
                "breakTimerMinutes": 0,
                "batteryPct": 98,
                "isPhoneGps": True,
                "emergencyAlert": None,
                "anomalyReason": None
            }
        ]

        self.environmental_sensors = [
            {
                "sensorId": "IMD-RADAR-SURAT-01",
                "source": "India Meteorological Department (IMD) Doppler Radar",
                "location": "Surat / South Gujarat Coastline",
                "metricName": "Monsoon Precipitation Rate",
                "currentValue": "54 mm/h",
                "thresholdValue": "40 mm/h",
                "status": "CRITICAL_ALERT",
                "message": "Heavy downpour causing flash waterlogging across low-lying highway sections of NH-48."
            },
            {
                "sensorId": "AIS-PORT-JNPT-09",
                "source": "JNPT Vessel Traffic Management System (VTMS)",
                "location": "Navi Mumbai Anchorage",
                "metricName": "Container Vessels in Queue",
                "currentValue": "19 Vessels",
                "thresholdValue": "12 Vessels",
                "status": "HIGH_CONGESTION",
                "message": "Berth wait time stands at 94 hours. Severe gate-in dwell cascading to outbound logistics."
            },
            {
                "sensorId": "NHAI-TOLL-BHARUCH-RFID",
                "source": "National Highways Authority of India (NHAI) FASTag Telematics",
                "location": "Narmada Bridge Toll Plaza (NH-48)",
                "metricName": "Freight Throughput Velocity",
                "currentValue": "14 trucks/hour (Down 82%)",
                "thresholdValue": "75 trucks/hour",
                "status": "SEVERE_BOTTLENECK",
                "message": "Structural girder inspection and water pump-out in progress."
            }
        ]

    def get_fleet_telematics(self) -> List[Dict[str, Any]]:
        return self.fleet_telematics

    def get_environmental_sensors(self) -> List[Dict[str, Any]]:
        return self.environmental_sensors

    def run_anomaly_check(self) -> List[Dict[str, Any]]:
        detected_anomalies = []

        # Check for fleet stalls or emergencies
        for truck in self.fleet_telematics:
            if truck.get("emergencyAlert"):
                alert = truck["emergencyAlert"]
                detected_anomalies.append({
                    "type": "DRIVER_EMERGENCY_SOS",
                    "severity": "CRITICAL",
                    "route": truck["route"],
                    "truck": truck["truckId"],
                    "carrier": truck["carrier"],
                    "location": truck["location"],
                    "speed": f"{truck['speedKmh']} km/h",
                    "actionRequired": f"Driver Alert: {alert['message']}"
                })
            elif truck["avgSpeedLast2h"] < 10 and "NH-48" in truck["route"]:
                detected_anomalies.append({
                    "type": "CORRIDOR_STALL",
                    "severity": "CRITICAL",
                    "route": truck["route"],
                    "truck": truck["truckId"],
                    "carrier": truck["carrier"],
                    "location": truck["location"],
                    "speed": f"{truck['speedKmh']} km/h",
                    "actionRequired": "Trigger Sensing Agent Reroute"
                })

        # Check environmental alerts
        for sensor in self.environmental_sensors:
            if sensor["status"] in ["CRITICAL_ALERT", "SEVERE_BOTTLENECK"]:
                detected_anomalies.append({
                    "type": "ENVIRONMENTAL_HAZARD",
                    "severity": "CRITICAL",
                    "sensor": sensor["sensorId"],
                    "metric": sensor["metricName"],
                    "reading": sensor["currentValue"],
                    "location": sensor["location"],
                    "actionRequired": "Activate Supply Chain Contingency Protocol"
                })

        return detected_anomalies

    def update_driver_telemetry(
        self,
        driver_id: str,
        truck_id: str,
        lat: float,
        lng: float,
        speed_kmh: float,
        duty_status: str,
        battery_pct: int = 100,
        heading: float = 0,
        is_phone_gps: bool = True
    ) -> Dict[str, Any]:
        target = None
        for t in self.fleet_telematics:
            if t["truckId"] == truck_id:
                target = t
                break
        
        if not target:
            target = {
                "truckId": truck_id,
                "driverName": driver_id or "Mobile Driver",
                "driverPhone": "+91 Live GPS",
                "carrier": "ResilientChain Direct Fleet",
                "consignment": "Live Linked Cargo",
                "route": "Dynamic GPS Corridor",
                "location": f"GPS ({lat:.4f}° N, {lng:.4f}° E)",
                "lat": lat,
                "lng": lng,
                "heading": heading,
                "speedKmh": round(speed_kmh, 1),
                "avgSpeedLast2h": round(speed_kmh, 1),
                "reeferTempC": None,
                "engineStatus": "DRIVING" if speed_kmh > 5 else "STATIONARY",
                "telematicsStatus": "OPTIMAL",
                "dutyStatus": duty_status or "ON_DUTY_DRIVING",
                "breakTimerMinutes": 0,
                "batteryPct": battery_pct,
                "isPhoneGps": is_phone_gps,
                "emergencyAlert": None,
                "anomalyReason": None
            }
            self.fleet_telematics.append(target)
        else:
            target["lat"] = lat
            target["lng"] = lng
            target["speedKmh"] = round(speed_kmh, 1)
            target["heading"] = heading
            target["dutyStatus"] = duty_status or target.get("dutyStatus", "ON_DUTY_DRIVING")
            target["batteryPct"] = battery_pct
            target["isPhoneGps"] = is_phone_gps
            target["location"] = f"GPS ({lat:.4f}° N, {lng:.4f}° E)"
            target["engineStatus"] = "DRIVING" if speed_kmh > 5 else "STATIONARY"

        return {"status": "success", "truck": target}

    def set_driver_duty(self, truck_id: str, duty_status: str, break_minutes: int = 0) -> Dict[str, Any]:
        for t in self.fleet_telematics:
            if t["truckId"] == truck_id:
                t["dutyStatus"] = duty_status
                t["breakTimerMinutes"] = break_minutes
                if duty_status == "MANDATORY_REST_BREAK":
                    t["engineStatus"] = "REST_BREAK"
                    t["speedKmh"] = 0
                return {"status": "success", "truckId": truck_id, "dutyStatus": duty_status}
        return {"status": "error", "message": "Truck not found"}

    def report_driver_emergency(
        self, 
        truck_id: str, 
        emergency_type: str, 
        message: str, 
        lat: float, 
        lng: float
    ) -> Dict[str, Any]:
        now = datetime.utcnow().strftime("%I:%M %p")
        alert = {
            "type": emergency_type,
            "message": message,
            "reportedAt": now,
            "lat": lat,
            "lng": lng
        }
        for t in self.fleet_telematics:
            if t["truckId"] == truck_id:
                t["emergencyAlert"] = alert
                t["dutyStatus"] = "EMERGENCY_HALT"
                t["engineStatus"] = "EMERGENCY"
                t["telematicsStatus"] = "CRITICAL_EMERGENCY"
                t["speedKmh"] = 0
                t["anomalyReason"] = f"Driver SOS Alert: {message}"
                return {"status": "success", "alert": alert, "truck": t}
        return {"status": "error", "message": "Truck not found"}

    def simulate_telemetry_event(self, event_type: str) -> Dict[str, Any]:
        now = datetime.utcnow().strftime("%H:%M:%S UTC")
        if event_type == "RECOVER_NH48":
            self.fleet_telematics[0]["speedKmh"] = 55
            self.fleet_telematics[0]["avgSpeedLast2h"] = 48.0
            self.fleet_telematics[0]["telematicsStatus"] = "OPTIMAL"
            self.fleet_telematics[0]["anomalyReason"] = None
            self.fleet_telematics[0]["emergencyAlert"] = None
            return {"status": "success", "event": "NH-48 Traffic Normalized", "timestamp": now}
        elif event_type == "FLASH_FLOOD":
            self.environmental_sensors[0]["currentValue"] = "72 mm/h"
            self.fleet_telematics[0]["speedKmh"] = 0
            self.fleet_telematics[0]["telematicsStatus"] = "ANOMALY_STALLED"
            return {"status": "success", "event": "Monsoon Flash Flood Escalated", "timestamp": now}
        elif event_type == "REEFER_EXCURSION":
            self.fleet_telematics[0]["reeferTempC"] = 12.8
            self.fleet_telematics[0]["telematicsStatus"] = "COLD_CHAIN_BREACH"
            return {"status": "success", "event": "Reefer Temperature Spike Detected (12.8°C)", "timestamp": now}
        return {"status": "success", "event": "Standard Telemetry Ping", "timestamp": now}

    def get_trip_details(self, truck_id: str) -> Dict[str, Any]:
        target = None
        for t in self.fleet_telematics:
            if t["truckId"] == truck_id or truck_id in [t.get("truckId", ""), "MH-14-BT-9901"]:
                target = t
                break
        if not target:
            target = self.fleet_telematics[0]

        tid = target["truckId"]
        msgs = self.get_driver_messages(tid)

        return {
            "truckId": target["truckId"],
            "driverName": target["driverName"],
            "driverPhone": target.get("driverPhone", "+91 98201 44819"),
            "carrier": target.get("carrier", "Allcargo Logistics Express"),
            "routeCode": target.get("route", "PUN-DEL-EXP"),
            "origin": "Pune Chakan DC",
            "destination": "Delhi NCR Hub",
            "originAddress": "MIDC Phase 2, Chakan, Pune, Maharashtra 410501",
            "destinationAddress": "Sector 34, Gurugram Logistics Park, Haryana 122004",
            "totalDistanceKm": 1450,
            "remainingKm": 840,
            "currentLat": target["lat"],
            "currentLng": target["lng"],
            "speedKmh": target["speedKmh"],
            "dutyStatus": target.get("dutyStatus", "ON_DUTY_DRIVING"),
            "batteryPct": target.get("batteryPct", 88),
            "nextManoeuvre": "In 4.2 km, continue on NH48 toward Bharuch bypass",
            "eta": "Tomorrow, 08:30 AM",
            "waypoints": [
                {"name": "Pune Chakan DC", "city": "Pune", "lat": 18.7606, "lng": 73.8643, "status": "completed"},
                {"name": "Bhiwandi Central DC", "city": "Mumbai", "lat": 19.2967, "lng": 73.0620, "status": "completed"},
                {"name": "Surat Bypass Point", "city": "Surat", "lat": 21.1702, "lng": 72.8311, "status": "passed"},
                {"name": "Bharuch Narmada Bridge", "city": "Bharuch", "lat": 21.7051, "lng": 72.9959, "status": "current"},
                {"name": "Vadodara Express Gate", "city": "Vadodara", "lat": 22.3072, "lng": 73.1812, "status": "upcoming"},
                {"name": "Ahmedabad Sanand Hub", "city": "Ahmedabad", "lat": 22.9868, "lng": 72.3814, "status": "upcoming"},
                {"name": "Jaipur Ring Bypass", "city": "Jaipur", "lat": 26.9124, "lng": 75.7873, "status": "upcoming"},
                {"name": "Delhi NCR Hub", "city": "Gurugram", "lat": 28.4908, "lng": 77.0906, "status": "upcoming"}
            ],
            "ewayBill": {
                "billNumber": "5310-9482-1092",
                "generatedDate": "2026-09-12 06:30 IST",
                "validUntil": "2026-09-15 23:59 IST",
                "supplyType": "Outward - Regular Supply",
                "docType": "Tax Invoice (INV-2026-8819)",
                "consignor": {
                    "name": "Tata Motors Ltd - Chakan Plant",
                    "gstin": "27AAAAC1234F1Z5",
                    "address": "Plot A-1, MIDC Chakan Phase 2, Pune, MH 410501"
                },
                "consignee": {
                    "name": "Delhi NCR Regional Distribution Hub",
                    "gstin": "07AAACG5678K1Z2",
                    "address": "Sector 34, Gurugram Logistics Park, HR 122004"
                },
                "cargo": {
                    "description": "Commercial Vehicle Powertrains & Transmissions (420 Units)",
                    "hsnCode": "8708",
                    "totalWeight": "14.2 Metric Tonnes",
                    "totalAmountInr": 4850000,
                    "taxableAmountInr": 4110169,
                    "cgstInr": 369915,
                    "sgstInr": 369915
                },
                "transport": {
                    "transporterName": "Allcargo Logistics Express Ltd",
                    "transporterId": "27AABCA9001D1Z8",
                    "vehicleNumber": target["truckId"],
                    "lrNumber": "AC-2026-9941",
                    "docDate": "2026-09-12"
                },
                "qrPayload": "GSTIN:27AAAAC1234F1Z5|EWB:531094821092|VEH:MH04GP8821|VAL:4850000|DATE:2026-09-12|FROM:410501|TO:122004"
            },
            "hazardAlert": {
                "active": True,
                "title": "Severe Weather & Waterlogging Warning",
                "severity": "WARNING",
                "location": "NH-48 Bharuch - Narmada River Causeway (KM 204)",
                "message": "Monsoon precipitation active. Water level over causeway bridge +0.8m. Heavy vehicles proceed with caution at <= 40 km/h. AI reroute option standby."
            },
            "messages": msgs
        }

    def get_driver_messages(self, truck_id: str) -> List[Dict[str, Any]]:
        if not hasattr(self, "_messages"):
            self._messages: Dict[str, List[Dict[str, Any]]] = {}
        
        if truck_id not in self._messages:
            self._messages[truck_id] = [
                {
                    "id": "msg-1",
                    "sender": "HQ Dispatcher (Pranath)",
                    "role": "dispatch",
                    "text": "Consignment dispatched from Chakan DC. e-Way Bill 5310-9482-1092 verified by GST portal.",
                    "time": "08:15 AM"
                },
                {
                    "id": "msg-2",
                    "sender": "System Weather Bot",
                    "role": "system",
                    "text": "Monsoon radar active. Flash flood alert active on NH48 between Surat and Bharuch. Safe transit speed 40 km/h.",
                    "time": "09:30 AM"
                }
            ]
        return self._messages[truck_id]

    def add_driver_message(self, truck_id: str, sender: str, role: str, text: str) -> Dict[str, Any]:
        msgs = self.get_driver_messages(truck_id)
        new_msg = {
            "id": f"msg-{len(msgs) + 1}-{int(datetime.utcnow().timestamp())}",
            "sender": sender,
            "role": role,
            "text": text,
            "time": datetime.utcnow().strftime("%I:%M %p")
        }
        msgs.append(new_msg)
        return {"status": "success", "message": new_msg}

    def submit_inspection(self, truck_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        if not hasattr(self, "_inspections"):
            self._inspections: Dict[str, List[Dict[str, Any]]] = {}
        if truck_id not in self._inspections:
            self._inspections[truck_id] = []
        
        record = {
            "truckId": truck_id,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            **data
        }
        self._inspections[truck_id].append(record)
        return {"status": "success", "inspection": record}

