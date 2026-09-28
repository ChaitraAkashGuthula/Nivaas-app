export interface DemoProperty {
  id: number;
  sellerId: number;
  sellerName: string;
  sellerType: string;
  sellerPhone: string;
  sellerEmail: string;
  title: string;
  slug: string;
  description: string;
  purposeId: number;
  purpose: string;
  purposeSlug: string;
  propertyTypeId: number;
  propertyType: string;
  propertyTypeSlug: string;
  price: string;
  rentPeriod?: string | null;
  deposit?: string | null;
  bedrooms?: number | null;
  bathrooms?: string | null;
  areaSqft?: number | null;
  furnishing?: string | null;
  parking?: string | null;
  societyName?: string | null;
  locationId: number;
  locationName: string;
  city: string;
  locality?: string;
  district?: string;
  state: string;
  pincode?: string;
  streetAddress?: string | null;
  locationVisibility?: "locality" | "area_city" | "full";
  latitude?: string;
  longitude?: string;
  locationPrecision: "exact" | "street" | "locality";
  status: "published" | "draft";
  verificationStatus: "verified" | "unverified";
  createdAt: Date;
  imageUrl: string;
  imageAlt: string;
  images: Array<{ url: string; altText: string }>;
  dataSource?: "user" | "sample";
  isSampleListing?: boolean;
}

export const demoPurposes = [
  { id: 1, name: "Buy", slug: "buy" },
  { id: 2, name: "Rent", slug: "rent" },
  { id: 3, name: "PG / Co-Living", slug: "pg" },
  { id: 4, name: "Commercial", slug: "commercial" },
];

export const demoPropertyTypes = [
  { id: 1, name: "Apartment", slug: "apartment", icon: "Building2" },
  { id: 2, name: "Independent House", slug: "independent-house", icon: "House" },
  { id: 3, name: "Villa", slug: "villa", icon: "Home" },
  { id: 4, name: "Plot", slug: "plot", icon: "Landmark" },
  { id: 5, name: "PG / Co-Living", slug: "pg", icon: "BedDouble" },
  { id: 6, name: "Commercial", slug: "commercial", icon: "Store" },
  { id: 7, name: "Office", slug: "office", icon: "Briefcase" },
  { id: 8, name: "Shop", slug: "shop", icon: "Store" },
];

export const demoLocations = [
  { id: 1, name: "Sarpavaram", slug: "sarpavaram", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "16.9942", longitude: "82.2532" },
  { id: 2, name: "Ramanayyapeta", slug: "ramanayyapeta", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "16.9780", longitude: "82.2390" },
  { id: 3, name: "Bhanugudi", slug: "bhanugudi", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "16.9634", longitude: "82.2351" },
  { id: 4, name: "Ashok Nagar", slug: "ashok-nagar", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "16.9721", longitude: "82.2458" },
  { id: 5, name: "Indrapalem", slug: "indrapalem", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "16.9714", longitude: "82.2272" },
  { id: 6, name: "Madhavapatnam", slug: "madhavapatnam", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "17.0085", longitude: "82.2410" },
  { id: 7, name: "Venkat Nagar", slug: "venkat-nagar", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "16.9680", longitude: "82.2405" },
  { id: 8, name: "Vakalapudi", slug: "vakalapudi", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "17.0210", longitude: "82.2740" },
  { id: 9, name: "Jagannaickpur", slug: "jagannaickpur", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "16.9482", longitude: "82.2312" },
  { id: 10, name: "Turangi", slug: "turangi", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "16.9360", longitude: "82.2290" },
  { id: 11, name: "Kakinada Rural", slug: "kakinada-rural", kind: "locality", city: "Kakinada", state: "Andhra Pradesh", latitude: "16.9850", longitude: "82.2150" },
  { id: 12, name: "Amalapuram", slug: "amalapuram", kind: "city", city: "Amalapuram", state: "Andhra Pradesh", latitude: "16.5787", longitude: "82.0061" },
];

