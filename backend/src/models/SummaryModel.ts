export interface SummaryRequest {
  content: string;
  title?: string;
  url?: string;
}

export interface SummaryResponse {
  points: string[];
  timestamp: string;
  wordCount: number;
  method?: "ai" | "local";
}

export interface ExtractRequest {
  url: string;
}

export interface ExtractedContent {
  title: string;
  content: string;
  excerpt: string;
  byline?: string;
  length: number;
  readTime: number;
  siteName: string;
  url: string;
}

export interface ScoredSentence {
  sentence: string;
  score: number;
  index: number;
  length: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
