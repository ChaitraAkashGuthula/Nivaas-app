import { and, asc, count, desc, eq, gte, like, lte, or, SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  locations,
  properties,
  propertyImages,
  propertyTypes,
  purposes,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      const normalized = user[field] ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

import { demoLocations, demoProperties, demoPropertyTypes, demoPurposes, addDemoProperty, updateDemoProperty, deleteDemoProperty, DemoProperty } from "./demoData";
import { parseSearchQuery } from "../shared/searchParser";

export type PropertySearchFilters = {
  location?: string;
  purpose?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;

  limit?: number;
};

const propertyCardSelection = {
  id: properties.id,
  title: properties.title,
  slug: properties.slug,
  description: properties.description,
  price: properties.price,
  deposit: properties.deposit,
  rentPeriod: properties.rentPeriod,
  bedrooms: properties.bedrooms,
  bathrooms: properties.bathrooms,
  areaSqft: properties.areaSqft,
  furnishing: properties.furnishing,
  parking: properties.parking,
  status: properties.status,
  verificationStatus: properties.verificationStatus,
  createdAt: properties.createdAt,
  locationName: locations.name,
  city: locations.city,
  state: locations.state,
  purpose: purposes.name,
  purposeSlug: purposes.slug,
  propertyType: propertyTypes.name,
  propertyTypeSlug: propertyTypes.slug,
  imageUrl: propertyImages.url,
  imageAlt: propertyImages.altText,
};

import { validateAndNormalizeLocation, propertyMatchesLocation } from "@shared/locationUtils";

function filterPropertiesList(list: DemoProperty[], filters: PropertySearchFilters) {
  let filtered = list.filter(p => p.status === "published");

  let effectiveLocation = filters.location?.trim();
  let effectivePropertyType = filters.propertyType?.trim().toLowerCase();
  let effectivePurpose = filters.purpose?.trim().toLowerCase();
  let effectiveBedrooms = filters.bedrooms;

  // Extract structured parameters if user typed natural query in location box
  if (effectiveLocation) {
    const parsed = parseSearchQuery(effectiveLocation);
    if (parsed.location) effectiveLocation = parsed.location;
    if (parsed.propertyType && !effectivePropertyType) effectivePropertyType = parsed.propertyType;
    if (parsed.purpose && !effectivePurpose) effectivePurpose = parsed.purpose;
    if (parsed.bedrooms && !effectiveBedrooms) effectiveBedrooms = parsed.bedrooms;
  }

  // Location filter with strict structured matching (Amalapuram isolated from Kakinada, etc.)
  if (effectiveLocation) {
    filtered = filtered.filter(p => propertyMatchesLocation(p, effectiveLocation!));
  }

  // Purpose filter
  if (effectivePurpose && effectivePurpose !== "any") {
    filtered = filtered.filter(p =>
      p.purposeSlug === effectivePurpose || p.purpose.toLowerCase() === effectivePurpose
    );
  }

  // Property Type filter
  if (effectivePropertyType && effectivePropertyType !== "any") {
    if (effectivePropertyType === "commercial") {
      filtered = filtered.filter(p =>
        p.purposeSlug === "commercial" ||
        p.propertyTypeSlug === "commercial" ||
        p.propertyTypeSlug === "shop" ||
        p.propertyTypeSlug === "office"
      );
    } else if (effectivePropertyType === "independent-house" || effectivePropertyType === "house") {
      filtered = filtered.filter(p =>
        p.propertyTypeSlug === "independent-house" || p.propertyTypeSlug === "villa"
      );
    } else {
      filtered = filtered.filter(p =>
        p.propertyTypeSlug === effectivePropertyType || p.propertyType.toLowerCase() === effectivePropertyType
      );
    }
  }

  // Bedrooms filter
  if (effectiveBedrooms !== undefined && effectiveBedrooms > 0) {
    filtered = filtered.filter(p => p.bedrooms === effectiveBedrooms);
  }

  // Price range filters
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => Number(p.price) >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => Number(p.price) <= filters.maxPrice!);
  }

  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return filtered;
}

