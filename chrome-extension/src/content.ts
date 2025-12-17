import {
  extractContent,
  shouldProcessPage,
} from "./contentExtractor";
import { StorageManager } from "./storageManager";

/**
 * Content Script - Data Provider
 * Responds to popup requests for page content
 */

/**
 * Initialize content script
 */
async function initContent(): Promise<void> {
  // Check if this page should be processed
  if (!shouldProcessPage()) {
    return;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_CONTENT") {
      handleGetContent(sendResponse);
      return true; // Keep message channel open for async response
    }
  });
}

/**
 * Handle content extraction request
 */
async function handleGetContent(sendResponse: (response: any) => void): Promise<void> {
  try {
    const isEnabled = await StorageManager.isEnabledForSite(window.location.href);

    const content = extractContent();

    if (content.wordCount < 50) {
      sendResponse({ success: false, error: "Not enough content to summarize" });
      return;
    }

    sendResponse({
      success: true,
      data: {
        content: content.content,
        title: content.title,
        url: content.url
      }
    });

  } catch (error) {
    console.error("ClarityAI: Content extraction failed", error);
    sendResponse({ success: false, error: "Failed to extract content" });
  }
}

// Run initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initContent());
} else {
  initContent();
}
