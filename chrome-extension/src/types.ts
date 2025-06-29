// Core types for the ClarityAI extension
export interface ContentExtraction {
  title: string;
  content: string;
  wordCount: number;
  mainContent: string;
  headings: string[];
  url: string;
  timestamp: number;
}

export interface Summary {
  id: string;
  url: string;
  title: string;
  points: string[];
  timestamp: number;
  wordCount: number;
}

export interface ExtensionSettings {
  enabled: boolean;
  autoDetect: boolean;
  disabledSites: string[];
  summaryFormat: "bullets" | "paragraph";
}

export interface SummaryRequest {
  content: string;
  title: string;
  url: string;
}

export interface SummaryResponse {
  points: string[];
  timestamp: string;
  wordCount: number;
  method?: "ai" | "local";
}
