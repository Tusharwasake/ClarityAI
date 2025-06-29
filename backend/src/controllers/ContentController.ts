import { Request, Response } from "express";
import { extractFromUrl } from "../services/ContentExtractionService";
import { validateUrl } from "../services/ValidationService";
import { ExtractRequest } from "../models/SummaryModel";

/**
 * Extract content from URL
 */
export const extract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url }: ExtractRequest = req.body;

    // Validate input
    const validation = validateUrl(url);
    if (!validation.isValid) {
      res.status(400).json({
        error: validation.error,
      });
      return;
    }

    // Extract content
    const extractedContent = await extractFromUrl(url);

    res.json(extractedContent);
  } catch (error) {
    console.error("Content extraction error:", error);
    res.status(500).json({
      error: "Failed to extract content from URL",
    });
  }
};
