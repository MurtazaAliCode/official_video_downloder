import express, { type Request, Response, NextFunction } from "express";
// FIXED: Local imports mein .js extension add karna zaroori hai
import { registerRoutes } from "./routes.js";
import { serveStatic, log } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware: Safai ke liye accha hai
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // CRITICAL: Yahan aapki saari routes load hoti hain (routes.ts se)
  const server = await registerRoutes(app);

  // SANITY CHECK ROUTE: Yeh check karne ke liye ki Express theek se chal raha hai ya nahi.
  app.get('/api/status-check', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'Server is running and routes are active!' });
  });

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Console mein error print karein takay debugging aasan ho
    console.error(`Unhandled API Error (${status}):`, err);

    res.status(status).json({ message });
  });

  // Development mein Vite server ko comment kiya - frontend alag chal raha hai
  // if (app.get("env") === "development") {
  //   await setupVite(app, server);
  // }

  // Server start karein - Render ke default port use karne ke liye adjust
  const port = parseInt(process.env.PORT || '5000', 10); // Updated to match .env
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();