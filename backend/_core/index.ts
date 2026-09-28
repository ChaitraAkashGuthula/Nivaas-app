import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

// ─── Port Utilities ─────────────────────────────────────────────────────────

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ─── Simple In-Memory Rate Limiter ──────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000; // 1-minute window
const RATE_LIMIT = 120;        // requests per window per IP

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")[0]
      .trim() ??
    req.socket.remoteAddress ??
    "unknown";

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }

  entry.count++;
  if (entry.count > RATE_LIMIT) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }
  next();
}

// Prune stale rate-limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of Array.from(rateLimitMap.entries())) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60_000);


// ─── Security Headers ────────────────────────────────────────────────────────

function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

// ─── CORS ────────────────────────────────────────────────────────────────────

function corsHandler(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);

  const origin = req.headers.origin;

  if (process.env.NODE_ENV !== "production" || !allowedOrigins.length) {
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}

// ─── Safe Error Handler ──────────────────────────────────────────────────────

function safeErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    console.error("[Server Error]", err);
  } else {
    console.error("[Server Error]", err instanceof Error ? err.message : String(err));
  }
  if (res.headersSent) return;
  res.status(500).json({ error: "An unexpected server error occurred." });
}

// ─── Server Bootstrap ────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Global middleware — order matters
  app.use(corsHandler);
  app.use(securityHeaders);
  app.use(rateLimit);

  // Body parsers with generous size limit for base64 image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health check — no auth required; safe for load balancers/uptime monitors
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Application routes
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError({ error, path }) {
        if (error.code !== "NOT_FOUND" && error.code !== "UNAUTHORIZED") {
          console.error(`[tRPC] ${path ?? "unknown"}:`, error.message);
        }
      },
    }),
  );

  // Vite HMR (dev) or compiled static files (prod)
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Safe error handler — must be last
  app.use(safeErrorHandler);

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[NIVAAS] Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
