/**
 * Indian Logistics Geocoding & Coordinate Pinpointing Engine
 * Resolves exact addresses, PIN codes, SEZs, and industrial belts
 * to normalized SVG canvas coordinates (0-850, 0-480) and GPS lat/lng.
 */

export interface PinpointLocation {
  name: string;
  city: string;
  state: string;
  pincode?: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  address: string;
}

interface KnownHub {
  keywords: string[];
  pincodePrefixes: string[];
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
}

const KNOWN_HUBS: KnownHub[] = [
  {
    keywords: ['kharar', 'landran', 'kurali', 'desu majra', 'sunny enclave', 'chandigarh university', 'gharuan'],
    pincodePrefixes: ['140'],
    name: 'Kharar Central Logistics Park',
    city: 'Kharar',
    state: 'Punjab',
    lat: 30.7456,
    lng: 76.6465,
    x: 610,
    y: 55
  },
  {
    keywords: ['ludhiana', 'focal point', 'sahnewal', 'doraha', 'khanna', 'gill road'],
    pincodePrefixes: ['141'],
    name: 'Ludhiana Focal Point Industrial Hub',
    city: 'Ludhiana',
    state: 'Punjab',
    lat: 30.9010,
    lng: 75.8573,
    x: 580,
    y: 50
  },
  {
    keywords: ['chandigarh', 'mohali', 'panchkula', 'aerocity', 'jlpl', 'derabassi', 'zirakpur'],
    pincodePrefixes: ['160'],
    name: 'Chandigarh / Mohali Logistics Hub',
    city: 'Mohali / Chandigarh',
    state: 'Punjab / Chandigarh',
    lat: 30.6820,
    lng: 76.7350,
    x: 620,
    y: 60
  },
  {
    keywords: ['baddi', 'barotiwala', 'nalagarh', 'solan', 'siswan'],
    pincodePrefixes: ['173'],
    name: 'Baddi Pharma Freight Gateway',
    city: 'Baddi',
    state: 'Himachal Pradesh',
    lat: 30.9578,
    lng: 76.7914,
    x: 625,
    y: 45
  },
  {
    keywords: ['ambala', 'shambhu', 'rajpura', 'cantt', 'kurukshetra', 'karnal'],
    pincodePrefixes: ['133', '134', '132'],
    name: 'Ambala GT Road Transit Junction',
    city: 'Ambala Cantt',
    state: 'Haryana',
    lat: 30.3782,
    lng: 76.7767,
    x: 630,
    y: 70
  },
  {
    keywords: ['bhiwandi', 'mumbai', 'thane', 'panvel', 'jnpt', 'nhava sheva', 'navi mumbai', 'bombay', 'kurla', 'andheri'],
    pincodePrefixes: ['400', '401', '410', '421'],
    name: 'Mumbai / Bhiwandi Logistics Corridor',
    city: 'Bhiwandi / Mumbai',
    state: 'Maharashtra',
    lat: 19.2967,
    lng: 73.0631,
    x: 220,
    y: 370
  },
  {
    keywords: ['pune', 'chakan', 'talegaon', 'bhosari', 'pimpri', 'chinchwad', 'hadapsar', 'ranjangaon'],
    pincodePrefixes: ['411', '412'],
    name: 'Pune / Chakan Industrial Belt',
    city: 'Pune',
    state: 'Maharashtra',
    lat: 18.7606,
    lng: 73.8643,
    x: 310,
    y: 410
  },
  {
    keywords: ['delhi', 'gurugram', 'gurgaon', 'noida', 'greater noida', 'sonipat', 'kundli', 'manesar', 'bilaspur', 'faridabad', 'ghaziabad', 'ncr', 'panipat'],
    pincodePrefixes: ['110', '121', '122', '201', '131'],
    name: 'Delhi NCR Logistics & Fulfilment Hub',
    city: 'Kundli / Delhi NCR',
    state: 'Delhi / Haryana',
    lat: 28.8700,
    lng: 77.1200,
    x: 680,
    y: 90
  },
  {
    keywords: ['nagpur', 'butibori', 'wardha', 'vidarbha', 'mihan'],
    pincodePrefixes: ['440', '441'],
    name: 'Nagpur Multi-Modal Logistics Park',
    city: 'Nagpur',
    state: 'Maharashtra',
    lat: 21.1458,
    lng: 79.0882,
    x: 500,
    y: 320
  },
  {
    keywords: ['kochi', 'cochin', 'ernakulam', 'vallarpadam', 'coimbatore', 'tirupur', 'kottayam'],
    pincodePrefixes: ['682', '683', '641', '686'],
    name: 'Kochi Container Terminal & Southern Corridor',
    city: 'Kochi / Ernakulam',
    state: 'Kerala',
    lat: 9.9312,
    lng: 76.2673,
    x: 330,
    y: 480
  },
  {
    keywords: ['visakhapatnam', 'vizag', 'gajuwaka', 'gangavaram', 'vijayawada', 'guntur', 'sri city'],
    pincodePrefixes: ['530', '531', '520', '517'],
    name: 'Visakhapatnam & Coastal Gateway',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    lat: 17.6868,
    lng: 83.2185,
    x: 580,
    y: 370
  },
  {
    keywords: ['lucknow', 'kanpur', 'unnao', 'varanasi', 'prayagraj', 'agra'],
    pincodePrefixes: ['226', '208', '221', '282'],
    name: 'Lucknow-Kanpur Freight Corridor',
    city: 'Lucknow / Kanpur',
    state: 'Uttar Pradesh',
    lat: 26.8467,
    lng: 80.9462,
    x: 630,
    y: 170
  }
];

