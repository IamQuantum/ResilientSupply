"""
Real-World Road Routing & Geocoding Service (OSRM + OpenStreetMap)
Provides asphalt-accurate road geometry, true turn-by-turn navigation maneuvers,
driving distance, duration, and dynamic address geocoding.
"""

import logging
import requests
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("routing_service")

# In-memory route & geocode cache to reduce external latency
_route_cache: Dict[str, Dict[str, Any]] = {}
_geocode_cache: Dict[str, List[Dict[str, Any]]] = {}

def geocode_location(query: str) -> List[Dict[str, Any]]:
    """Geocode any city, landmark, or address using OpenStreetMap Nominatim."""
    clean_q = query.strip()
    if not clean_q:
        return []
    
    cache_key = clean_q.lower()
    if cache_key in _geocode_cache:
        return _geocode_cache[cache_key]
    
    url = f"https://nominatim.openstreetmap.org/search?q={requests.utils.quote(clean_q)}&format=json&addressdetails=1&limit=5"
    headers = {
        "User-Agent": "ResilientSupply-FleetNavigation/1.0 (logistics-platform)"
    }
    
    try:
        resp = requests.get(url, headers=headers, timeout=6)
        if resp.status_code == 200:
            results = resp.json()
            formatted = []
            for item in results:
                name = item.get("display_name", "")
                parts = name.split(",")
                short_name = parts[0].strip()
                city = parts[1].strip() if len(parts) > 1 else short_name
                formatted.append({
                    "displayName": name,
                    "title": short_name,
                    "city": city,
                    "lat": float(item["lat"]),
                    "lng": float(item["lon"]),
                    "type": item.get("type", "location")
                })
            _geocode_cache[cache_key] = formatted
            return formatted
    except Exception as e:
        logger.warning(f"Nominatim geocode failed for '{query}': {e}")
    
    return []


def format_maneuver(step: Dict[str, Any]) -> Dict[str, Any]:
    """Formats OSRM step into clear English & Hindi navigation instructions."""
    m = step.get("maneuver", {})
    m_type = m.get("type", "continue")
    modifier = m.get("modifier", "")
    name = step.get("name", "").strip() or "Highway Corridor"
    dist_m = step.get("distance", 0)
    
    if dist_m >= 1000:
        dist_str = f"{dist_m / 1000:.1f} km"
        dist_hi = f"{dist_m / 1000:.1f} kilometer"
    else:
        dist_str = f"{int(dist_m)} m"
        dist_hi = f"{int(dist_m)} meter"

    # English formatting
    if m_type == "depart":
        en_text = f"Start journey and proceed on {name}"
        hi_text = f"Yatra shuru karein aur {name} par aage badhein"
    elif m_type == "arrive":
        en_text = f"You have arrived at your destination"
        hi_text = f"Aap apne gantavya par pahunch gaye hain"
    elif m_type == "turn":
        en_text = f"In {dist_str}, turn {modifier} onto {name}"
        hi_text = f"Aage {dist_hi} mein, {name} par {modifier} mudein"
    elif m_type == "fork":
        en_text = f"In {dist_str}, keep {modifier} at the fork onto {name}"
        hi_text = f"Aage {dist_hi} mein, {name} ke liye {modifier} rahein"
    elif m_type == "roundabout":
        en_text = f"In {dist_str}, enter roundabout and take {modifier} exit"
        hi_text = f"Aage {dist_hi} mein, roundabout par {modifier} exit lein"
    elif m_type in ["on ramp", "off ramp"]:
        en_text = f"In {dist_str}, take ramp {modifier} onto {name}"
        hi_text = f"Aage {dist_hi} mein, {name} ke liye ramp lein"
    else:
        en_text = f"Continue on {name} for {dist_str}"
        hi_text = f"{name} par {dist_hi} tak aage chalte rahein"

    loc = m.get("location", [0, 0])
    return {
        "instruction": en_text,
        "instructionHi": hi_text,
        "road": name,
        "distanceMeters": round(dist_m),
        "distanceStr": dist_str,
        "durationSec": round(step.get("duration", 0)),
        "type": m_type,
        "modifier": modifier,
        "lat": loc[1] if len(loc) > 1 else 0.0,
        "lng": loc[0] if len(loc) > 0 else 0.0
    }


