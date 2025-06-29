import { ContentExtraction } from "./types";

/**
 * Smart Content Detection & Extraction
 * Removes ads, navigation, sidebars and extracts main article content
 */
export class ContentExtractor {
  private static readonly CONTENT_SELECTORS = [
    // Standard HTML5 semantic elements
    "article",
    "main",
    '[role="main"]',
    '[role="article"]',

    // Common CMS and blog patterns
    ".post-content",
    ".entry-content",
    ".article-content",
    ".article-body",
    ".content",
    "#content",
    ".main-content",
    ".post-body",
    ".story-body",
    ".story-content",

    // News and media sites
    ".article-text",
    ".story-text",
    ".content-body",
    ".article-wrap",
    ".post-wrap",

    // Popular platforms
    ".notion-page-content", // Notion
    ".markdown-body", // GitHub
    ".Post-body", // Medium (new)
    ".postArticle-content", // Medium (old)
    ".wiki-content", // Wikipedia style
    ".reader-content", // Reader mode

    // International and multi-language sites
    ".contenido", // Spanish
    ".contenu", // French
    ".inhalt", // German
    ".conteudo", // Portuguese
    ".コンテンツ", // Japanese
    ".内容", // Chinese
  ];

  private static readonly NOISE_SELECTORS = [
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
    ".twitter-tweet", // Embedded tweets
    ".instagram-media", // Instagram embeds
    ".fb-post", // Facebook posts
    ".youtube-player", // YouTube embeds
    ".ad-slot", // Google Ads
    ".adsystem", // Ad networks

    // International noise patterns
    ".publicidad", // Spanish ads
    ".publicité", // French ads
    ".werbung", // German ads
    ".広告", // Japanese ads
    ".广告", // Chinese ads
  ];

  private static readonly MIN_CONTENT_LENGTH = 100;
  private static readonly MIN_WORD_COUNT = 50;

