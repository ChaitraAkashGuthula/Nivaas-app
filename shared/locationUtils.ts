export interface StructuredLocation {
  city: string;
  locality?: string;
  district?: string;
  state?: string;
  pincode?: string;
  streetAddress?: string;
  latitude?: string;
  longitude?: string;
}

export interface KnownCityInfo {
  name: string;
  district: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  aliases: string[];
}

export const KNOWN_CITIES: Record<string, KnownCityInfo> = {
  amalapuram: {
    name: "Amalapuram",
    district: "Dr. B. R. Ambedkar Konaseema",
    state: "Andhra Pradesh",
    pincode: "533201",
    latitude: "16.5787",
    longitude: "82.0061",
    aliases: ["amalapuram", "konaseema", "dr. b. r. ambedkar konaseema"],
  },
  kakinada: {
    name: "Kakinada",
    district: "Kakinada",
    state: "Andhra Pradesh",
    pincode: "533001",
    latitude: "16.9891",
    longitude: "82.2475",
    aliases: ["kakinada", "cocanada", "kakinada rural", "kakinada urban"],
  },
  rajahmundry: {
    name: "Rajahmundry",
    district: "East Godavari",
    state: "Andhra Pradesh",
    pincode: "533101",
    latitude: "17.0005",
    longitude: "81.8040",
    aliases: ["rajahmundry", "rajamahendravaram", "east godavari"],
  },
  ravulapalem: {
    name: "Ravulapalem",
    district: "Dr. B. R. Ambedkar Konaseema",
    state: "Andhra Pradesh",
    pincode: "533238",
    latitude: "16.7483",
    longitude: "81.8488",
    aliases: ["ravulapalem"],
  },
  mandapeta: {
    name: "Mandapeta",
    district: "Dr. B. R. Ambedkar Konaseema",
    state: "Andhra Pradesh",
    pincode: "533308",
    latitude: "16.8687",
    longitude: "81.9272",
    aliases: ["mandapeta"],
  },
  ramachandrapuram: {
    name: "Ramachandrapuram",
    district: "Dr. B. R. Ambedkar Konaseema",
    state: "Andhra Pradesh",
    pincode: "533255",
    latitude: "16.8436",
    longitude: "82.0256",
    aliases: ["ramachandrapuram", "rc puram"],
  },
  samalkota: {
    name: "Samalkota",
    district: "Kakinada",
    state: "Andhra Pradesh",
    pincode: "533440",
    latitude: "17.0519",
    longitude: "82.1691",
    aliases: ["samalkota", "samalkot"],
  },
  peddapuram: {
    name: "Peddapuram",
    district: "Kakinada",
    state: "Andhra Pradesh",
    pincode: "533437",
    latitude: "17.0792",
    longitude: "82.1384",
    aliases: ["peddapuram"],
  },
  pithapuram: {
    name: "Pithapuram",
    district: "Kakinada",
    state: "Andhra Pradesh",
    pincode: "533450",
    latitude: "17.1147",
    longitude: "82.2570",
    aliases: ["pithapuram"],
  },
  yanam: {
    name: "Yanam",
    district: "Yanam",
    state: "Puducherry",
    pincode: "533464",
    latitude: "16.7328",
    longitude: "82.2176",
    aliases: ["yanam"],
  },
};

/**
 * Find known city metadata matching a given query string (city name or locality)
 */
export function findKnownCity(query: string): KnownCityInfo | undefined {
  if (!query) return undefined;
  const lower = query.trim().toLowerCase();
  for (const [key, info] of Object.entries(KNOWN_CITIES)) {
    if (lower === key || info.aliases.some(alias => lower.includes(alias) || alias.includes(lower))) {
      return info;
    }
  }
  return undefined;
}

/**
 * Distance in approximate km between two lat/lon points
 */
export function getCoordinatesDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * 111;
  const dLon = (lon2 - lon1) * 111 * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

/**
 * Validates and normalizes structured property location data.
 * Guarantees:
 * 1. The explicitly provided city is NEVER replaced by a nearby city (e.g. Amalapuram stays Amalapuram).
 * 2. Coordinates are checked: if coordinates belong to an unrelated city (e.g. Kakinada coords on Amalapuram),
 *    they are corrected to the property's actual city.
 * 3. Default district/state/pincode are filled if empty.
 */