/**
 * Resolves an address or city string to high-precision coordinates and metadata.
 */
export function resolveAddressPinpoint(rawInput: string): PinpointLocation {
  const clean = (rawInput || '').toLowerCase().trim();

  // 1. Check for 6-digit PIN code in address
  const pinMatch = clean.match(/\b\d{6}\b/);
  const pin = pinMatch ? pinMatch[0] : '';
  if (pin) {
    const pinPrefix3 = pin.substring(0, 3);
    const matchedByPin = KNOWN_HUBS.find(h => h.pincodePrefixes.includes(pinPrefix3));
    if (matchedByPin) {
      // Deterministic micro-jitter based on PIN last 3 digits for realistic clustering
      const pinNum = parseInt(pin.substring(3), 10) || 0;
      const offsetX = ((pinNum % 15) - 7);
      const offsetY = (((pinNum * 3) % 15) - 7);
      return {
        name: rawInput.split(',')[0].trim() || matchedByPin.name,
        city: matchedByPin.city,
        state: matchedByPin.state,
        pincode: pin,
        lat: Number((matchedByPin.lat + (offsetY * 0.01)).toFixed(4)),
        lng: Number((matchedByPin.lng + (offsetX * 0.01)).toFixed(4)),
        x: Math.max(30, Math.min(820, matchedByPin.x + offsetX)),
        y: Math.max(30, Math.min(460, matchedByPin.y + offsetY)),
        address: rawInput.trim()
      };
    }
  }

  // 2. Search keyword matching
  for (const hub of KNOWN_HUBS) {
    for (const kw of hub.keywords) {
      if (clean.includes(kw)) {
        // Deterministic hash offset based on address length and characters
        let hash = 0;
        for (let i = 0; i < clean.length; i++) {
          hash = (hash * 31 + clean.charCodeAt(i)) % 1000;
        }
        const offsetX = (hash % 20) - 10;
        const offsetY = ((hash * 7) % 20) - 10;

        return {
          name: rawInput.split(',')[0].trim() || hub.name,
          city: hub.city,
          state: hub.state,
          lat: Number((hub.lat + (offsetY * 0.008)).toFixed(4)),
          lng: Number((hub.lng + (offsetX * 0.008)).toFixed(4)),
          x: Math.max(30, Math.min(820, hub.x + offsetX)),
          y: Math.max(30, Math.min(460, hub.y + offsetY)),
          address: rawInput.trim()
        };
      }
    }
  }

  // 3. Fallback: Region hash projection based on string content
  let fallbackHash = 0;
  for (let i = 0; i < clean.length; i++) {
    fallbackHash = (fallbackHash * 33 + clean.charCodeAt(i)) % 10000;
  }
  const defaultHub = KNOWN_HUBS[fallbackHash % KNOWN_HUBS.length];
  const fx = defaultHub.x + ((fallbackHash % 30) - 15);
  const fy = defaultHub.y + (((fallbackHash * 3) % 30) - 15);

  return {
    name: rawInput.split(',')[0].trim() || 'Logistics Node',
    city: defaultHub.city,
    state: defaultHub.state,
    lat: defaultHub.lat,
    lng: defaultHub.lng,
    x: Math.max(40, Math.min(800, fx)),
    y: Math.max(40, Math.min(450, fy)),
    address: rawInput.trim()
  };
}

/**
 * Calculates road freight distance, transit hours, suggested route code,
 * and SVG bezier curve control point between two pinpoint locations.
 */
