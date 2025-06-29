import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import axios from "axios";
import { ExtractedContent } from "../models/SummaryModel";

/**
 * Extract content from URL using Readability
 */
export const extractFromUrl = async (
  url: string
): Promise<ExtractedContent> => {
  try {
    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "ClarityAI Content Extractor 1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 10000,
    });

    // Parse with JSDOM
    const dom = new JSDOM(response.data, { url });
    const document = dom.window.document;

    // Use Readability to extract main content
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      throw new Error("Failed to extract readable content");
    }

    return {
      title: article.title,
      content: article.textContent,
      excerpt: article.excerpt,
      byline: article.byline,
      length: article.length,
      readTime: Math.ceil(article.length / 200), // Average reading speed
      siteName: article.siteName || new URL(url).hostname,
      url: url,
    };
  } catch (error: any) {
    throw new Error(`Content extraction failed: ${error.message}`);
  }
};