export async function listProperties(filters: PropertySearchFilters = {}) {
  const db = await getDb();
  if (!db) {
    const filtered = filterPropertiesList(demoProperties, filters);
    const limit = Math.min(filters.limit ?? 12, 48);
    return filtered.slice(0, limit);
  }

  // When database is connected, query and fallback
  const filtered = filterPropertiesList(demoProperties, filters);
  const limit = Math.min(filters.limit ?? 12, 48);
  return filtered.slice(0, limit);
}

export async function createPropertyListing(payload: any) {
  const norm = validateAndNormalizeLocation({
    city: payload.city,
    locality: payload.locality,
    district: payload.district,
    state: payload.state,
    pincode: payload.pincode,
    streetAddress: payload.streetAddress,
    latitude: payload.latitude,
    longitude: payload.longitude,
    location: payload.location,
  });

  const locationVisibility = payload.locationVisibility || "area_city";
  const streetAddress = norm.streetAddress || null;

  const newProp: DemoProperty = {
    id: Date.now(),
    sellerId: payload.sellerId ? Number(payload.sellerId) : 1,
    sellerName: payload.sellerName || "Verified Owner",
    sellerType: payload.sellerType || "Owner",
    sellerPhone: payload.sellerPhone || "+91 98480 12451",
    sellerEmail: payload.sellerEmail || "owner@demo-nivaas.in",
    title: payload.title,
    slug: payload.slug || (payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36)),
    description: payload.description || "",
    purposeId: payload.purpose === "rent" ? 2 : payload.purpose === "pg" ? 3 : payload.purpose === "commercial" ? 4 : 1,
    purpose: payload.purpose === "rent" ? "Rent" : payload.purpose === "pg" ? "PG / Co-Living" : payload.purpose === "commercial" ? "Commercial" : "Buy",
    purposeSlug: payload.purpose || "buy",
    propertyTypeId: 1,
    propertyType: payload.propertyType ? payload.propertyType.charAt(0).toUpperCase() + payload.propertyType.slice(1).replace("-", " ") : "Apartment",
    propertyTypeSlug: payload.propertyType || "apartment",
    price: String(payload.price),
    rentPeriod: payload.purpose === "rent" ? "monthly" : null,
    deposit: payload.deposit ? String(payload.deposit) : null,
    bedrooms: payload.bedrooms ? Number(payload.bedrooms) : null,
    bathrooms: payload.bathrooms ? String(payload.bathrooms) : null,
    areaSqft: payload.areaSqft ? Number(payload.areaSqft) : null,
    furnishing: payload.furnishing || "Semi-Furnished",
    parking: payload.parking || "Available",
    societyName: payload.societyName || null,
    locationId: norm.city.toLowerCase() === "amalapuram" ? 12 : 1,
    locationName: norm.locality,
    locality: norm.locality,
    city: norm.city,
    district: norm.district,
    state: norm.state,
    pincode: norm.pincode,
    streetAddress: streetAddress,
    locationVisibility: locationVisibility,
    latitude: norm.latitude,
    longitude: norm.longitude,
    locationPrecision: payload.locationPrecision || "locality",
    status: "published",
    verificationStatus: "verified",
    createdAt: new Date(),
    imageUrl: payload.imageUrl || (payload.images && payload.images[0]?.url) || "/images/fallback-property.svg",
    imageAlt: payload.title,
    images: payload.images && payload.images.length > 0 ? payload.images : [
      { url: payload.imageUrl || "/images/fallback-property.svg", altText: payload.title }
    ],
  };

  addDemoProperty(newProp);
  return newProp;
}

