import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { locations, properties, propertyImages, propertyTypes, purposes, users } from "../drizzle/schema";
import { demoLocations, demoProperties, demoPropertyTypes, demoPurposes } from "./demoData";

export async function seed() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is not configured");

  console.log("[Seed] Preparing NIVAAS demo data...");

  // Purge existing
  await db.delete(propertyImages);
  await db.delete(properties);
  await db.delete(users);
  await db.delete(locations);
  await db.delete(propertyTypes);
  await db.delete(purposes);

  // Insert seed users
  const demoUsers = [
    { openId: "seed-user-1", name: "Srinivas Rao", email: "srinivas.rao@demo-nivaas.in", loginMethod: "seed" },
    { openId: "seed-user-2", name: "Satyanarayana V", email: "satyanarayana.v@demo-nivaas.in", loginMethod: "seed" },
    { openId: "seed-user-3", name: "Lakshmi Devi", email: "lakshmi.devi@demo-nivaas.in", loginMethod: "seed" },
    { openId: "seed-user-4", name: "Suresh Babu K", email: "suresh.babu@demo-nivaas.in", loginMethod: "seed" },
    { openId: "seed-user-5", name: "Venkatesh M", email: "venkatesh.m@demo-nivaas.in", loginMethod: "seed" },
    { openId: "seed-user-6", name: "Prasad Varma", email: "prasad.varma@demo-nivaas.in", loginMethod: "seed" },
    { openId: "seed-user-7", name: "Harika P", email: "harika.p@demo-nivaas.in", loginMethod: "seed" },
    { openId: "seed-user-8", name: "Ravi Kumar", email: "ravi.kumar@demo-nivaas.in", loginMethod: "seed" },
    { openId: "seed-user-9", name: "Anjali K", email: "anjali.k@demo-nivaas.in", loginMethod: "seed" },
    { openId: "seed-user-10", name: "Madhavi Latha", email: "madhavi.latha@demo-nivaas.in", loginMethod: "seed" },
  ];
  await db.insert(users).values(demoUsers);
  const insertedUsers = await db.select().from(users);

  await db.insert(purposes).values(demoPurposes.map(p => ({ name: p.name, slug: p.slug })));
  const insertedPurposes = await db.select().from(purposes);

  await db.insert(propertyTypes).values(demoPropertyTypes.map(t => ({ name: t.name, slug: t.slug, icon: t.icon })));
  const insertedTypes = await db.select().from(propertyTypes);

  await db.insert(locations).values(
    demoLocations.map(l => ({
      name: l.name,
      slug: l.slug,
      kind: l.kind as "locality" | "city" | "landmark",
      city: l.city,
      state: l.state,
      latitude: l.latitude,
      longitude: l.longitude,
    }))
  );
  const insertedLocations = await db.select().from(locations);

  const getU = (sellerId: number) => {
    const idx = (sellerId - 1) % insertedUsers.length;
    return insertedUsers[idx].id;
  };
  const getP = (slug: string) => insertedPurposes.find(x => x.slug === slug)!.id;
  const getT = (slug: string) => insertedTypes.find(x => x.slug === slug)!.id;
  const getL = (slug: string) => insertedLocations.find(x => x.slug === slug)!.id;

  const dbProperties = demoProperties.map(p => ({
    sellerId: getU(p.sellerId),
    title: p.title,
    slug: p.slug,
    description: p.description,
    purposeId: getP(p.purposeSlug),
    propertyTypeId: getT(p.propertyTypeSlug),
    price: p.price,
    rentPeriod: p.rentPeriod ?? null,
    deposit: p.deposit ?? null,
    bedrooms: p.bedrooms ?? null,
    bathrooms: p.bathrooms ?? null,
    areaSqft: p.areaSqft ?? null,
    furnishing: p.furnishing ?? null,
    parking: p.parking ?? null,
    societyName: p.societyName ?? null,
    locationId: getL(p.locationName.toLowerCase().replace(/\s+/g, "-")),
    latitude: p.latitude,
    longitude: p.longitude,
    locationPrecision: p.locationPrecision,
    status: p.status,
    verificationStatus: p.verificationStatus,
    createdAt: p.createdAt,
    publishedAt: p.createdAt,
  }));

  await db.insert(properties).values(dbProperties);
  const insertedProps = await db.select().from(properties);

  const allImages: Array<{ propertyId: number; url: string; altText: string; isPrimary: boolean; sortOrder: number }> = [];

  for (const p of demoProperties) {
    const propRecord = insertedProps.find(ip => ip.slug === p.slug);
    if (!propRecord) continue;

    p.images.forEach((img, idx) => {
      allImages.push({
        propertyId: propRecord.id,
        url: img.url,
        altText: img.altText,
        isPrimary: idx === 0,
        sortOrder: idx,
      });
    });
  }

  if (allImages.length > 0) {
    await db.insert(propertyImages).values(allImages);
  }

  console.log(`[Seed] Successfully inserted ${demoProperties.length} realistic NIVAAS demo properties in Kakinada / East Godavari.`);
}
