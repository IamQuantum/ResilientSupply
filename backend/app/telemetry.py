"""
Real-Time Telematics & Sensory Ingestion Engine (India Logistics Network)
Simulates IoT fleet GPS streams, driver phone GPS feeds, duty clocks,
emergency alerts, and IMD weather / NHAI toll sensor telemetry.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import random
from app.routing_service import calculate_road_route, geocode_location

class TelemetryEngine:
    def __init__(self):
        self.fleet_telematics = [
            {
                "truckId": "PB-65-AK-8821",
                "driverName": "Gurvinder Singh",
                "driverPhone": "+91 98722 31908",
                "carrier": "Allcargo Express Logistics",
                "consignment": "Pfizer / Sun Pharma Biologics (5 Containers)",
                "route": "R1 (NH-44)",
                "location": "Ambala Cantt - Shambhu Transit (KM 42)",
                "lat": 30.3782,
                "lng": 76.7767,
                "heading": 175,
                "speedKmh": 4,  # Stalled in waterlogging
                "avgSpeedLast2h": 5.8,
                "reeferTempC": 4.2,  # Compliant 2-8°C
                "engineStatus": "IDLE_RUNNING",
                "telematicsStatus": "ANOMALY_STALLED",
                "dutyStatus": "ON_DUTY_DRIVING",
                "breakTimerMinutes": 0,
                "batteryPct": 84,
                "isPhoneGps": False,
                "emergencyAlert": None,
                "anomalyReason": "Speed < 10 km/h for 110 minutes near Ambala Cantt on NH-44."
            },
            {
                "truckId": "PB-10-CZ-4109",
                "driverName": "Harpreet Singh",
                "driverPhone": "+91 98140 55210",
                "carrier": "TCI Express Reefer Fleet",
                "consignment": "Automotive OEM Powertrain Assemblies",
                "route": "R2 (Kharar-Ludhiana NH-5)",
                "location": "Samrala Bypass (NH-5)",
                "lat": 30.8350,
                "lng": 76.1900,
                "heading": 275,
                "speedKmh": 68,
                "avgSpeedLast2h": 65.0,
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
                "truckId": "HR-03-TY-9932",
                "driverName": "Rajinder Sharma",
                "driverPhone": "+91 94160 88201",
                "carrier": "Mahindra Logistics Regional Freight",
                "consignment": "Industrial Steel Components & Hardware",
                "route": "R3 (Banur-Delhi Bypass)",
                "location": "Panipat Toll Plaza (NH-44)",
                "lat": 29.3909,
                "lng": 76.9635,
                "heading": 180,
                "speedKmh": 62,
                "avgSpeedLast2h": 61.0,
                "reeferTempC": None,
                "engineStatus": "CRUISING",
                "telematicsStatus": "OPTIMAL",
                "dutyStatus": "ON_DUTY_DRIVING",
                "breakTimerMinutes": 0,
                "batteryPct": 76,
                "isPhoneGps": False,
                "emergencyAlert": None,
                "anomalyReason": None
            },
            {
                "truckId": "HP-12-BF-1155",
                "driverName": "Baljit Singh",
                "driverPhone": "+91 98820 44102",
                "carrier": "Gati KWE Reefer Logistics",
                "consignment": "Baddi Active Pharma Ingredients (API)",
                "route": "R4 (Kharar-Baddi Pharma Link)",
                "location": "Siswan Barrier (PB-HP Border)",
                "lat": 30.8650,
                "lng": 76.7200,
                "heading": 45,
                "speedKmh": 38,
                "avgSpeedLast2h": 34.0,
                "reeferTempC": 4.1,
                "engineStatus": "CRUISING",
                "telematicsStatus": "OPTIMAL",
                "dutyStatus": "ON_DUTY_DRIVING",
                "breakTimerMinutes": 0,
                "batteryPct": 88,
                "isPhoneGps": False,
                "emergencyAlert": None,
                "anomalyReason": None
            },
            {
                "truckId": "DRV-MOBILE-GPS",
                "driverName": "Field Driver (Your Phone GPS)",
                "driverPhone": "+91 98720 00000",
                "carrier": "ResilientChain Direct Courier",
                "consignment": "High-Priority Tier-1 Consignment",
                "route": "Assigned Live GPS Corridor",
                "location": "Kharar Central DC Gateway",
                "lat": 30.7456,
                "lng": 76.6465,
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
                "sensorId": "IMD-RADAR-AMBALA-01",
                "source": "India Meteorological Department (IMD) Doppler Radar",
                "location": "Ambala / Shambhu GT Road Corridor",
                "metricName": "Monsoon Precipitation Rate",
                "currentValue": "58 mm/h",
                "thresholdValue": "40 mm/h",
                "status": "CRITICAL_ALERT",
                "message": "Heavy downpour causing localized flooding at Ambala railway underpass on NH-44."
            },
            {
                "sensorId": "NHAI-TOLL-SHAMBHU-RFID",
                "source": "National Highways Authority of India (NHAI) FASTag Telematics",
                "location": "Shambhu Toll Plaza (NH-44)",
                "metricName": "Freight Throughput Velocity",
                "currentValue": "11 trucks/hour (Down 86%)",
                "thresholdValue": "80 trucks/hour",
                "status": "SEVERE_BOTTLENECK",
                "message": "Water pump-out and traffic diversion in progress near Shambhu border."
            },
            {
                "sensorId": "IMD-FOG-SISWAN-04",
                "source": "IMD Hill Transit Highway Station",
                "location": "Siswan Pass (Kharar-Baddi Corridor)",
                "metricName": "Transit Fog Visibility",
                "currentValue": "240 meters",
                "thresholdValue": "500 meters",
                "status": "WEATHER_WARNING",
                "message": "Seasonal dense fog along hill curves. Safe transit speed capped at 35 km/h."
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

        # Check if there is a custom dispatched route for this truck
        if hasattr(self, "_custom_dispatched_routes") and truck_id in self._custom_dispatched_routes:
            custom = self._custom_dispatched_routes[truck_id]
            return {
                "truckId": target["truckId"],
                "driverName": target["driverName"],
                "driverPhone": target.get("driverPhone", "+91 98201 44819"),
                "carrier": target.get("carrier", "Allcargo Logistics Express"),
                "routeCode": custom.get("routeCode", f"{custom.get('origin', 'ORG')[:3].upper()}-{custom.get('destination', 'DST')[:3].upper()}-EXP"),
                "origin": custom.get("origin", "Custom Origin"),
                "destination": custom.get("destination", "Custom Destination"),
                "originAddress": custom.get("originAddress", custom.get("origin", "Origin Address")),
                "destinationAddress": custom.get("destinationAddress", custom.get("destination", "Destination Address")),
                "totalDistanceKm": custom.get("distanceKm", 450),
                "remainingKm": custom.get("distanceKm", 450),
                "currentLat": target["lat"],
                "currentLng": target["lng"],
                "speedKmh": target["speedKmh"],
                "dutyStatus": target.get("dutyStatus", "ON_DUTY_DRIVING"),
                "batteryPct": target.get("batteryPct", 88),
                "nextManoeuvre": custom.get("firstManoeuvre", "Proceed along assigned road corridor"),
                "nextManoeuvreHi": custom.get("firstManoeuvreHi", "Nirdharit raste par aage badhein"),
                "eta": custom.get("etaFormatted", "Today, 06:30 PM"),
                "activeReroute": None,
                "isCustomRoute": True,
                "roadPolyline": custom.get("polyline", []),
                "steps": custom.get("steps", []),
                "waypoints": [
                    {"name": custom.get("origin", "Origin DC"), "city": custom.get("origin", "Origin"), "lat": target["lat"], "lng": target["lng"], "status": "current"},
                    {"name": custom.get("destination", "Destination Hub"), "city": custom.get("destination", "Destination"), "lat": custom.get("destLat", target["lat"]), "lng": custom.get("destLng", target["lng"]), "status": "upcoming"}
                ],
                "ewayBill": {
                    "billNumber": f"5310-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                    "generatedDate": datetime.utcnow().strftime("%Y-%m-%d %H:%M IST"),
                    "validUntil": "2026-09-16 23:59 IST",
                    "supplyType": "Outward - Regular Supply",
                    "docType": "Tax Invoice (INV-CUSTOM-2026)",
                    "consignor": {
                        "name": f"{custom.get('origin', 'Origin')} Distribution Center",
                        "gstin": "27AAAAC1234F1Z5",
                        "address": custom.get("originAddress", custom.get("origin"))
                    },
                    "consignee": {
                        "name": f"{custom.get('destination', 'Destination')} Regional Hub",
                        "gstin": "07AAACG5678K1Z2",
                        "address": custom.get("destinationAddress", custom.get("destination"))
                    },
                    "cargo": {
                        "description": "High-Priority Industrial Freight Assemblies",
                        "hsnCode": "8708",
                        "totalWeight": "12.5 Metric Tonnes",
                        "totalAmountInr": 3600000,
                        "taxableAmountInr": 3050847,
                        "cgstInr": 274576,
                        "sgstInr": 274576
                    },
                    "transport": {
                        "transporterName": target.get("carrier", "Allcargo Logistics Express Ltd"),
                        "transporterId": "27AABCA9001D1Z8",
                        "vehicleNumber": target["truckId"],
                        "lrNumber": f"AC-{random.randint(1000, 9999)}",
                        "docDate": datetime.utcnow().strftime("%Y-%m-%d")
                    },
                    "qrPayload": f"GSTIN:27AAAAC1234F1Z5|EWB:531094821092|VEH:{target['truckId']}|VAL:3600000"
                },
                "hazardAlert": None,
                "messages": msgs
            }

        # Check for active reroute proposal or active detour
        active_reroute = target.get("activeReroute")
        if not active_reroute and hasattr(self, "_active_reroutes"):
            active_reroute = self._active_reroutes.get(tid) or self._active_reroutes.get("default")

        # Determine waypoints and manoeuvre based on reroute state
        waypoints = [
            {"name": "Kharar Central DC", "city": "Kharar", "lat": 30.7456, "lng": 76.6465, "status": "completed"},
            {"name": "Mohali / Chandigarh Hub", "city": "Mohali", "lat": 30.6820, "lng": 76.7350, "status": "completed"},
            {"name": "Shambhu Toll Barrier", "city": "Shambhu", "lat": 30.4500, "lng": 76.7200, "status": "passed"},
            {"name": "Ambala Cantt Junction", "city": "Ambala", "lat": 30.3782, "lng": 76.7767, "status": "current"},
            {"name": "Kurukshetra Bypass", "city": "Kurukshetra", "lat": 29.9695, "lng": 76.8783, "status": "upcoming"},
            {"name": "Karnal Highway Belt", "city": "Karnal", "lat": 29.6857, "lng": 76.9905, "status": "upcoming"},
            {"name": "Panipat Elevated Flyover", "city": "Panipat", "lat": 29.3909, "lng": 76.9635, "status": "upcoming"},
            {"name": "Delhi NCR Kundli Hub", "city": "Sonipat / Kundli", "lat": 28.8700, "lng": 77.1200, "status": "upcoming"}
        ]
        next_manoeuvre = "In 3.8 km, continue on NH-44 toward Ambala bypass"
        next_manoeuvre_hi = "Aage 3.8 kilometer tak NH-44 par Ambala bypass ki taraf chalte rahein"

        if active_reroute and active_reroute.get("status") == "ACCEPTED":
            if "newWaypoints" in active_reroute:
                waypoints = active_reroute["newWaypoints"]
            if "newManoeuvre" in active_reroute:
                next_manoeuvre = active_reroute["newManoeuvre"]
                next_manoeuvre_hi = "Aage 1.5 kilometer chalkar Banur-Tepla expressway bypass exit lein"

        # Standard corridor road-snapped polyline (non-blocking instant return)
        if not hasattr(self, "_standard_road_cache") or self._standard_road_cache is None:
            self._standard_road_cache = {
                "distanceKm": 260.0,
                "durationHours": 5.2,
                "polyline": [
                    [30.7456, 76.6465], # Kharar
                    [30.6820, 76.7350], # Mohali
                    [30.5200, 76.7500], # Banur
                    [30.3782, 76.7767], # Ambala Cantt
                    [29.9695, 76.8783], # Kurukshetra
                    [29.6857, 76.9905], # Karnal
                    [29.3909, 76.9635], # Panipat
                    [28.8700, 77.1200]  # Kundli / Delhi NCR
                ],
                "steps": [
                    {"manoeuvre": "Head south from Kharar Central DC toward NH-205A & Mohali", "distanceKm": 14.0, "durationMin": 22.0},
                    {"manoeuvre": "Follow NH-152 toward Ambala Cantt GT Road Junction", "distanceKm": 38.0, "durationMin": 45.0},
                    {"manoeuvre": "Continue along National Highway 44 through Kurukshetra and Karnal", "distanceKm": 110.0, "durationMin": 105.0},
                    {"manoeuvre": "Cross Panipat flyover toward Kundli Logistics Belt & Delhi NCR", "distanceKm": 98.0, "durationMin": 95.0}
                ]
            }
            # Asynchronously refresh high-res road-snapped geometry in background without blocking API
            import threading
            def _async_refresh_road():
                try:
                    res = calculate_road_route(30.7456, 76.6465, 28.8700, 77.1200)
                    if res and res.get("polyline"):
                        self._standard_road_cache = res
                except Exception:
                    pass
            threading.Thread(target=_async_refresh_road, daemon=True).start()

        road_poly = self._standard_road_cache.get("polyline") if self._standard_road_cache else None
        road_steps = self._standard_road_cache.get("steps") if self._standard_road_cache else []

        return {
            "truckId": target["truckId"],
            "driverName": target["driverName"],
            "driverPhone": target.get("driverPhone", "+91 98722 31908"),
            "carrier": target.get("carrier", "Allcargo Express Logistics"),
            "routeCode": target.get("route", "KHR-DEL-EXP"),
            "origin": "Kharar Central DC",
            "destination": "Delhi NCR Fulfilment Hub",
            "originAddress": "NH-205A Logistics Belt, Kharar, Punjab 140301",
            "destinationAddress": "Kundli Industrial Area, Sonipat / Delhi NCR 131028",
            "totalDistanceKm": 260 + (25 if active_reroute and active_reroute.get("status") == "ACCEPTED" else 0),
            "remainingKm": 185,
            "currentLat": target["lat"],
            "currentLng": target["lng"],
            "speedKmh": target["speedKmh"],
            "dutyStatus": target.get("dutyStatus", "ON_DUTY_DRIVING"),
            "batteryPct": target.get("batteryPct", 88),
            "nextManoeuvre": next_manoeuvre,
            "nextManoeuvreHi": next_manoeuvre_hi,
            "eta": "Today, 06:45 PM" if (active_reroute and active_reroute.get("status") == "ACCEPTED") else "Today, 05:30 PM",
            "activeReroute": active_reroute,
            "isCustomRoute": False,
            "roadPolyline": road_poly,
            "steps": road_steps,
            "waypoints": waypoints,
            "ewayBill": {
                "billNumber": "5310-9482-1092",
                "generatedDate": "2026-09-14 06:30 IST",
                "validUntil": "2026-09-16 23:59 IST",
                "supplyType": "Outward - Regular Supply",
                "docType": "Tax Invoice (INV-2026-8819)",
                "consignor": {
                    "name": "Northern Logistics Hub - Kharar DC",
                    "gstin": "03AAACT0000A1Z5",
                    "address": "NH-205A Logistics Belt, Kharar, Punjab 140301"
                },
                "consignee": {
                    "name": "Delhi NCR Regional Fulfilment Center",
                    "gstin": "06AAACS1111B1Z9",
                    "address": "Kundli Industrial Area, Phase 4, Sonipat / NCR 131028"
                },
                "cargo": {
                    "description": "Industrial Commercial Assemblies & Automotive Transmissions",
                    "hsnCode": "8708",
                    "totalWeight": "14.2 Metric Tonnes",
                    "totalAmountInr": 4850000,
                    "taxableAmountInr": 4110169,
                    "cgstInr": 369915,
                    "sgstInr": 369915
                },
                "transport": {
                    "transporterName": "Allcargo Express Logistics Ltd",
                    "transporterId": "03AABCA9001D1Z8",
                    "vehicleNumber": target["truckId"],
                    "lrNumber": "AC-2026-9941",
                    "docDate": "2026-09-14"
                },
                "qrPayload": "GSTIN:03AAACT0000A1Z5|EWB:531094821092|VEH:PB65AK8821|VAL:4850000|DATE:2026-09-14|FROM:140301|TO:131028"
            },
            "hazardAlert": {
                "active": True,
                "title": "Severe Waterlogging & Transit Warning",
                "severity": "WARNING",
                "location": "NH-44 Ambala Cantt Railway Underpass (KM 42)",
                "message": "Monsoon water accumulation active near Ambala underpass. Water level +0.6m. Commercial vehicles rerouting via Kharar-Banur-Tepla bypass."
            },
            "messages": msgs
        }

    def push_reroute_to_fleet(
        self,
        incident_id: str = "disr-01",
        strategy_id: str = "strat-b",
        carrier: str = "Allcargo Express Logistics",
        notes: str = None
    ) -> Dict[str, Any]:
        reroute_id = f"reroute-{int(datetime.utcnow().timestamp())}"
        now_time = datetime.utcnow().strftime("%I:%M %p")
        
        reroute_data = {
            "rerouteId": reroute_id,
            "incidentId": incident_id,
            "strategyId": strategy_id,
            "status": "PROPOSED",
            "reason": "NH-44 Ambala Cantt Waterlogged Underpass (KM 42)",
            "strategyName": "Dynamic Highway Bypass via Kharar-Banur-Tepla & NH-152D",
            "detourSummary": "Divert at Mohali Exit → Banur-Tepla Expressway → Panipat Elevated Corridor",
            "originalCorridor": "NH-44 Direct Arterial",
            "newCorridor": "Banur-Tepla Arterial Bypass",
            "addedKm": 25,
            "etaDelayMinutes": 35,
            "approvedBy": "Aditya (VP Global Supply Chain)",
            "approvedAt": now_time,
            "newManoeuvre": "In 1.5 km, take Exit for Banur-Tepla Expressway bypass toward Panipat & Delhi",
            "newWaypoints": [
                {"name": "Kharar Central DC", "city": "Kharar", "lat": 30.7456, "lng": 76.6465, "status": "completed"},
                {"name": "Mohali JLPL Hub", "city": "Mohali", "lat": 30.6820, "lng": 76.7350, "status": "completed"},
                {"name": "Banur Toll Bypass", "city": "Banur", "lat": 30.5200, "lng": 76.7500, "status": "passed"},
                {"name": "Tepla Junction (NH-152D)", "city": "Tepla", "lat": 30.3100, "lng": 76.9200, "status": "current"},
                {"name": "Shahabad Bypass", "city": "Shahabad", "lat": 30.1600, "lng": 76.8700, "status": "upcoming"},
                {"name": "Karnal Lake Point", "city": "Karnal", "lat": 29.6857, "lng": 76.9905, "status": "upcoming"},
                {"name": "Panipat Elevated Flyover", "city": "Panipat", "lat": 29.3909, "lng": 76.9635, "status": "upcoming"},
                {"name": "Delhi NCR Kundli Hub", "city": "Sonipat / Kundli", "lat": 28.8700, "lng": 77.1200, "status": "upcoming"}
            ],
            "detourPolyline": [
                [30.7456, 76.6465],
                [30.6820, 76.7350],
                [30.5200, 76.7500],
                [30.3100, 76.9200], # Tepla bypass
                [30.1600, 76.8700],
                [29.6857, 76.9905],
                [29.3909, 76.9635],
                [28.8700, 77.1200]
            ]
        }

        target_trucks = ["PB-65-AK-8821", "MH-04-GP-8821", "MH-14-BT-9901"]
        for t in self.fleet_telematics:
            if t["truckId"] in target_trucks:
                t["activeReroute"] = reroute_data
                self.add_driver_message(
                    truck_id=t["truckId"],
                    sender="HQ Operations Dispatch",
                    role="dispatch",
                    text=f"🚨 REROUTE DISPATCH APPROVED: Waterlogging on NH-44 near Ambala Cantt. Approved detour via Banur-Tepla Expressway (+25 km). Tap to accept updated navigation waypoints."
                )

        if not hasattr(self, "_active_reroutes"):
            self._active_reroutes = {}
        self._active_reroutes["default"] = reroute_data
        return {"status": "success", "reroute": reroute_data}

    def accept_reroute(self, truck_id: str, reroute_id: str) -> Dict[str, Any]:
        target = None
        for t in self.fleet_telematics:
            if t["truckId"] == truck_id or truck_id in [t.get("truckId", ""), "PB-65-AK-8821", "MH-14-BT-9901"]:
                target = t
                break
        if not target:
            target = self.fleet_telematics[0]

        reroute = target.get("activeReroute")
        if not reroute and hasattr(self, "_active_reroutes"):
            reroute = self._active_reroutes.get("default")

        if reroute:
            reroute["status"] = "ACCEPTED"
            target["activeReroute"] = reroute
            target["route"] = reroute.get("newCorridor", "Banur-Tepla Detour")
            target["telematicsStatus"] = "OPTIMAL"
            target["engineStatus"] = "DRIVING"
            target["speedKmh"] = 58
            target["anomalyReason"] = None
            target["lat"] = 30.3100  # Shift position to Tepla bypass
            target["lng"] = 76.9200

            self.add_driver_message(
                truck_id=target["truckId"],
                sender=target["driverName"],
                role="driver",
                text="✅ Detour via Banur-Tepla accepted. Navigation updated. Vehicle proceeding toward Panipat & Delhi NCR."
            )
            return {"status": "success", "reroute": reroute, "truck": target}
        return {"status": "error", "message": "No active reroute found"}

    def reset_reroute(self, truck_id: str) -> Dict[str, Any]:
        for t in self.fleet_telematics:
            if t["truckId"] == truck_id or truck_id in [t.get("truckId", ""), "PB-65-AK-8821", "MH-14-BT-9901"]:
                t["activeReroute"] = None
                t["route"] = "KHR-DEL-EXP"
                t["lat"] = 30.3782
                t["lng"] = 76.7767
                break
        if hasattr(self, "_active_reroutes"):
            self._active_reroutes.pop("default", None)
        return {"status": "success", "message": "Reroute reset"}


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

    def set_custom_dispatched_route(
        self,
        truck_id: str,
        route_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Assigns a real-road calculated custom route to a truck driver."""
        if not hasattr(self, "_custom_dispatched_routes"):
            self._custom_dispatched_routes = {}
        
        self._custom_dispatched_routes[truck_id] = route_data
        
        # Teleport truck to route start position
        for t in self.fleet_telematics:
            if t["truckId"] == truck_id or truck_id == "MH-04-GP-8821":
                if route_data.get("polyline") and len(route_data["polyline"]) > 0:
                    start_pt = route_data["polyline"][0]
                    t["lat"] = start_pt[0]
                    t["lng"] = start_pt[1]
                t["route"] = route_data.get("routeCode", "CUSTOM-CORRIDOR")
                t["location"] = f"{route_data.get('origin', 'Origin DC')} Gateway"
                t["speedKmh"] = 54
                t["telematicsStatus"] = "OPTIMAL"
                t["activeReroute"] = None
                break
        
        origin_name = route_data.get("origin", "Origin DC")
        dest_name = route_data.get("destination", "Destination Hub")
        dist_km = route_data.get("distanceKm", 450)
        
        self.add_driver_message(
            truck_id=truck_id,
            sender="HQ Operations Dispatch",
            role="dispatch",
            text=f"🚛 NEW ROUTE DISPATCHED: {origin_name} ➔ {dest_name} ({dist_km} km). Asphalt road navigation with turn-by-turn maneuvers active."
        )
        return {"status": "success", "truckId": truck_id, "route": route_data}

    def clear_custom_dispatched_route(self, truck_id: str) -> Dict[str, Any]:
        """Clears custom dispatched route back to standard corridor."""
        if hasattr(self, "_custom_dispatched_routes"):
            self._custom_dispatched_routes.pop(truck_id, None)
        for t in self.fleet_telematics:
            if t["truckId"] == truck_id or truck_id in ["PB-65-AK-8821", "MH-04-GP-8821"]:
                t["route"] = "R1 (NH-44)"
                t["lat"] = 30.3782
                t["lng"] = 76.7767
                t["location"] = "Ambala Cantt - Shambhu Transit (KM 42)"
                break
        return {"status": "success", "message": f"Cleared custom route for {truck_id}"}


