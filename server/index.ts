import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes"; // your real route registrations
import { setupVite, serveStatic, log } from "./vite"; // your vite helpers

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger middleware for /api routes with response body capture
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
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

// Main async setup
(async () => {
  try {
    // Register all your real API routes here, returns http.Server
    const server = await registerRoutes(app);

    // Central error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error(err);
    });

    // Dev vs Production setup for serving frontend and hot reload
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use "localhost" instead of "0.0.0.0" to avoid ENOTSUP on Windows
    const port = 5000;
    const host = "localhost";

    server.listen(port, host, () => {
      log(`Server running at http://${host}:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
