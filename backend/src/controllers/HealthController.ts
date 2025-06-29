import { Request, Response } from "express";
import { HealthResponse } from "../models/SummaryModel";

/**
 * Health check endpoint
 */
export const health = (req: Request, res: Response): void => {
  const response: HealthResponse = {
    status: "OK",
    timestamp: new Date().toISOString(),
  };

  res.json(response);
};

/**
 * Root endpoint
 */
export const root = (req: Request, res: Response): void => {
  res.send("ClarityAI Backend - Smart Content Summarizer");
};