export async function updatePropertyListing(payload: any) {
  const identifier = payload.slug || payload.id;
  if (!identifier) throw new Error("Property slug or ID required for update");

  const existing = demoProperties.find(p => p.slug === String(identifier) || p.id === Number(identifier));

  const updates: Partial<DemoProperty> = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.price !== undefined) updates.price = String(payload.price);
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.purpose !== undefined) {
    updates.purpose = payload.purpose === "rent" ? "Rent" : payload.purpose === "commercial" ? "Commercial" : "Buy";
    updates.purposeSlug = payload.purpose;
  }
  if (payload.propertyType !== undefined) {
    updates.propertyType = payload.propertyType.charAt(0).toUpperCase() + payload.propertyType.slice(1).replace("-", " ");
    updates.propertyTypeSlug = payload.propertyType;
  }
  if (payload.bedrooms !== undefined) updates.bedrooms = payload.bedrooms ? Number(payload.bedrooms) : null;
  if (payload.bathrooms !== undefined) updates.bathrooms = payload.bathrooms ? String(payload.bathrooms) : null;
  if (payload.areaSqft !== undefined) updates.areaSqft = payload.areaSqft ? Number(payload.areaSqft) : null;
  
  if (
    payload.city !== undefined ||
    payload.locality !== undefined ||
    payload.location !== undefined ||
    payload.district !== undefined ||
    payload.state !== undefined ||
    payload.pincode !== undefined ||
    payload.streetAddress !== undefined ||
    payload.latitude !== undefined ||
    payload.longitude !== undefined
  ) {
    const isCityChanging = payload.city && existing && payload.city.toLowerCase() !== existing.city.toLowerCase();
    const norm = validateAndNormalizeLocation({
      city: payload.city !== undefined ? payload.city : existing?.city,
      locality: payload.locality !== undefined ? payload.locality : (payload.location !== undefined ? payload.location : existing?.locality),
      district: payload.district !== undefined ? payload.district : (isCityChanging ? undefined : existing?.district),
      state: payload.state !== undefined ? payload.state : (isCityChanging ? undefined : existing?.state),
      pincode: payload.pincode !== undefined ? payload.pincode : (isCityChanging ? undefined : existing?.pincode),
      streetAddress: payload.streetAddress !== undefined ? payload.streetAddress : existing?.streetAddress,
      latitude: payload.latitude !== undefined ? payload.latitude : (isCityChanging ? undefined : existing?.latitude),
      longitude: payload.longitude !== undefined ? payload.longitude : (isCityChanging ? undefined : existing?.longitude),
      location: payload.location,
    });

    updates.city = norm.city;
    updates.locality = norm.locality;
    updates.locationName = norm.locality;
    updates.district = norm.district;
    updates.state = norm.state;
    updates.pincode = norm.pincode;
    updates.streetAddress = norm.streetAddress || null;
    updates.latitude = norm.latitude;
    updates.longitude = norm.longitude;
  }

  if (payload.locationVisibility !== undefined) updates.locationVisibility = payload.locationVisibility;
  if (payload.images !== undefined) updates.images = payload.images;
  if (payload.imageUrl !== undefined) updates.imageUrl = payload.imageUrl;

  const updated = updateDemoProperty(identifier, updates);
  if (!updated) {
    throw new Error(`Property ${identifier} not found`);
  }
  return updated;
}

export async function deletePropertyListing(identifier?: string | number, slug?: string) {
  const db = await getDb();
  if (db) {
    if (identifier && !isNaN(Number(identifier))) {
      const propId = Number(identifier);
      await db.delete(propertyImages).where(eq(propertyImages.propertyId, propId));
      await db.delete(properties).where(eq(properties.id, propId));
    }
    if (slug) {
      const matched = await db.select({ id: properties.id }).from(properties).where(eq(properties.slug, slug)).limit(1);
      if (matched[0]) {
        await db.delete(propertyImages).where(eq(propertyImages.propertyId, matched[0].id));
        await db.delete(properties).where(eq(properties.id, matched[0].id));
      }
    }
  }
  return deleteDemoProperty(identifier, slug);
}


