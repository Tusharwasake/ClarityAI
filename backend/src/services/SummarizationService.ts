import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI - require API key
const apiKey =
  process.env.GEMINI_API_KEY || "AIzaSyBg4zOI1msibsELoEmiwEBu5JcxoWx2zbY";
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is required");
}
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generate AI-powered summary using Gemini
 */
export const generateSummary = async (
  content: string,
  title: string
): Promise<string[]> => {
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
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
};