  /**
   * Extract main content from the current page
   */
  static extractContent(): ContentExtraction {
    const title = this.extractTitle();
    const mainContent = this.extractMainContent();
    const headings = this.extractHeadings();
    const wordCount = this.countWords(mainContent);

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
   * Extract page title with fallbacks
   */
  private static extractTitle(): string {
    // Try multiple title sources in order of preference
    const titleSources = [
      // Primary heading
      () => document.querySelector("h1")?.textContent,

      // Social media meta tags
      () =>
        document
          .querySelector('[property="og:title"]')
          ?.getAttribute("content"),
      () =>
        document
          .querySelector('[name="twitter:title"]')
          ?.getAttribute("content"),
      () =>
        document
          .querySelector('[property="article:title"]')
          ?.getAttribute("content"),

      // Common title patterns
      () =>
        document.querySelector(".post-title, .article-title, .entry-title")
          ?.textContent,
      () =>
        document.querySelector(".title, .headline, .page-title")?.textContent,
      () => document.querySelector(".story-title, .content-title")?.textContent,

      // Platform-specific patterns
      () => document.querySelector(".notion-page-title")?.textContent, // Notion
      () => document.querySelector(".Post-title")?.textContent, // Medium
      () => document.querySelector(".js-title-field")?.textContent, // GitHub
      () => document.querySelector("#firstHeading")?.textContent, // Wikipedia

      // Fallback to document title
      () => document.title,

      // Last resort - try to clean up document title
      () => {
        const title = document.title;
        // Remove common site name patterns
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
   * Extract main article content using multiple strategies
   */
  private static extractMainContent(): string {
    // Strategy 1: Try semantic selectors
    const mainContent = this.trySemanticExtraction();
    if (mainContent && mainContent.length > this.MIN_CONTENT_LENGTH) {
      return mainContent;
    }

    // Strategy 2: Try readability-style extraction
    const readabilityContent = this.tryReadabilityExtraction();
    if (
      readabilityContent &&
      readabilityContent.length > this.MIN_CONTENT_LENGTH
    ) {
      return readabilityContent;
    }

    // Strategy 3: Fallback to body content with noise removal
    return this.fallbackExtraction();
  }

  /**
   * Try to find content using semantic HTML elements
   */
  private static trySemanticExtraction(): string {
    for (const selector of this.CONTENT_SELECTORS) {
      const element = document.querySelector(selector);
      if (element) {
        const content = this.cleanContent(element);
        if (content.length > this.MIN_CONTENT_LENGTH) {
          return content;
        }
      }
    }
    return "";
  }

  /**
   * Readability-style content extraction
   * Finds the element with the most paragraph content
   */
  private static tryReadabilityExtraction(): string {
    const candidates = Array.from(
      document.querySelectorAll("div, section, article")
    );
    let bestCandidate = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const score = this.scoreElement(candidate);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    return bestCandidate ? this.cleanContent(bestCandidate) : "";
  }

  /**
   * Score an element based on content indicators
   */
  private static scoreElement(element: Element): number {
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
  private static fallbackExtraction(): string {
    const body = document.body.cloneNode(true) as HTMLElement;

    // Remove noise elements
    this.NOISE_SELECTORS.forEach((selector) => {
      body.querySelectorAll(selector).forEach((el) => el.remove());
    });

    return this.cleanContent(body);
  }

  /**
   * Clean extracted content
   */
  private static cleanContent(element: Element): string {
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove scripts, styles, and other noise
    clone
      .querySelectorAll("script, style, noscript")
      .forEach((el) => el.remove());
    this.NOISE_SELECTORS.forEach((selector) => {
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
  private static extractHeadings(): string[] {
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
  private static countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Check if the page has enough content to warrant summarization
   */
  static hasSignificantContent(): boolean {
    const extraction = this.extractContent();
    return extraction.wordCount >= this.MIN_WORD_COUNT;
  }

  /**
   * Detect if this is likely a long-form article
   */
  static isLongFormContent(): boolean {
    const extraction = this.extractContent();
    return extraction.wordCount >= 500;
  }

  /**
   * Detect the type of website and adjust extraction strategy
   */
  private static detectWebsiteType(): string {
    const url = window.location.href;
    const hostname = window.location.hostname;

    // News sites
    if (
      /\b(cnn|bbc|reuters|nytimes|washingtonpost|theguardian|npr|foxnews|abc|cbs|nbc)\b/i.test(
        hostname
      )
    ) {
      return "news";
    }

    // Blog platforms
    if (
      /\b(medium|wordpress|blogger|tumblr|substack|ghost)\b/i.test(hostname)
    ) {
      return "blog";
    }

    // Documentation sites
    if (
      /\b(github|stackoverflow|docs\.|documentation|wiki)\b/i.test(hostname)
    ) {
      return "docs";
    }

    // Social media
    if (/\b(twitter|facebook|linkedin|reddit)\b/i.test(hostname)) {
      return "social";
    }

    // E-commerce
    if (/\b(amazon|ebay|etsy|shopify|woocommerce)\b/i.test(hostname)) {
      return "ecommerce";
    }

    // Academic/Research
    if (/\b(arxiv|pubmed|jstor|researchgate|academia\.edu)\b/i.test(hostname)) {
      return "academic";
    }

    return "general";
  }

  /**
   * Check if the current page should be processed
   */
  static shouldProcessPage(): boolean {
    const url = window.location.href;
    const hostname = window.location.hostname;

    // Skip if it's a file or non-content URL
    if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|exe|dmg)(\?|$)/i.test(url)) {
      return false;
    }

    // Skip search result pages
    if (/\/search|\/results|\?q=|\?search=/i.test(url)) {
      return false;
    }

    // Skip admin, login, and system pages
    if (
      /\/(admin|login|register|checkout|cart|account|settings|dashboard)\//i.test(
        url
      )
    ) {
      return false;
    }

    // Skip if page is too short or likely not content
    const bodyText = document.body?.textContent || "";
    if (bodyText.length < 200) {
      return false;
    }

    return true;
  }
}
