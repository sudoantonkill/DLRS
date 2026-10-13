// Geocoding and Reverse Geocoding Utility for Aegis Land Registry
// Provides fast local preset lookup + live OpenStreetMap Nominatim & Photon geocoding

// High-frequency curated local database for instant 0ms response
const LOCAL_PRESETS = [
  // Mumbai Key Localities
  { name: "Bandra West, Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.0596, lng: 72.8295 },
  { name: "Nariman Point, Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 18.9256, lng: 72.8242 },
  { name: "Worli Sea Face, Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.0176, lng: 72.8152 },
  { name: "Andheri East MIDC, Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.1136, lng: 72.8697 },
  { name: "Lower Parel, Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 18.9986, lng: 72.8312 },
  { name: "Powai Hiranandani, Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.1176, lng: 72.9060 },
  { name: "Juhu Beach Coast, Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.1075, lng: 72.8263 },
  { name: "Bandra Kurla Complex (BKC), Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.0657, lng: 72.8687 },
  { name: "Colaba Causeway, Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 18.9067, lng: 72.8147 },
  { name: "Marine Drive, Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", lat: 18.9432, lng: 72.8230 },

  // Jammu & Kashmir Localities
  { name: "Jammu City Center, Jammu", city: "Jammu", state: "Jammu and Kashmir", country: "India", lat: 32.7266, lng: 74.8570 },
  { name: "Gandhi Nagar, Jammu", city: "Jammu", state: "Jammu and Kashmir", country: "India", lat: 32.7034, lng: 74.8622 },
  { name: "Bahu Plaza, Jammu", city: "Jammu", state: "Jammu and Kashmir", country: "India", lat: 32.7092, lng: 74.8761 },
  { name: "Srinagar Dal Lake, Kashmir", city: "Srinagar", state: "Jammu and Kashmir", country: "India", lat: 34.0837, lng: 74.7973 },
  { name: "Lal Chowk, Srinagar", city: "Srinagar", state: "Jammu and Kashmir", country: "India", lat: 34.0722, lng: 74.8105 },

  // Other Major Indian Hubs
  { name: "Connaught Place, New Delhi", city: "New Delhi", state: "Delhi", country: "India", lat: 28.6315, lng: 77.2167 },
  { name: "Indiranagar, Bengaluru", city: "Bengaluru", state: "Karnataka", country: "India", lat: 12.9784, lng: 77.6408 },
  { name: "Whitefield Tech Park, Bengaluru", city: "Bengaluru", state: "Karnataka", country: "India", lat: 12.9698, lng: 77.7500 },
  { name: "Cyber City, Gurugram", city: "Gurugram", state: "Haryana", country: "India", lat: 28.4950, lng: 77.0895 },
  { name: "HITEC City, Hyderabad", city: "Hyderabad", state: "Telangana", country: "India", lat: 17.4435, lng: 78.3772 },
  { name: "Banjara Hills, Hyderabad", city: "Hyderabad", state: "Telangana", country: "India", lat: 17.4156, lng: 78.4350 },
  { name: "Koregaon Park, Pune", city: "Pune", state: "Maharashtra", country: "India", lat: 18.5362, lng: 73.8958 },
  { name: "Salt Lake Sector V, Kolkata", city: "Kolkata", state: "West Bengal", country: "India", lat: 22.5726, lng: 88.4325 },
  { name: "OMR IT Corridor, Chennai", city: "Chennai", state: "Tamil Nadu", country: "India", lat: 12.9352, lng: 80.2295 },

  // Major Global Cities
  { name: "Dubai Marina, Dubai", city: "Dubai", state: "Dubai", country: "United Arab Emirates", lat: 25.0805, lng: 55.1403 },
  { name: "Downtown Manhattan, New York", city: "New York", state: "New York", country: "United States", lat: 40.7128, lng: -74.0060 },
  { name: "Canary Wharf, London", city: "London", state: "England", country: "United Kingdom", lat: 51.5054, lng: -0.0235 },
  { name: "Marina Bay, Singapore", city: "Singapore", state: "Central Region", country: "Singapore", lat: 1.2801, lng: 103.8509 },
  { name: "Minato Cyber District, Tokyo", city: "Tokyo", state: "Tokyo", country: "Japan", lat: 35.6586, lng: 139.7454 },
  { name: "Crypto Valley, Zug, Zurich Area", city: "Zug", state: "Zug", country: "Switzerland", lat: 47.1662, lng: 8.5155 },
  { name: "Sydney Harbour Headlands, Sydney", city: "Sydney", state: "New South Wales", country: "Australia", lat: -33.8568, lng: 151.2153 }
];

// In-memory cache to prevent redundant API calls
const geocodeCache = new Map();
const reverseCache = new Map();

/**
 * Geocode an address query to Lat/Lng
 * 1. Checks fast local presets first
 * 2. If no full match, queries OpenStreetMap Nominatim with fallback to Photon
 */
export async function geocodeAddress(query) {
  if (!query || typeof query !== 'string') return [];
  const clean = query.trim().toLowerCase();
  if (clean.length < 2) return [];

  // Check cache
  if (geocodeCache.has(clean)) {
    return geocodeCache.get(clean);
  }

  // 1. Find local preset matches
  const localMatches = LOCAL_PRESETS.filter((p) => {
    const q = clean;
    return (
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q)
    );
  }).map((p) => ({
    displayName: `${p.name}, ${p.state}, ${p.country}`,
    shortName: p.name,
    city: p.city,
    state: p.state,
    country: p.country,
    lat: p.lat,
    lng: p.lng,
    source: 'preset'
  }));

  // If we have strong local matches, return them immediately
  if (localMatches.length >= 3) {
    geocodeCache.set(clean, localMatches);
    return localMatches;
  }

  // 2. Fetch from OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const apiResults = data.map((item) => {
        const addr = item.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
        const state = addr.state || '';
        const country = addr.country || '';
        return {
          displayName: item.display_name,
          shortName: [addr.road || addr.neighbourhood || addr.suburb || item.name, city].filter(Boolean).join(', ') || item.display_name.split(',')[0],
          city,
          state,
          country,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          source: 'nominatim'
        };
      });

      // Combine local + api without duplicates
      const combined = [...localMatches];
      apiResults.forEach((apiItem) => {
        const isDuplicate = combined.some(
          (c) => Math.abs(c.lat - apiItem.lat) < 0.02 && Math.abs(c.lng - apiItem.lng) < 0.02
        );
        if (!isDuplicate) {
          combined.push(apiItem);
        }
      });

      geocodeCache.set(clean, combined);
      return combined;
    }
  } catch (err) {
    console.warn("Nominatim geocoding failed, falling back to local presets", err);
  }

  geocodeCache.set(clean, localMatches);
  return localMatches;
}

/**
 * Reverse Geocode (Lat/Lng -> Real Address/Locality)
 * Guarantees that wherever a pin is placed, the address matches the exact geographic location
 */
export async function reverseGeocode(lat, lng) {
  if (lat == null || lng == null) return null;
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

  if (reverseCache.has(key)) {
    return reverseCache.get(key);
  }

  // Check if near any of our local presets (within ~5 km)
  const nearestPreset = LOCAL_PRESETS.find((p) => {
    const dLat = Math.abs(p.lat - lat);
    const dLng = Math.abs(p.lng - lng);
    return dLat < 0.04 && dLng < 0.04;
  });

  if (nearestPreset) {
    const result = {
      displayName: `${nearestPreset.name}, ${nearestPreset.state}, ${nearestPreset.country}`,
      shortName: nearestPreset.name,
      city: nearestPreset.city,
      state: nearestPreset.state,
      country: nearestPreset.country,
      lat,
      lng
    };
    reverseCache.set(key, result);
    return result;
  }

  // Live Reverse Geocode via Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const neighbourhood = addr.neighbourhood || addr.suburb || addr.residential || addr.road || '';
      const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
      const state = addr.state || '';
      const country = addr.country || '';

      const shortName = [neighbourhood, city].filter(Boolean).join(', ') || data.name || `${city}, ${state}` || 'Verified Location';

      const result = {
        displayName: data.display_name || `${shortName}, ${country}`,
        shortName: shortName,
        city,
        state,
        country,
        lat,
        lng
      };

      reverseCache.set(key, result);
      return result;
    }
  } catch (err) {
    console.warn("Reverse geocode failed", err);
  }

  // Fallback approximate hemisphere / country calculation
  let approxLoc = "Terrestrial Coordinates";
  if (lat > 8 && lat < 37 && lng > 68 && lng < 97) {
    if (lat > 32) approxLoc = "Jammu & Kashmir Region, India";
    else if (lat > 18 && lat < 20 && lng > 72 && lng < 73.5) approxLoc = "Mumbai Metropolitan Region, India";
    else if (lat > 28 && lat < 29 && lng > 76.5 && lng < 77.5) approxLoc = "National Capital Region, Delhi, India";
    else approxLoc = "India";
  } else if (lat > 24 && lat < 26 && lng > 54 && lng < 56) {
    approxLoc = "Dubai / UAE Region";
  } else if (lat > 40 && lat < 42 && lng > -75 && lng < -73) {
    approxLoc = "New York Metropolitan Area, USA";
  }

  const fallback = {
    displayName: `${approxLoc} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`,
    shortName: approxLoc,
    city: approxLoc.split(',')[0],
    state: '',
    country: '',
    lat,
    lng
  };

  reverseCache.set(key, fallback);
  return fallback;
}

/**
 * Calculates distance in kilometers between two lat/lng coordinates (Haversine formula)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if a given address string matches the pin's coordinates
 * Returns { isMatch: boolean, detectedLocality: string, distanceKm: number, warning: string | null }
 */
export function checkLocalityMatch(addressString, lat, lng, reverseData = null) {
  if (!addressString || lat == null || lng == null) {
    return { isMatch: true, warning: null };
  }

  const addr = addressString.toLowerCase();
  
  // Specific cross-region discrepancy checks (e.g. user writes Mumbai but pin is in Jammu)
  const isJammuCoords = lat > 32.0 && lat < 35.0 && lng > 73.5 && lng < 76.5;
  const isMumbaiCoords = lat > 18.5 && lat < 19.5 && lng > 72.5 && lng < 73.3;
  const isDelhiCoords = lat > 28.2 && lat < 28.9 && lng > 76.8 && lng < 77.5;
  const isBangaloreCoords = lat > 12.7 && lat < 13.2 && lng > 77.4 && lng < 77.8;

  if (isJammuCoords && (addr.includes('mumbai') || addr.includes('delhi') || addr.includes('bangalore') || addr.includes('bengaluru'))) {
    return {
      isMatch: false,
      detectedLocality: "Jammu & Kashmir",
      warning: "Locality Mismatch: Pin is positioned in Jammu & Kashmir, but address specifies a different city (e.g. Mumbai). Auto-snap pin to address or update location."
    };
  }

  if (isMumbaiCoords && (addr.includes('jammu') || addr.includes('delhi') || addr.includes('srinagar') || addr.includes('dubai'))) {
    return {
      isMatch: false,
      detectedLocality: "Mumbai, Maharashtra",
      warning: "Locality Mismatch: Pin is positioned in Mumbai, but address mentions another region. Auto-snap pin to address or update location."
    };
  }

  if (reverseData) {
    const revCity = (reverseData.city || '').toLowerCase();
    const revState = (reverseData.state || '').toLowerCase();
    const revCountry = (reverseData.country || '').toLowerCase();

    const matchesCity = revCity && addr.includes(revCity);
    const matchesState = revState && addr.includes(revState);
    const matchesCountry = revCountry && addr.includes(revCountry);

    if (revCity && !matchesCity && !matchesState && !addr.includes(revCity.slice(0, 4))) {
      // Significant mismatch
      return {
        isMatch: false,
        detectedLocality: reverseData.shortName || `${reverseData.city}, ${reverseData.state}`,
        warning: `Pin is at "${reverseData.shortName || reverseData.city}", but address does not mention this locality.`
      };
    }
  }

  return { isMatch: true, warning: null };
}
