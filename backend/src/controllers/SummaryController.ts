import { Request, Response } from "express";
import { generateSummary } from "../services/SummarizationService";
import { validateSummaryRequest } from "../services/ValidationService";
import { SummaryRequest, SummaryResponse } from "../models/SummaryModel";
import { countWords } from "../utils/TextUtils";

/**
 * Generate summary from content
 */
export const summarize = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, title, url }: SummaryRequest = req.body;

    // Validate input
    const validation = validateSummaryRequest(content, title);
    if (!validation.isValid) {
      res.status(400).json({
        error: validation.error,
      });
      return;
    }

    // Generate summary
    const points = await generateSummary(content, title || "Untitled");

    const response: SummaryResponse = {
      points,
      timestamp: new Date().toISOString(),
      wordCount: countWords(content),
    };

    res.json(response);
  } catch (error) {
    console.error("Summarization error:", error);
    res.status(500).json({
      error: "Failed to generate summary",
    });
  }
};
