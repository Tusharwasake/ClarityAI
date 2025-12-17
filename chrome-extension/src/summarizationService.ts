import { SummaryRequest, SummaryResponse } from "./types";

/**
 * AI Summarization Service
 * Handles communication with the backend summarization API
 */

// Configuration for API endpoint
const IS_DEVELOPMENT = true; // Set to true for local development
const API_BASE_URL = IS_DEVELOPMENT
  ? "http://localhost:3000"
  : "https://clarityai-qrnk.onrender.com";
const TIMEOUT_MS = 30000; // 30 seconds

/**
 * Generate summary from content
 */
export async function summarize(
  request: SummaryRequest
): Promise<SummaryResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${API_BASE_URL}/api/summarize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SummaryResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Summarization failed:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }

    throw new Error("An unexpected error occurred");
  }
}

/**
 * Generate fallback summary (client-side basic summarization)
 * Used when API is unavailable
 */
export function generateFallbackSummary(
  content: string,
  title: string
): string[] {
  // Simple extractive summarization
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20);

  if (sentences.length <= 3) {
    return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  // Score sentences based on:
  // 1. Position (first and last sentences are important)
  // 2. Length (moderate length preferred)
  // 3. Keywords from title
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();

    // Position scoring
    if (index === 0) score += 3; // First sentence
    if (index === sentences.length - 1) score += 2; // Last sentence
    if (index < sentences.length * 0.3) score += 1; // Early sentences

    // Length scoring (prefer moderate length)
    const wordCount = sentence.split(/\s+/).length;
    if (wordCount >= 10 && wordCount <= 30) score += 2;
    else if (wordCount >= 5 && wordCount <= 50) score += 1;

    // Title keyword scoring
    titleWords.forEach((word) => {
      if (lowerSentence.includes(word)) score += 2;
    });

    return { sentence: sentence.trim(), score, index };
  });

  // Sort by score and take top 3
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.index - b.index) // Restore original order
    .map((item) => item.sentence);
}

/**
 * Check if the summarization service is available
 */
export async function isServiceAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}