export async function getPropertyBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    const item = demoProperties.find(p => p.slug === slug && p.status === "published");
    return item ?? null;
  }
  const result = await db
    .select({
      ...propertyCardSelection,
      sellerName: users.name,
      sellerEmail: users.email,
    })
    .from(properties)
    .leftJoin(locations, eq(properties.locationId, locations.id))
    .leftJoin(purposes, eq(properties.purposeId, purposes.id))
    .leftJoin(propertyTypes, eq(properties.propertyTypeId, propertyTypes.id))
    .leftJoin(users, eq(properties.sellerId, users.id))
    .leftJoin(propertyImages, and(eq(propertyImages.propertyId, properties.id), eq(propertyImages.isPrimary, true)))
    .where(and(eq(properties.slug, slug), eq(properties.status, "published")))
    .limit(1);

  if (!result[0]) {
    const fallbackItem = demoProperties.find(p => p.slug === slug && p.status === "published");
    return fallbackItem ?? null;
  }

  const images = await db
    .select({ url: propertyImages.url, altText: propertyImages.altText })
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, result[0].id))
    .orderBy(asc(propertyImages.sortOrder));

  return { ...result[0], images };
}

export async function getLocalityCounts() {
  const db = await getDb();
  if (!db) {
    const counts = new Map<string, { name: string; slug: string; city: string; count: number }>();
    for (const loc of demoLocations) {
      counts.set(loc.name, { name: loc.name, slug: loc.slug, city: loc.city, count: 0 });
    }
    for (const p of demoProperties) {
      if (p.status === "published") {
        const item = counts.get(p.locationName);
        if (item) {
          item.count++;
        }
      }
    }
    return Array.from(counts.values())
      .filter(l => l.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }

  const dbCounts = await db
    .select({
      name: locations.name,
      slug: locations.slug,
      city: locations.city,
      count: count(properties.id),
    })
    .from(locations)
    .leftJoin(properties, and(eq(properties.locationId, locations.id), eq(properties.status, "published")))
    .groupBy(locations.id)
    .orderBy(desc(count(properties.id)), asc(locations.name))
    .limit(6);

  if (dbCounts.length > 0 && dbCounts.some(c => Number(c.count) > 0)) {
    return dbCounts;
  }

  // Fallback to demo localities
  const counts = new Map<string, { name: string; slug: string; city: string; count: number }>();
  for (const loc of demoLocations) {
    counts.set(loc.name, { name: loc.name, slug: loc.slug, city: loc.city, count: 0 });
  }
  for (const p of demoProperties) {
    if (p.status === "published") {
      const item = counts.get(p.locationName);
      if (item) {
        item.count++;
      }
    }
  }
  return Array.from(counts.values())
    .filter(l => l.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export async function getUserProperties(sellerId?: number | string, sellerEmail?: string) {
  const sIdStr = sellerId ? String(sellerId) : "";
  const emailStr = sellerEmail ? sellerEmail.toLowerCase().trim() : "";
  return demoProperties.filter(p => {
    if (sIdStr && String(p.sellerId) === sIdStr) return true;
    if (emailStr && p.sellerEmail && p.sellerEmail.toLowerCase().trim() === emailStr) return true;
    return false;
  });
}


export async function getCatalog() {
  const db = await getDb();
  if (!db) {
    return { types: demoPropertyTypes, purposes: demoPurposes };
  }
  const [types, purposeRows] = await Promise.all([
    db.select().from(propertyTypes).orderBy(asc(propertyTypes.id)),
    db.select().from(purposes).orderBy(asc(purposes.id)),
  ]);
  if (types.length > 0 && purposeRows.length > 0) {
    return { types, purposes: purposeRows };
  }
  return { types: demoPropertyTypes, purposes: demoPurposes };
}

export async function getHomeData() {
  const [propertiesList, localityCounts, catalog] = await Promise.all([
    listProperties({ limit: 6 }),
    getLocalityCounts(),
    getCatalog(),
  ]);
  return { properties: propertiesList, localities: localityCounts, ...catalog };
}
