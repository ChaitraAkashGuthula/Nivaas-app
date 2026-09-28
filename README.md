# NIVAAS

**NIVAAS** is a full-stack real-estate platform for discovering, listing, and managing properties in India. It supports buying, renting, PG/co-living, and commercial property searches, with precise location-based filtering, multilingual UI, and a clean mobile-first design.

---

## Features

| Category | Details |
|---|---|
| **Property Search** | Full-text + structured search by location, city, locality |
| **Buy / Rent / PG / Commercial** | Separate purpose filters on all listings |
| **Budget Filtering** | Min / Max price filter (₹5L → ₹10Cr+) |
| **Property Type Filter** | Apartment, Independent House, Villa, Plot, PG, Commercial |
| **Location Isolation** | Strict city-level search prevents cross-city contamination |
| **Property Listings** | Multi-image upload, full address, price, seller contact |
| **Property Detail** | Gallery, specs, location, seller info, map |
| **Saved Properties** | Bookmark/unbookmark; live sync on delete/edit |
| **Saved Searches** | Persist and revisit previous search queries |
| **Your Properties** | Seller dashboard — view, edit, delete own listings |
| **User Profile** | Name, email display |
| **Settings** | Language (English / Telugu / Hindi), Light / Dark / System theme |
| **Multilingual UI** | i18n via `LanguageContext` — English, Telugu, Hindi |
| **Authentication** | OAuth-based login via the Manus identity platform; JWT session cookies |
| **Privacy** | Location visibility control per listing (locality / area+city / full address) |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool & dev server |
| Wouter | Client-side routing |
| Tailwind CSS 4 | Styling (utility + custom CSS vars) |
| tRPC + TanStack Query | Type-safe API client with caching |
| Radix UI | Accessible component primitives |
| Lucide React | Icons |
| next-themes | Theme (light/dark/system) |
| Framer Motion | Animations |
| Sonner | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Express.js | HTTP server |
| tRPC | Type-safe RPC API layer |
| Drizzle ORM | Database ORM |
| MySQL 2 | Database driver |
| Jose | JWT session signing/verification |
| Dotenv | Environment variable loading |
| tsx | TypeScript execution (dev) |
| esbuild | TypeScript compilation (prod) |

### Database
| Technology | Purpose |
|---|---|
| MySQL | Primary database (optional — app works without DB using in-memory seed data) |
| Drizzle Kit | Schema management & migrations |

### Storage
| Technology | Purpose |
|---|---|
| AWS S3 (via Manus Forge presigned URLs) | Property image storage |

---

## Project Structure

```
nivaas/
│
├── client/                  # Frontend (React + Vite)
│   ├── index.html           # HTML entry point
│   ├── public/              # Static assets (logo, property images)
│   │   ├── assets/          # Branding assets
│   │   ├── images/          # Static images
│   │   └── properties/      # Uploaded property photos
│   └── src/
│       ├── App.tsx          # Root component + routing
│       ├── main.tsx         # Vite entry point
│       ├── index.css        # Global styles + CSS custom properties
│       ├── _core/           # Auth hooks, core client utilities
│       ├── components/      # Shared UI components
│       │   ├── ui/          # Radix-based primitive components
│       │   ├── NivaasChrome.tsx  # Header, SearchBar, PropertyCard
│       │   ├── DashboardLayout.tsx
│       │   ├── EditPropertyDialog.tsx
│       │   └── ...
│       ├── contexts/        # React contexts (Theme, Language/i18n)
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Utilities (trpc client, favorites, localStorage)
│       └── pages/
│           ├── Home.tsx
│           ├── Search.tsx
│           ├── PropertyDetail.tsx
│           ├── Sell.tsx
│           ├── Explore.tsx
│           ├── Reviews.tsx
│           └── dashboard/
│               ├── SavedHomes.tsx
│               ├── SavedSearches.tsx
│               ├── YourProperties.tsx
│               ├── Profile.tsx
│               └── Settings.tsx
│
├── server/                  # Backend (Express + tRPC)
│   ├── _core/               # Platform core (OAuth, JWT, storage proxy, Vite bridge)
│   │   ├── index.ts         # Server entry point
│   │   ├── env.ts           # Environment variable access
│   │   ├── oauth.ts         # OAuth callback handler
│   │   ├── sdk.ts           # Manus OAuth/session SDK
│   │   ├── storageProxy.ts  # S3 image proxy via /manus-storage/*
│   │   └── ...
│   ├── db.ts                # Data access layer (Drizzle + in-memory fallback)
│   ├── demoData.ts          # Seed/in-memory property data
│   ├── routers.ts           # tRPC router definitions
│   ├── storage.ts           # S3 upload/download helpers
│   └── seed.ts              # Database seeding script
│
├── shared/                  # Code shared between client and server
│   ├── const.ts             # Shared constants
│   ├── types.ts             # Shared TypeScript types
│   ├── searchParser.ts      # Natural-language search query parser
│   └── locationUtils.ts     # Location normalization & matching logic
│
├── drizzle/                 # Database schema & migrations
│   ├── schema.ts            # Drizzle ORM table definitions
│   ├── relations.ts         # Table relations
│   └── migrations/          # Auto-generated SQL migrations
│
├── .env.example             # Environment variable template (safe to commit)
├── .gitignore               # Git exclusion rules
├── package.json             # Root package config & scripts
├── pnpm-lock.yaml           # Lockfile (pnpm)
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration (aliases, plugins, build)
├── drizzle.config.ts        # Drizzle Kit configuration
└── vitest.config.ts         # Vitest test configuration
```