export function validateAndNormalizeLocation(input: {
  city?: string;
  locality?: string;
  district?: string;
  state?: string;
  pincode?: string;
  streetAddress?: string;
  latitude?: string | number;
  longitude?: string | number;
  location?: string;
}): {
  city: string;
  locality: string;
  district: string;
  state: string;
  pincode: string;
  streetAddress?: string;
  latitude?: string;
  longitude?: string;
  formattedLocation: string;
} {
  // Determine city: prioritize explicitly entered city
  let rawCity = (input.city || "").trim();
  if (!rawCity && input.location) {
    const locLower = input.location.toLowerCase();
    if (locLower.includes("amalapuram")) rawCity = "Amalapuram";
    else if (locLower.includes("kakinada")) rawCity = "Kakinada";
    else if (locLower.includes("rajahmundry")) rawCity = "Rajahmundry";
    else rawCity = input.location.split(",")[0].trim();
  }
  const city = rawCity || "Amalapuram";

  const known = findKnownCity(city);

  let locality = (input.locality || "").trim();
  if (!locality && input.location && input.location !== city) {
    locality = input.location.split(",")[0].trim();
  }
  if (!locality) locality = city;

  const district = (input.district || "").trim() || (known ? known.district : (city.toLowerCase() === "amalapuram" ? "Dr. B. R. Ambedkar Konaseema" : "Kakinada"));
  const state = (input.state || "").trim() || (known ? known.state : "Andhra Pradesh");
  const pincode = (input.pincode || "").trim() || (known ? known.pincode : (city.toLowerCase() === "amalapuram" ? "533201" : "533001"));
  const streetAddress = (input.streetAddress || "").trim() || undefined;

  // Validate coordinates: prevent cross-city coordinate contamination
  let latStr = input.latitude ? String(input.latitude).trim() : undefined;
  let lonStr = input.longitude ? String(input.longitude).trim() : undefined;

  if (known) {
    const knownLat = Number(known.latitude);
    const knownLon = Number(known.longitude);

    if (latStr && lonStr && !isNaN(Number(latStr)) && !isNaN(Number(lonStr))) {
      const userLat = Number(latStr);
      const userLon = Number(lonStr);
      const dist = getCoordinatesDistanceKm(userLat, userLon, knownLat, knownLon);
      // If coordinates are more than 35km away from the stated city (e.g. Kakinada coords on Amalapuram ~55km away),
      // correct them to the stated city's coordinate area
      if (dist > 35) {
        latStr = known.latitude;
        lonStr = known.longitude;
      }
    } else {
      // Use known city coordinates if not supplied
      latStr = known.latitude;
      lonStr = known.longitude;
    }
  }

  const isLocSameAsCity = locality.toLowerCase() === city.toLowerCase();
  const formattedLocation = isLocSameAsCity ? city : `${locality}, ${city}`;

  return {
    city,
    locality,
    district,
    state,
    pincode,
    streetAddress,
    latitude: latStr,
    longitude: lonStr,
    formattedLocation,
  };
}

/**
 * Format location for display consistently across cards, details, and dashboards.
 * e.g. "Amalapuram, Andhra Pradesh" or "Near College Road, Amalapuram"
 */
export function formatLocationDisplay(property: {
  locality?: string | null;
  city?: string | null;
  locationName?: string | null;
  district?: string | null;
  state?: string | null;
}): string {
  const city = (property.city || "").trim();
  const rawLocality = (property.locality || property.locationName || "").trim();
  const isSame = rawLocality && city && rawLocality.toLowerCase() === city.toLowerCase();

  if (!rawLocality && !city) return "Location on request";
  if (isSame || !rawLocality) {
    return property.state ? `${city}, ${property.state}` : city;
  }
  return `${rawLocality}, ${city}`;
}

/**
 * Check if a property strictly matches a search term using structured location fields.
 */
export function propertyMatchesLocation(
  property: {
    city: string;
    locality?: string | null;
    locationName?: string | null;
    district?: string | null;
    state?: string | null;
    streetAddress?: string | null;
    pincode?: string | null;
    societyName?: string | null;
  },
  searchTerm: string
): boolean {
  if (!searchTerm || !searchTerm.trim()) return true;
  const term = searchTerm.trim().toLowerCase();

  const cityLower = (property.city || "").toLowerCase();
  const locLower = (property.locality || property.locationName || "").toLowerCase();
  const distLower = (property.district || "").toLowerCase();
  const streetLower = (property.streetAddress || "").toLowerCase();
  const pinLower = (property.pincode || "").toLowerCase();

  // Strict Amalapuram isolation
  if (term.includes("amalapuram") || term === "konaseema") {
    return (
      cityLower === "amalapuram" ||
      locLower.includes("amalapuram") ||
      distLower.includes("konaseema")
    );
  }

  // Strict Kakinada isolation: NEVER match Amalapuram properties
  if (term.includes("kakinada")) {
    if (cityLower === "amalapuram" || distLower.includes("konaseema")) {
      return false;
    }
    return (
      cityLower === "kakinada" ||
      distLower === "kakinada" ||
      locLower === "kakinada"
    );
  }

  // Strict Rajahmundry isolation
  if (term.includes("rajahmundry") || term.includes("rajamahendravaram")) {
    if (cityLower === "amalapuram" || cityLower === "kakinada") {
      return false;
    }
    return cityLower === "rajahmundry" || locLower.includes("rajahmundry");
  }

  // General locality or street or pincode match
  return (
    cityLower.includes(term) ||
    locLower.includes(term) ||
    distLower.includes(term) ||
    streetLower.includes(term) ||
    pinLower.includes(term)
  );
}