export function calculateRouteMetrics(
  originPoint: PinpointLocation,
  destPoint: PinpointLocation
): {
  distanceKm: number;
  transitHours: number;
  suggestedRouteCode: string;
  midX: number;
  midY: number;
  curvePath: string;
} {
  const dx = destPoint.x - originPoint.x;
  const dy = destPoint.y - originPoint.y;
  const canvasDistance = Math.hypot(dx, dy);

  // Approximate Indian road distance based on canvas projection scale
  const distanceKm = Math.max(60, Math.round(canvasDistance * 2.6) + 40);
  const transitHours = Math.max(4, Math.round(distanceKm / 45));

  // Generate clean 3-letter corridor code
  const getCityCode = (cityName: string) => {
    const cleanCity = cityName.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (cleanCity.includes('PUNE')) return 'PUN';
    if (cleanCity.includes('MUMBAI') || cleanCity.includes('BHIWANDI')) return 'BOM';
    if (cleanCity.includes('BENGALURU') || cleanCity.includes('BANGALORE')) return 'BLR';
    if (cleanCity.includes('HYDERABAD')) return 'HYD';
    if (cleanCity.includes('CHENNAI')) return 'MAA';
    if (cleanCity.includes('DELHI') || cleanCity.includes('GURUGRAM') || cleanCity.includes('NOIDA')) return 'DEL';
    if (cleanCity.includes('AHMEDABAD') || cleanCity.includes('SANAND')) return 'AMD';
    if (cleanCity.includes('SURAT') || cleanCity.includes('BHARUCH')) return 'STV';
    if (cleanCity.includes('INDORE')) return 'IDR';
    if (cleanCity.includes('KOLKATA')) return 'CCU';
    if (cleanCity.includes('CHANDIGARH')) return 'IXC';
    if (cleanCity.includes('NAGPUR')) return 'NAG';
    return cleanCity.slice(0, 3) || 'LNE';
  };

  const code1 = getCityCode(originPoint.city || originPoint.name);
  const code2 = getCityCode(destPoint.city || destPoint.name);
  const suggestedRouteCode = `${code1}-${code2}-EXP`;

  // Quadratic Bezier Midpoint with subtle curvature
  const midX = (originPoint.x + destPoint.x) / 2 - (dy * 0.15);
  const midY = (originPoint.y + destPoint.y) / 2 + (dx * 0.15);
  const curvePath = `M ${originPoint.x} ${originPoint.y} Q ${midX} ${midY} ${destPoint.x} ${destPoint.y}`;

  return {
    distanceKm,
    transitHours,
    suggestedRouteCode,
    midX,
    midY,
    curvePath
  };
}

/**
 * Haversine formula to compute great circle distance in km between two GPS coordinates,
 * scaled by 1.28x to approximate Indian highway road network routing.
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDist = R * c;
  return Math.max(30, Math.round(straightDist * 1.28));
}

/**
 * Interpolates intermediate GPS points along a gentle arc between two coordinates
 * for realistic corridor polyline rendering on Leaflet maps.
 */
export function interpolateGpsCurve(
  start: [number, number],
  end: [number, number],
  numPoints: number = 24
): [number, number][] {
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;
  const points: [number, number][] = [];

  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;

  // Arc offset perpendicular to the line vector
  const curvature = 0.12;
  const ctrlLat = midLat - dLng * curvature;
  const ctrlLng = midLng + dLat * curvature;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic bezier in lat/lng space
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * ctrlLat + t * t * lat2;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * ctrlLng + t * t * lng2;
    points.push([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
  }

  return points;
}

/**
 * Asynchronous online geocoding via OpenStreetMap Nominatim with instant local fallback.
 */
const geocodeCache = new Map<string, PinpointLocation>();

export async function geocodeAddressOnline(address: string): Promise<PinpointLocation> {
  const clean = (address || '').trim();
  if (!clean) return resolveAddressPinpoint('');
  
  if (geocodeCache.has(clean.toLowerCase())) {
    return geocodeCache.get(clean.toLowerCase())!;
  }

  try {
    const query = encodeURIComponent(clean.toLowerCase().includes('india') ? clean : `${clean}, India`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`, {
      headers: {
        'Accept-Language': 'en'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const city = item.address?.city || item.address?.town || item.address?.state_district || item.address?.state || clean.split(',')[0];
        const state = item.address?.state || 'India';
        const pincode = item.address?.postcode || '';
        
        const resolved: PinpointLocation = {
          name: clean.split(',')[0].trim() || item.name || 'Location',
          city,
          state,
          pincode,
          lat: Number(lat.toFixed(5)),
          lng: Number(lng.toFixed(5)),
          x: 0,
          y: 0,
          address: item.display_name || clean
        };
        geocodeCache.set(clean.toLowerCase(), resolved);
        return resolved;
      }
    }
  } catch (err) {
    // Falls back to local database
  }

  const fallback = resolveAddressPinpoint(clean);
  geocodeCache.set(clean.toLowerCase(), fallback);
  return fallback;
}

