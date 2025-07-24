import { Request, Response, NextFunction } from "express";

/**
 * CORS middleware for Chrome extension
 */
export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Allow requests from Chrome extensions and specific domains
  const allowedOrigins = [
    "chrome-extension://",
    "https://signup.firstock.in",
    "http://localhost:3000",
    "https://clarityai-qrnk.onrender.com",
  ];

  const origin = req.headers.origin;

  if (
    origin &&
    (origin.startsWith("chrome-extension://") ||
      allowedOrigins.includes(origin))
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
};

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
