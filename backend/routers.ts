import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getHomeData, getPropertyBySlug, listProperties, createPropertyListing, updatePropertyListing, deletePropertyListing, getUserProperties } from "./db";
import { TRPCError } from "@trpc/server";

const searchInput = z.object({
  location: z.string().trim().max(120).optional(),
  purpose: z.string().trim().max(40).optional(),
  propertyType: z.string().trim().max(80).optional(),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().min(1).max(10).optional(),

  limit: z.number().int().min(1).max(48).default(12),
});

const propertyPayload = z.object({
  title: z.string().min(3).max(180),
  slug: z.string().optional(),
  purpose: z.string().default("buy"),
  propertyType: z.string().default("apartment"),
  price: z.union([z.number(), z.string()]),
  location: z.string().min(2),
  city: z.string().optional(),
  locality: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  streetAddress: z.string().optional(),
  locationVisibility: z.enum(["locality", "area_city", "full"]).optional(),
  latitude: z.union([z.number(), z.string()]).optional(),
  longitude: z.union([z.number(), z.string()]).optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.union([z.number(), z.string()]).optional(),
  areaSqft: z.number().optional(),
  description: z.string().optional(),
  sellerId: z.union([z.number(), z.string()]).optional(),
  sellerName: z.string().optional(),
  sellerPhone: z.string().optional(),
  sellerEmail: z.string().optional(),
  imageUrl: z.string().optional(),
  images: z.array(z.object({ url: z.string(), altText: z.string() })).optional(),
});

const propertyUpdatePayload = propertyPayload.partial().extend({
  id: z.union([z.number(), z.string()]).optional(),
  slug: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    home: publicProcedure.query(() => getHomeData()),
    search: publicProcedure.input(searchInput).query(({ input }) => listProperties(input)),
    propertyBySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(220) })).query(({ input }) => getPropertyBySlug(input.slug)),

    // ── Authenticated mutations ──────────────────────────────────────────────
    createProperty: protectedProcedure.input(propertyPayload).mutation(async ({ input, ctx }) => {
      // Attach the authenticated user's identity to the listing
      const payload = {
        ...input,
        sellerId: ctx.user.id ?? input.sellerId,
        sellerEmail: ctx.user.email ?? input.sellerEmail,
        sellerName: ctx.user.name ?? input.sellerName,
      };
      const created = await createPropertyListing(payload);
      return { success: true, property: created };
    }),

    updateProperty: protectedProcedure.input(propertyUpdatePayload).mutation(async ({ input, ctx }) => {
      // Authorization: verify the requesting user owns this property
      const identifier = input.slug || input.id;
      if (identifier) {
        const userProps = await getUserProperties(ctx.user.id, ctx.user.email ?? undefined);
        const owns = userProps.some(
          p => p.slug === String(identifier) || p.id === Number(identifier)
        );
        if (!owns) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to edit this property." });
        }
      }
      const updated = await updatePropertyListing(input);
      return { success: true, property: updated };
    }),

    userProperties: publicProcedure.input(z.object({
      sellerId: z.union([z.number(), z.string()]).optional(),
      sellerEmail: z.string().optional(),
    })).query(async ({ input }) => {
      const items = await getUserProperties(input.sellerId, input.sellerEmail);
      return items;
    }),

    deleteProperty: protectedProcedure.input(z.object({
      id: z.union([z.number(), z.string()]).optional(),
      slug: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      // Authorization: verify the requesting user owns this property
      const identifier = input.slug || input.id;
      if (identifier) {
        const userProps = await getUserProperties(ctx.user.id, ctx.user.email ?? undefined);
        const owns = userProps.some(
          p => p.slug === String(identifier) || p.id === Number(identifier)
        );
        if (!owns) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission to delete this property." });
        }
      }
      const deleted = await deletePropertyListing(input.id, input.slug);
      return { success: true, deleted };
    }),
  }),
});

export type AppRouter = typeof appRouter;