export let demoProperties: DemoProperty[] = [
  {
    id: 101,
    sellerId: 901,
    sellerName: "Srinivas Rao (Demo Seller)",
    sellerType: "Owner",
    sellerPhone: "98480 12345 (Demo Contact)",
    sellerEmail: "demo-seller@nivaas.in",
    title: "Independent House Near College Road, Amalapuram",
    slug: "independent-house-near-college-road-amalapuram",
    description: "Newly constructed G+1 independent house featuring modern exterior stone cladding, private compound wall with gate, and external staircase leading to the first-floor balcony. Includes a spacious living hall with marble flooring, ceiling fans, and wall-mounted TV console panel. Visible road access and quiet residential surroundings.",
    purposeId: 1,
    purpose: "Buy",
    purposeSlug: "buy",
    propertyTypeId: 2,
    propertyType: "Independent House",
    propertyTypeSlug: "independent-house",
    price: "7800000",
    rentPeriod: null,
    deposit: null,
    bedrooms: 3,
    bathrooms: "3",
    areaSqft: 1850,
    furnishing: "Semi-Furnished",
    parking: "Covered Parking",
    societyName: null,
    locationId: 12,
    locationName: "Amalapuram",
    locality: "Near College Road",
    city: "Amalapuram",
    district: "Dr. B. R. Ambedkar Konaseema",
    state: "Andhra Pradesh",
    pincode: "533201",
    streetAddress: "College Road Area",
    locationVisibility: "area_city",
    latitude: "16.5787",
    longitude: "82.0061",
    locationPrecision: "locality",
    status: "published",
    verificationStatus: "unverified",
    createdAt: new Date("2026-09-28T08:00:00Z"),
    imageUrl: "/properties/independent-house-elevation.jpg",
    imageAlt: "G+1 Independent House exterior with stone facade and compound wall in Amalapuram",
    images: [
      { url: "/properties/independent-house-elevation.jpg", altText: "G+1 Independent House exterior with stone facade and balcony" },
      { url: "/properties/living-room-marble-hall.jpg", altText: "Spacious living hall with marble flooring and TV wall console" },
    ],
    dataSource: "sample",
    isSampleListing: true,
  },
  {
    id: 102,
    sellerId: 902,
    sellerName: "Ravi Kumar (Demo Seller)",
    sellerType: "Owner",
    sellerPhone: "98480 23456 (Demo Contact)",
    sellerEmail: "demo-ravi@nivaas.in",
    title: "2BHK Apartment with Balcony Near GBC Road, Amalapuram",
    slug: "2bhk-apartment-with-balcony-gbc-road-amalapuram",
    description: "Well-lit residential apartment featuring a spacious living and dining hall with tiled flooring, wall-mounted entertainment unit, dining area, and sliding glass doors opening to the balcony. Master bedroom includes decorative false ceiling lighting and split AC unit. Situated in a residential building with wide paved internal road and palm tree landscaping.",
    purposeId: 1,
    purpose: "Buy",
    purposeSlug: "buy",
    propertyTypeId: 1,
    propertyType: "Apartment",
    propertyTypeSlug: "apartment",
    price: "4600000",
    rentPeriod: null,
    deposit: null,
    bedrooms: 2,
    bathrooms: "2",
    areaSqft: 1180,
    furnishing: "Semi-Furnished",
    parking: "Available",
    societyName: "Green Palm Residency",
    locationId: 12,
    locationName: "Amalapuram",
    locality: "GBC Road",
    city: "Amalapuram",
    district: "Dr. B. R. Ambedkar Konaseema",
    state: "Andhra Pradesh",
    pincode: "533201",
    streetAddress: "Near GBC Road",
    locationVisibility: "area_city",
    latitude: "16.5820",
    longitude: "82.0110",
    locationPrecision: "locality",
    status: "published",
    verificationStatus: "unverified",
    createdAt: new Date("2026-09-28T08:15:00Z"),
    imageUrl: "/properties/apartment-interior-living-dining.jpg",
    imageAlt: "2BHK Apartment living room and dining area in Amalapuram",
    images: [
      { url: "/properties/apartment-interior-living-dining.jpg", altText: "Living and dining hall with balcony sliding glass door" },
      { url: "/properties/bedroom-false-ceiling.jpg", altText: "Master bedroom with false ceiling ambient lighting and split AC" },
      { url: "/properties/apartment-community-exterior.jpg", altText: "Residential apartment complex with paved road and palm trees" },
    ],
    dataSource: "sample",
    isSampleListing: true,
  },
  {
    id: 103,
    sellerId: 903,
    sellerName: "Lakshmi Devi (Demo Seller)",
    sellerType: "Owner",
    sellerPhone: "98480 34567 (Demo Contact)",
    sellerEmail: "demo-lakshmi@nivaas.in",
    title: "Residential Apartment in Gated Community, Amalapuram",
    slug: "residential-apartment-gated-community-amalapuram-rent",
    description: "Apartment situated in a quiet residential community with wide paved access roads, pedestrian footpaths, and landscaped surroundings. Well-lit interiors with living area, dining space, and balcony access.",
    purposeId: 2,
    purpose: "Rent",
    purposeSlug: "rent",
    propertyTypeId: 1,
    propertyType: "Apartment",
    propertyTypeSlug: "apartment",
    price: "16000",
    rentPeriod: "monthly",
    deposit: "50000",
    bedrooms: 2,
    bathrooms: "2",
    areaSqft: 1100,
    furnishing: "Semi-Furnished",
    parking: "Available",
    societyName: "Sri Venkateswara Enclave",
    locationId: 12,
    locationName: "Amalapuram",
    locality: "Clock Tower Area",
    city: "Amalapuram",
    district: "Dr. B. R. Ambedkar Konaseema",
    state: "Andhra Pradesh",
    pincode: "533201",
    streetAddress: "Clock Tower Area, Amalapuram",
    locationVisibility: "area_city",
    latitude: "16.5750",
    longitude: "82.0080",
    locationPrecision: "locality",
    status: "published",
    verificationStatus: "unverified",
    createdAt: new Date("2026-09-28T08:30:00Z"),
    imageUrl: "/properties/apartment-community-exterior.jpg",
    imageAlt: "Gated community apartment complex with paved internal street in Amalapuram",
    images: [
      { url: "/properties/apartment-community-exterior.jpg", altText: "Apartment building complex with wide paved road and palm trees" },
      { url: "/properties/apartment-interior-living-dining.jpg", altText: "Living room interior with dining space" },
      { url: "/properties/bedroom-false-ceiling.jpg", altText: "Bedroom with false ceiling lighting and split AC" },
    ],
    dataSource: "sample",
    isSampleListing: true,
  },
];

export function deleteDemoProperty(identifier?: string | number, slug?: string) {
  const targetId = identifier ? String(identifier) : "";
  const targetSlug = slug || "";
  const index = demoProperties.findIndex(p => 
    (targetId && String(p.id) === targetId) || 
    (targetId && p.slug === targetId) ||
    (targetSlug && p.slug === targetSlug) ||
    (targetSlug && String(p.id) === targetSlug)
  );
  if (index >= 0) {
    const [deleted] = demoProperties.splice(index, 1);
    return deleted;
  }
  return null;
}

export function addDemoProperty(property: DemoProperty) {
  // Check if property with slug already exists
  const existingIdx = demoProperties.findIndex(p => p.slug === property.slug);
  if (existingIdx >= 0) {
    demoProperties[existingIdx] = property;
  } else {
    demoProperties.unshift(property);
  }
  return property;
}

export function updateDemoProperty(identifier: string | number, updates: Partial<DemoProperty>) {
  const existing = demoProperties.find(p => p.slug === String(identifier) || p.id === Number(identifier));
  if (existing) {
    Object.assign(existing, updates);
    return existing;
  }
  return null;
}
