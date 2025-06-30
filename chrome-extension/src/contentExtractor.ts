import { ContentExtraction } from "./types";

/**
 * Content Extraction Functions
 * Simple functional approach for extracting content from web pages
 */

// Content selectors in order of preference
const CONTENT_SELECTORS = [
  // Semantic HTML
  "article",
  "main",
  '[role="main"]',

  // Common content classes
  ".post-content",
  ".entry-content",
  ".article-content",
  ".content",
  "#content",
  ".article-body",
  ".post-body",
  ".story-body",
  ".article-wrap",
  ".post-wrap",

  // Popular platforms
  ".notion-page-content", // Notion
  ".markdown-body", // GitHub
  ".Post-body", // Medium (new)
  ".postArticle-content", // Medium (old)
  ".wiki-content", // Wikipedia style
  ".reader-content", // Reader mode

  // International content classes
  ".contenido", // Spanish
  ".contenu", // French
  ".inhalt", // German
  ".conteudo", // Portuguese
  ".コンテンツ", // Japanese
  ".内容", // Chinese
];

// Elements to remove (noise)
const NOISE_SELECTORS = [
  // Navigation and structure
  "nav",
  "header",
  "footer",
  "aside",
  ".sidebar",
  ".navigation",
  ".menu",
  ".breadcrumb",
  ".breadcrumbs",

  // Advertising and promotional
  ".ads",
  ".advertisement",
  ".ad-container",
  ".ad-banner",
  ".sponsored",
  ".promo",
  ".promotion",
  '[class*="ad-"]',
  '[id*="ad-"]',
  '[class*="ads-"]',
  '[id*="ads-"]',

  // Social and engagement
  ".social-share",
  ".social-sharing",
  ".share-buttons",
  ".comments",
  ".comment-section",
  ".newsletter-signup",
  ".subscribe",
  ".newsletter",

  // UI elements
  ".popup",
  ".modal",
  ".overlay",
  ".tooltip",
  ".dropdown",
  ".cookie-banner",
  ".cookie-notice",

  // Related content
  ".related-posts",
  ".related-articles",
  ".recommended",
  ".suggestions",
  ".more-stories",

  // Platform-specific noise
  ".twitter-tweet",
  ".instagram-media",
  ".fb-post",
  ".youtube-player",
  ".ad-slot",
  ".adsystem",

  // International noise patterns
  ".publicidad",
  ".publicité",
  ".werbung",
  ".広告",
  ".广告",
];

const MIN_CONTENT_LENGTH = 100;
const MIN_WORD_COUNT = 50;

/**
 * Main content extraction function
 */
export function extractContent(): ContentExtraction {
  const title = extractTitle();
  const mainContent = extractMainContent();
  const headings = extractHeadings();
  const wordCount = countWords(mainContent);

  return {
    title,
    content: mainContent,
    wordCount,
    mainContent,
    headings,
    url: window.location.href,
    timestamp: Date.now(),
  };
}

/**
 * Extract page title with multiple fallbacks
 */
function extractTitle(): string {
  const titleSources = [
    // Primary heading
    () => document.querySelector("h1")?.textContent,

    // Social media meta tags
    () =>
      document.querySelector('[property="og:title"]')?.getAttribute("content"),
    () =>
      document.querySelector('[name="twitter:title"]')?.getAttribute("content"),
    () =>
      document
        .querySelector('[property="article:title"]')
        ?.getAttribute("content"),

    // Common title patterns
    () =>
      document.querySelector(".post-title, .article-title, .entry-title")
        ?.textContent,
    () => document.querySelector(".title, .headline, .page-title")?.textContent,
    () => document.querySelector(".story-title, .content-title")?.textContent,

    // Platform-specific patterns
    () => document.querySelector(".notion-page-title")?.textContent, // Notion
    () => document.querySelector(".Post-title")?.textContent, // Medium
    () => document.querySelector(".js-title-field")?.textContent, // GitHub
    () => document.querySelector("#firstHeading")?.textContent, // Wikipedia

    // Fallback to document title
    () => document.title,

    // Last resort - clean up document title
    () => {
      const title = document.title;
      return (
        title.split(" - ")[0] ||
        title.split(" | ")[0] ||
        title.split(" :: ")[0] ||
        title
      );
    },
  ];

  for (const getTitle of titleSources) {
    const title = getTitle()?.trim();
    if (title && title.length > 0) {
      return title;
    }
  }

  return "Untitled Page";
}

