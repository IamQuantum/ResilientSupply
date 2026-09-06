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
