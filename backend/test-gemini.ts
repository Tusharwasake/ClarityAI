import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key:", apiKey ? "Present" : "Missing");

  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("Test: What is 2+2?");
    const response = await result.response;
    const text = response.text();

    console.log("Gemini API Test Successful:");
    console.log("Response:", text);
  } catch (error) {
    console.error("Gemini API Test Failed:");
    console.error(error);
  }
}

testGeminiAPI();
