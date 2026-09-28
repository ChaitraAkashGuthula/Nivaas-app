import {
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const locations = mysqlTable(
  "locations",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    kind: mysqlEnum("kind", ["city", "locality", "landmark"]).default("locality").notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 120 }).notNull(),
    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    slugIndex: uniqueIndex("locations_slug_unique").on(table.slug),
    cityIndex: index("locations_city_idx").on(table.city),
  }),
);

export const propertyTypes = mysqlTable(
  "property_types",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 40 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ slugIndex: uniqueIndex("property_types_slug_unique").on(table.slug) }),
);

export const purposes = mysqlTable(
  "purposes",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({ slugIndex: uniqueIndex("purposes_slug_unique").on(table.slug) }),
);

export const properties = mysqlTable(
  "properties",
  {
    id: int("id").autoincrement().primaryKey(),
    sellerId: int("sellerId").notNull().references(() => users.id),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    description: text("description"),
    purposeId: int("purposeId").notNull().references(() => purposes.id),
    propertyTypeId: int("propertyTypeId").notNull().references(() => propertyTypes.id),
    price: decimal("price", { precision: 14, scale: 2 }).notNull(),
    rentPeriod: varchar("rentPeriod", { length: 40 }),
    deposit: decimal("deposit", { precision: 14, scale: 2 }),
    bedrooms: int("bedrooms"),
    bathrooms: decimal("bathrooms", { precision: 4, scale: 1 }),
    areaSqft: int("areaSqft"),
    furnishing: varchar("furnishing", { length: 60 }),
    parking: varchar("parking", { length: 60 }),
    societyName: varchar("societyName", { length: 140 }),
    locationId: int("locationId").notNull().references(() => locations.id),
    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),
    locationPrecision: mysqlEnum("locationPrecision", ["exact", "street", "locality"]).default("locality").notNull(),
    status: mysqlEnum("status", ["draft", "pending_review", "published", "paused", "sold", "rented", "rejected", "archived"]).default("draft").notNull(),
    verificationStatus: mysqlEnum("verificationStatus", ["unverified", "pending", "verified", "rejected"]).default("unverified").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    publishedAt: timestamp("publishedAt"),
  },
  table => ({
    slugIndex: uniqueIndex("properties_slug_unique").on(table.slug),
    browseIndex: index("properties_browse_idx").on(table.status, table.purposeId, table.propertyTypeId, table.createdAt),
    locationIndex: index("properties_location_idx").on(table.locationId, table.status),
    sellerIndex: index("properties_seller_idx").on(table.sellerId, table.status),
    priceIndex: index("properties_price_idx").on(table.price),
  }),
);

export const propertyImages = mysqlTable(
  "property_images",
  {
    id: int("id").autoincrement().primaryKey(),
    propertyId: int("propertyId").notNull().references(() => properties.id),
    url: varchar("url", { length: 700 }).notNull(),
    altText: varchar("altText", { length: 220 }).notNull(),
    isPrimary: boolean("isPrimary").default(false).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    propertyIndex: index("property_images_property_idx").on(table.propertyId, table.sortOrder),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type PropertyType = typeof propertyTypes.$inferSelect;
export type Purpose = typeof purposes.$inferSelect;
