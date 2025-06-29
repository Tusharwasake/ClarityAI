import express from "express";
import "dotenv/config";
import routes from "./routes";
import { corsMiddleware, errorHandler, requestLogger } from "./middleware";

const app: express.Application = express();
const PORT = process.env.SERVER_PORT || 3000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(corsMiddleware);
app.use(requestLogger);

// Routes
app.use("/", routes);

// Error handling (should be last)
app.use(errorHandler);

// Start server
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
