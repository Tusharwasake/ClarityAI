import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScoredSentence } from "../models/SummaryModel";
import { isStopWord, cleanText } from "../utils/TextUtils";

// Initialize Gemini AI if API key is available
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generate user-focused summary using AI or local algorithm
 */
export const generateSummary = async (
  content: string,
  title: string
): Promise<string[]> => {
  try {
    // Try AI-powered summarization first
    if (genAI) {
      console.log("Using Gemini AI for summarization");
      return await generateAISummary(content, title);
    } else {
      console.log("No Gemini API key found, using local summarization");
      return await generateLocalSummary(content, title);
    }
  } catch (error) {
    console.error("AI summarization failed, falling back to local:", error);
    return await generateLocalSummary(content, title);
  }
};

/**
 * Generate AI-powered summary using Gemini with user-focused prompt
 */
const generateAISummary = async (
  content: string,
  title: string
): Promise<string[]> => {
  if (!genAI) {
    throw new Error("Gemini AI not initialized");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Create comprehensive user-focused prompt
  const prompt = `You're a smart web summarizer AI helping a busy reader understand this article quickly.

**Task**: Summarize this article for someone who doesn't have time to read the full content.

**Article Title**: "${title}"

**Article Content**:
${content.substring(0, 8000)}

**Please provide**:
1. **Main Purpose**: What is this article about? (1-2 sentences)
2. **Key Takeaways**: 3-4 most important points that would help the reader (specific, actionable, not vague)
3. **Important Details**: Any crucial numbers, dates, quotes, or facts mentioned
4. **Bottom Line**: Why should the reader care about this? (1 sentence)

**Format your response as a JSON object like this**:
{
  "mainPurpose": "Brief description of what the article is about",
  "keyTakeaways": [
    "First important point with specific details",
    "Second important point with specific details", 
    "Third important point with specific details"
  ],
  "importantDetails": "Any crucial numbers, dates, or quotes if present",
  "bottomLine": "Why this matters to the reader"
}

**Requirements**:
- Be specific and factual, not vague
- Focus on what's useful for the reader
- Include numbers/data when mentioned
- Make each point actionable or informative
- Keep it concise but comprehensive`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const summaryData = JSON.parse(jsonMatch[0]);

      // Format the response into bullet points
      const points = [];

      if (summaryData.mainPurpose) {
        points.push(`📋 **Main Purpose**: ${summaryData.mainPurpose}`);
      }

      if (summaryData.keyTakeaways && Array.isArray(summaryData.keyTakeaways)) {
        summaryData.keyTakeaways
          .slice(0, 3)
          .forEach((takeaway: string, index: number) => {
            points.push(`${index + 1}. ${takeaway}`);
          });
      }

      if (summaryData.importantDetails) {
        points.push(`📊 **Key Details**: ${summaryData.importantDetails}`);
      }

      if (summaryData.bottomLine) {
        points.push(`💡 **Bottom Line**: ${summaryData.bottomLine}`);
      }

      return points.slice(0, 5); // Max 5 points
    }

    // Fallback: extract bullet points from text
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 20)
      .slice(0, 4);

    if (lines.length > 0) {
      return lines;
    }

    throw new Error("Could not parse AI response");
  } catch (error) {
    console.error("Gemini parsing error:", error);
    throw error;
  }
};

/**
 * Enhanced local summarization focused on user value
 */
const generateLocalSummary = async (
  content: string,
  title: string
): Promise<string[]> => {
  const cleanContent = cleanText(content);
  const sentences = cleanContent
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 30);

  if (sentences.length <= 3) {
    return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  // Extract important keywords from title and content
  const titleWords = extractKeywords(title);
  const contentKeywords = extractTopKeywords(cleanContent, 10);
  const allKeywords = [...titleWords, ...contentKeywords];

  // Score sentences based on user value
  const scoredSentences: ScoredSentence[] = sentences.map((sentence, index) => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    const words = sentence.split(/\s+/);

    // Position scoring (beginning and end are important)
    if (index === 0) score += 4; // First sentence often has main idea
    if (index === 1) score += 2; // Second sentence often has context
    if (index < sentences.length * 0.15) score += 3; // Early sentences
    if (index > sentences.length * 0.85) score += 2; // Conclusion sentences

    // Length scoring (prefer substantial sentences)
    if (words.length >= 15 && words.length <= 35) score += 4;
    else if (words.length >= 10 && words.length <= 45) score += 2;
    else if (words.length < 8 || words.length > 60) score -= 3;

    // Keyword relevance scoring
    allKeywords.forEach((keyword) => {
      if (lowerSentence.includes(keyword.toLowerCase())) {
        score += 3;
      }
    });

    // User value indicators
    const valueIndicators = [
      "important",
      "significant",
      "key",
      "crucial",
      "essential",
      "main",
      "primary",
      "shows",
      "reveals",
      "found",
      "discovered",
      "research",
      "study",
      "data",
      "result",
      "results",
      "conclusion",
      "findings",
      "evidence",
      "proof",
      "new",
      "breakthrough",
      "innovation",
      "technology",
      "development",
      "impact",
      "effect",
      "influence",
      "change",
      "improvement",
      "benefit",
      "problem",
      "solution",
      "challenge",
      "opportunity",
      "trend",
      "future",
      "expert",
      "analysis",
      "report",
      "according",
      "official",
      "confirmed",
    ];

    valueIndicators.forEach((indicator) => {
      if (lowerSentence.includes(indicator)) score += 2;
    });

    // Numerical data and specificity
    if (
      /\d+%|\$\d+|\d+,\d+|\d+ (million|billion|thousand|percent)/.test(sentence)
    ) {
      score += 3;
    }

    // Quotes and attributions (often contain key information)
    if (
      /"[^"]*"/.test(sentence) ||
      /said|stated|reported|announced/.test(lowerSentence)
    ) {
      score += 2;
    }

    // Actionable information
    const actionWords = [
      "can",
      "should",
      "will",
      "how to",
      "way to",
      "method",
      "approach",
      "strategy",
    ];
    actionWords.forEach((word) => {
      if (lowerSentence.includes(word)) score += 2;
    });

    // Reduce score for overly promotional or vague content
    const fillerPhrases = [
      "click here",
      "read more",
      "subscribe",
      "follow us",
      "share this",
    ];
    fillerPhrases.forEach((phrase) => {
      if (lowerSentence.includes(phrase)) score -= 4;
    });

    return {
      sentence: sentence.trim(),
      score,
      index,
      length: words.length,
    };
  });

  // Select top sentences and maintain logical flow
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .sort((a, b) => a.index - b.index);

  return topSentences.map((item) => item.sentence);
};

/**
 * Extract keywords from text, filtering out stop words
 */
const extractKeywords = (text: string): string[] => {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !isStopWord(word))
    .slice(0, 10);
};

/**
 * Extract top keywords from content based on frequency
 */
const extractTopKeywords = (content: string, limit: number): string[] => {
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4 && !isStopWord(word));

  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach((word) => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Return top keywords by frequency
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map((entry) => entry[0]);
};
