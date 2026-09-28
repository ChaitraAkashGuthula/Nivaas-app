export interface ParsedSearchQuery {
  raw: string;
  location?: string;
  propertyType?: string;
  purpose?: string;
  bedrooms?: number;
}

const KNOWN_LOCATIONS = [
  { match: /\b(amalapuram)\b/i, name: "Amalapuram" },
  { match: /\b(sarpavaram)\b/i, name: "Sarpavaram" },
  { match: /\b(ramanayyapeta|ramanayapeta)\b/i, name: "Ramanayyapeta" },
  { match: /\b(bhanugudi)\b/i, name: "Bhanugudi" },
  { match: /\b(ashok\s*nagar)\b/i, name: "Ashok Nagar" },
  { match: /\b(indrapalem)\b/i, name: "Indrapalem" },
  { match: /\b(madhavapatnam)\b/i, name: "Madhavapatnam" },
  { match: /\b(venkat\s*nagar)\b/i, name: "Venkat Nagar" },
  { match: /\b(vakalapudi)\b/i, name: "Vakalapudi" },
  { match: /\b(jagannaickpur|jagannadhapuram)\b/i, name: "Jagannaickpur" },
  { match: /\b(turangi)\b/i, name: "Turangi" },
  { match: /\b(kakinada\s*rural)\b/i, name: "Kakinada Rural" },
  { match: /\b(kakinada)\b/i, name: "Kakinada" },
  { match: /\b(yanam)\b/i, name: "Yanam" },
];

const KNOWN_PROPERTY_TYPES = [
  { match: /\b(plots?|land|layout)\b/i, type: "plot" },
  { match: /\b(apartments?|flats?|penthouse)\b/i, type: "apartment" },
  { match: /\b(villas?)\b/i, type: "villa" },
  { match: /\b(independent\s*houses?|houses?|duplex|homes?)\b/i, type: "independent-house" },
  { match: /\b(shops?|retail)\b/i, type: "shop" },
  { match: /\b(offices?|office\s*space)\b/i, type: "office" },
  { match: /\b(commercial)\b/i, type: "commercial" },
  { match: /\b(pg|co-?living|hostel)\b/i, type: "pg" },
];

const KNOWN_PURPOSES = [
  { match: /\b(rents?|for\s*rent|to\s*rent|rental|lease)\b/i, purpose: "rent" },
  { match: /\b(buys?|for\s*sale|to\s*buy|sales?|purchase)\b/i, purpose: "buy" },
];

const BHK_REGEX = /\b([1-4])\s*(?:bhk|bed|bedroom|b)\b/i;

export function parseSearchQuery(query: string): ParsedSearchQuery {
  const trimmed = (query || "").trim();
  if (!trimmed) return { raw: "" };

  let location: string | undefined;
  let propertyType: string | undefined;
  let purpose: string | undefined;
  let bedrooms: number | undefined;

  // Check locations
  for (const loc of KNOWN_LOCATIONS) {
    if (loc.match.test(trimmed)) {
      location = loc.name;
      break;
    }
  }

  // Check property types
  for (const pt of KNOWN_PROPERTY_TYPES) {
    if (pt.match.test(trimmed)) {
      propertyType = pt.type;
      break;
    }
  }

  // Check purpose
  for (const purp of KNOWN_PURPOSES) {
    if (purp.match.test(trimmed)) {
      purpose = purp.purpose;
      break;
    }
  }

  // Check bedrooms
  const bhkMatch = trimmed.match(BHK_REGEX);
  if (bhkMatch && bhkMatch[1]) {
    bedrooms = parseInt(bhkMatch[1], 10);
  }

  // If no location matched via regex, and input is not purely a property type, preserve input as location
  if (!location && !propertyType && !purpose) {
    location = trimmed;
  }

  return {
    raw: trimmed,
    location,
    propertyType,
    purpose,
    bedrooms,
  };
}