---

## Requirements

- **Node.js** ≥ 22 (tested with v22.17)
- **pnpm** ≥ 10 (`npm install -g pnpm`)
- **MySQL** ≥ 8 (optional — the app runs without a database using in-memory seed data)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/nivaas.git
cd nivaas

# Install dependencies (pnpm is required)
pnpm install
```

---

## Environment Variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

See [`.env.example`](.env.example) for the full list of required variables and descriptions.

**Minimum required for local development without a database:**
```
PORT=3000
NODE_ENV=development
JWT_SECRET=<any-long-random-string>
OAUTH_SERVER_URL=<your-oauth-server-url>
VITE_APP_ID=<your-app-id>
```

**To enable the MySQL database (optional):**
```
DATABASE_URL=mysql://user:password@localhost:3306/nivaas
```

**To enable image uploads (requires Manus Forge):**
```
BUILT_IN_FORGE_API_URL=<forge-api-url>
BUILT_IN_FORGE_API_KEY=<forge-api-key>
```

---

## Development

```bash
# Start the full-stack development server (backend + Vite HMR)
pnpm dev
```

The server starts on `http://localhost:3000` by default (or the next available port).

---

## Production Build

```bash
# Build frontend (Vite) + backend (esbuild)
pnpm build

# Start the production server
pnpm start
```

Build output is placed in `dist/`:
- `dist/public/` — frontend static files
- `dist/index.js` — bundled server entry point

---

## Database Setup

> The database is **optional**. Without it, the app runs using in-memory property data from `server/demoData.ts`.

```bash
# Set DATABASE_URL in your .env, then run:
pnpm db:push          # Generate & run migrations
```

To seed initial data:
```bash
node -r dotenv/config server/seed.ts
```

---

## Type Checking

```bash
pnpm check            # Run TypeScript type checker (no emit)
```

---

## Testing

```bash
pnpm test             # Run Vitest test suite
```

---

## Code Formatting

```bash
pnpm format           # Format all files with Prettier
```

---

## Routing

| URL | Page |
|---|---|
| `/` | Home — hero, featured listings, search |
| `/search` | Search results with filters |
| `/property/:slug` | Property detail page |
| `/sell` | Create / list a property |
| `/saved-properties` | Saved (bookmarked) properties |
| `/saved-searches` | Saved search queries |
| `/your-properties` | Your own listings |
| `/profile` | User profile |
| `/settings` | Language & theme preferences |
| `/explore` | Explore cities / map view |
| `/reviews` | Community reviews |
| `/login` | Login |

---

## API

All API calls go through **tRPC** at `/api/trpc/*`.

Key procedures:

| Procedure | Type | Description |
|---|---|---|
| `catalog.home` | query | Featured listings for home page |
| `catalog.search` | query | Search with location/type/purpose/budget filters |
| `catalog.propertyBySlug` | query | Single property detail |
| `catalog.createProperty` | mutation | Create a new listing |
| `catalog.updateProperty` | mutation | Edit an existing listing |
| `catalog.deleteProperty` | mutation | Delete a listing |
| `catalog.userProperties` | query | Properties belonging to a user |
| `auth.me` | query | Current authenticated user |
| `auth.logout` | mutation | Sign out |

---

## Security Notes

- Session cookies are **HttpOnly**, signed with `JWT_SECRET`
- CSRF protection on OAuth callback via nonce validation
- Property mutations are scoped to the authenticated user on the backend
- `BUILT_IN_FORGE_API_KEY` is a **server-only** secret — never exposed in frontend code
- `DATABASE_URL` is a **server-only** secret — never exposed in frontend code
- The only frontend-exposed env vars are prefixed `VITE_` (app ID, analytics — non-sensitive)

---

## Deployment

The application is a single Express server that:
1. Serves the compiled React frontend as static files from `dist/public/`
2. Handles the tRPC API at `/api/trpc/*`
3. Handles OAuth callback at `/api/oauth/callback`
4. Proxies image downloads from S3 at `/manus-storage/*`

To deploy:
1. Run `pnpm build`
2. Set all required environment variables on the server
3. Run `node dist/index.js` (or use a process manager like PM2)

---

## License

MIT — see [LICENSE](LICENSE)
