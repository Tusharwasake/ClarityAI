/**
 * ClarityAI Backend Server
 *
 * This is the main server file using functional MVC architecture:
 * - Controllers: Handle HTTP requests (controllers/)
 * - Services: Business logic for summarization and content extraction (services/)
 * - Routes: API endpoint definitions (routes/)
 * - Models: Type definitions and interfaces (models/)
 * - Utils: Helper functions (utils/)
 * - Middleware: CORS, logging, error handling (middleware/)
 */

import express from "express";
import "dotenv/config";
import routes from "./routes";
import { corsMiddleware, errorHandler, requestLogger } from "./middleware";

const app: express.Application = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// Basic Express middleware
app.use(express.json({ limit: "10mb" })); // Parse JSON requests up to 10MB
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Custom middleware (see middleware/index.ts)
app.use(corsMiddleware); // Enable CORS for Chrome extension
app.use(requestLogger); // Log all requests

// API Routes (see routes/index.ts)
app.use("/", routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`ClarityAI server running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `Gemini AI: ${
      process.env.GEMINI_API_KEY
        ? "Enabled"
        : "Disabled (using local summarization)"
    }`
  );
});