/**
 * Extract main content using multiple strategies
 */
function extractMainContent(): string {
  // Strategy 1: Try semantic selectors
  const mainContent = trySemanticExtraction();
  if (mainContent && mainContent.length > MIN_CONTENT_LENGTH) {
    return mainContent;
  }

  // Strategy 2: Try readability-style extraction
  const readabilityContent = tryReadabilityExtraction();
  if (readabilityContent && readabilityContent.length > MIN_CONTENT_LENGTH) {
    return readabilityContent;
  }

  // Strategy 3: Fallback to body content with noise removal
  return fallbackExtraction();
}

/**
 * Try to find content using semantic HTML elements
 */
function trySemanticExtraction(): string {
  for (const selector of CONTENT_SELECTORS) {
    const element = document.querySelector(selector);
    if (element) {
      const content = cleanContent(element);
      if (content.length > MIN_CONTENT_LENGTH) {
        return content;
      }
    }
  }
  return "";
}

/**
 * Readability-style content extraction
 */
function tryReadabilityExtraction(): string {
  const candidates = Array.from(
    document.querySelectorAll("div, section, article")
  );
  let bestCandidate = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = scoreElement(candidate);
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  return bestCandidate ? cleanContent(bestCandidate) : "";
}

/**
 * Score an element based on content indicators
 */
function scoreElement(element: Element): number {
  let score = 0;
  const text = element.textContent || "";

  // Positive indicators
  score += element.querySelectorAll("p").length * 3;
  score += Math.min(text.length / 100, 10);

  // Negative indicators
  if (element.classList.contains("sidebar")) score -= 10;
  if (element.classList.contains("footer")) score -= 10;
  if (element.classList.contains("header")) score -= 10;
  if (element.id?.includes("ad")) score -= 15;

  return Math.max(0, score);
}

/**
 * Fallback: clean body content by removing noise
 */
function fallbackExtraction(): string {
  const body = document.body.cloneNode(true) as HTMLElement;

  // Remove noise elements
  NOISE_SELECTORS.forEach((selector) => {
    body.querySelectorAll(selector).forEach((el) => el.remove());
  });

  return cleanContent(body);
}

/**
 * Clean extracted content
 */
function cleanContent(element: Element): string {
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove scripts, styles, and other noise
  clone
    .querySelectorAll("script, style, noscript")
    .forEach((el) => el.remove());
  NOISE_SELECTORS.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((el) => el.remove());
  });

  const text = clone.textContent || "";
  return text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

/**
 * Extract headings from the page
 */
function extractHeadings(): string[] {
  const headings: string[] = [];
  const headingElements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

  headingElements.forEach((heading) => {
    const text = heading.textContent?.trim();
    if (text && text.length > 0 && text.length < 200) {
      headings.push(text);
    }
  });

  return headings;
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Check if page has significant content
 */
export function hasSignificantContent(): boolean {
  const extraction = extractContent();
  return extraction.wordCount >= MIN_WORD_COUNT;
}

/**
 * Detect if this is likely a long-form article
 */
export function isLongFormContent(): boolean {
  const extraction = extractContent();
  return extraction.wordCount >= 500;
}

/**
 * Check if page should be processed
 */
export function shouldProcessPage(): boolean {
  const url = window.location.href;

  // Skip file downloads
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|exe|dmg)(\?|$)/i.test(url)) {
    return false;
  }

  // Skip search pages
  if (/\/search|\/results|\?q=|\?search=/i.test(url)) {
    return false;
  }

  // Skip admin pages
  if (
    /\/(admin|login|register|checkout|cart|account|settings|dashboard)\//i.test(
      url
    )
  ) {
    return false;
  }

  // Skip if page is too short
  const bodyText = document.body?.textContent || "";
  if (bodyText.length < 200) {
    return false;
  }

  return true;
}