def calculate_road_route(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
    via_waypoints: Optional[List[Tuple[float, float]]] = None
) -> Dict[str, Any]:
    """
    Fetches real road geometry from OSRM for any origin and destination coordinates.
    Returns:
      - polyline: [[lat, lng], ...]
      - distanceKm: float
      - durationHours: float
      - steps: list of turn-by-turn maneuvers with English & Hindi speech
    """
    coords_str = f"{origin_lng},{origin_lat}"
    if via_waypoints:
        for w_lat, w_lng in via_waypoints:
            coords_str += f";{w_lng},{w_lat}"
    coords_str += f";{dest_lng},{dest_lat}"

    cache_key = coords_str
    if cache_key in _route_cache:
        return _route_cache[cache_key]

    url = f"https://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson&steps=true"
    try:
        resp = requests.get(url, timeout=12)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                distance_km = round(route["distance"] / 1000, 1)
                duration_hrs = round(route["duration"] / 3600, 1)
                duration_mins = round(route["duration"] / 60)

                raw_coords = route["geometry"]["coordinates"] # [lng, lat]
                
                # Decimate if excessively dense (>2000 points) to protect mobile GPU/Canvas
                if len(raw_coords) > 2000:
                    step_skip = max(1, len(raw_coords) // 1500)
                    sampled = raw_coords[::step_skip]
                    if raw_coords[-1] not in sampled:
                        sampled.append(raw_coords[-1])
                else:
                    sampled = raw_coords

                # Convert to Leaflet [lat, lng]
                leaflet_coords = [[c[1], c[0]] for c in sampled]

                # Parse steps
                formatted_steps = []
                for leg in route.get("legs", []):
                    for st in leg.get("steps", []):
                        if st.get("distance", 0) > 20: # ignore 0-length transition artifacts
                            formatted_steps.append(format_maneuver(st))

                res = {
                    "status": "success",
                    "source": "OSRM (OpenStreetMap Asphalt Road Network)",
                    "distanceKm": distance_km,
                    "durationHours": duration_hrs,
                    "durationMinutes": duration_mins,
                    "etaFormatted": f"{int(duration_hrs)}h {int(duration_mins % 60)}m",
                    "polyline": leaflet_coords,
                    "totalPoints": len(leaflet_coords),
                    "steps": formatted_steps,
                    "firstManoeuvre": formatted_steps[0]["instruction"] if formatted_steps else "Proceed on assigned highway corridor",
                    "firstManoeuvreHi": formatted_steps[0]["instructionHi"] if formatted_steps else "Nirdharit highway raste par aage badhein"
                }
                _route_cache[cache_key] = res
                return res
    except Exception as e:
        logger.warning(f"OSRM routing failed: {e}. Falling back to straight-line interpolation.")

    # Fallback to straight-line coordinates if OSRM is unreachable
    fallback_points = [
        [origin_lat, origin_lng],
        [origin_lat + (dest_lat - origin_lat) * 0.33, origin_lng + (dest_lng - origin_lng) * 0.33],
        [origin_lat + (dest_lat - origin_lat) * 0.66, origin_lng + (dest_lng - origin_lng) * 0.66],
        [dest_lat, dest_lng]
    ]
    # Simple Haversine approx
    lat_diff = (dest_lat - origin_lat) * 111
    lng_diff = (dest_lng - origin_lng) * 105
    approx_km = round((lat_diff**2 + lng_diff**2)**0.5, 1)
    approx_hrs = round(approx_km / 55, 1)

    return {
        "status": "fallback",
        "source": "Fallback Geodesic Corridor",
        "distanceKm": approx_km,
        "durationHours": approx_hrs,
        "durationMinutes": int(approx_hrs * 60),
        "etaFormatted": f"{int(approx_hrs)}h {int((approx_hrs*60)%60)}m",
        "polyline": fallback_points,
        "totalPoints": len(fallback_points),
        "steps": [
            {
                "instruction": f"Proceed along arterial corridor toward destination ({approx_km} km)",
                "instructionHi": f"Gantavya ki taraf arterial corridor par aage badhein ({approx_km} km)",
                "road": "National Highway Corridor",
                "distanceMeters": int(approx_km * 1000),
                "distanceStr": f"{approx_km} km",
                "durationSec": int(approx_hrs * 3600),
                "type": "continue",
                "modifier": "straight",
                "lat": origin_lat,
                "lng": origin_lng
            }
        ],
        "firstManoeuvre": f"Proceed along arterial corridor ({approx_km} km)",
        "firstManoeuvreHi": f"Arterial corridor par aage badhein ({approx_km} km)"
    }
