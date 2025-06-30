import { extractContent, shouldProcessPage, isLongFormContent } from "./contentExtractor";
import { StorageManager } from "./storageManager";
import { summarize } from "./summarizationService";
import { Summary } from "./types";

/**
 * Content Script - Simple functional approach
 */

// Global state
let floatingButton: HTMLElement | null = null;
let summaryPanel: HTMLElement | null = null;
let isProcessing = false;
let notificationShown = false;

/**
 * Initialize content script
 */
async function initContent(): Promise<void> {
  // Check if this page should be processed
  if (!shouldProcessPage()) {
    return;
  }

  // Check if extension is enabled for this site
  const isEnabled = await StorageManager.isEnabledForSite(window.location.href);
  if (!isEnabled) return;

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setupContent());
  } else {
    setupContent();
  }
}

/**
 * Setup extension UI and functionality
 */
async function setupContent(): Promise<void> {
  await createFloatingButton();
  await setupSmartTrigger();
}

/**
 * Create floating summarize button
 */
async function createFloatingButton(): Promise<void> {
  // Remove existing button if present
  if (floatingButton) {
    floatingButton.remove();
  }

  floatingButton = document.createElement("div");
  floatingButton.id = "clarityai-floating-button";
  floatingButton.innerHTML = `
    <div class="clarityai-btn-content">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Summarize</span>
    </div>
  `;

  floatingButton.addEventListener("click", () => handleSummarizeClick());
  document.body.appendChild(floatingButton);
}

/**
 * Handle summarize button click
 */
async function handleSummarizeClick(): Promise<void> {
  if (isProcessing) return;

  try {
    isProcessing = true;
    updateButtonState("loading");

    // Extract content from page
    const content = extractContent();
    if (content.wordCount < 50) {
      showError("Not enough content to summarize");
      return;
    }

    // Call backend API for summarization
    const summaryResponse = await summarize({
      content: content.content,
      title: content.title,
      url: content.url
    });

    // Create summary object
    const summary: Summary = {
      id: StorageManager.generateSummaryId(),
      url: content.url,
      title: content.title,
      points: summaryResponse.points,
      timestamp: Date.now(),
      wordCount: content.wordCount
    };

    // Save and display summary
    await StorageManager.saveSummary(summary);
    showSummaryPanel(summary);

  } catch (error) {
    console.error("Summarization error:", error);
    showError("Failed to generate summary. Please try again.");
  } finally {
    isProcessing = false;
    updateButtonState("ready");
  }
}

/**
 * Update button state
 */
function updateButtonState(state: "ready" | "loading"): void {
  if (!floatingButton) return;

  const buttonContent = floatingButton.querySelector(".clarityai-btn-content");
  if (!buttonContent) return;

  if (state === "loading") {
    buttonContent.innerHTML = `
      <div class="clarityai-spinner"></div>
      <span>Processing...</span>
    `;
    floatingButton.classList.add("loading");
  } else {
    buttonContent.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Summarize</span>
    `;
    floatingButton.classList.remove("loading");
  }
}

/**
 * Show summary panel
 */
function showSummaryPanel(summary: Summary): void {
  // Remove existing panel
  if (summaryPanel) {
    summaryPanel.remove();
  }

  summaryPanel = document.createElement("div");
  summaryPanel.id = "clarityai-summary-panel";
  summaryPanel.innerHTML = `
    <div class="clarityai-panel-header">
      <h3>📖 Summary</h3>
      <button class="clarityai-close-btn">×</button>
    </div>
    <div class="clarityai-panel-content">
      <div class="clarityai-summary-meta">
        <h4>${summary.title}</h4>
        <p class="clarityai-meta-info">${summary.wordCount} words • ${new Date(summary.timestamp).toLocaleDateString()}</p>
      </div>
      <div class="clarityai-summary-points">
        ${summary.points.map((point, index) => `
          <div class="clarityai-point">
            <span class="clarityai-point-number">${index + 1}</span>
            <span class="clarityai-point-text">${point}</span>
          </div>
        `).join("")}
      </div>
      <div class="clarityai-panel-actions">
        <button class="clarityai-copy-btn">📋 Copy Summary</button>
        <button class="clarityai-export-btn">📄 Export</button>
      </div>
    </div>
  `;

  // Add event listeners
  summaryPanel.querySelector(".clarityai-close-btn")?.addEventListener("click", () => {
    summaryPanel?.remove();
  });

  summaryPanel.querySelector(".clarityai-copy-btn")?.addEventListener("click", () => {
    copySummary(summary);
  });

  summaryPanel.querySelector(".clarityai-export-btn")?.addEventListener("click", () => {
    exportSummary(summary);
  });

  document.body.appendChild(summaryPanel);

  // Show animation
  setTimeout(() => {
    summaryPanel?.classList.add("show");
  }, 10);
}

/**
 * Copy summary to clipboard
 */
async function copySummary(summary: Summary): Promise<void> {
  try {
    const summaryText = StorageManager.exportSummaryAsText(summary);
    await navigator.clipboard.writeText(summaryText);

    const copyBtn = summaryPanel?.querySelector(".clarityai-copy-btn");
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "✅ Copied!";
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    }
  } catch (error) {
    console.error("Failed to copy summary:", error);
    showError("Failed to copy summary");
  }
}

/**
 * Export summary as file
 */
function exportSummary(summary: Summary): void {
  try {
    const summaryMarkdown = StorageManager.exportSummaryAsMarkdown(summary);
    const blob = new Blob([summaryMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${summary.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export summary:", error);
    showError("Failed to export summary");
  }
}

/**
 * Setup smart trigger for long content
 */
async function setupSmartTrigger(): Promise<void> {
  const settings = await StorageManager.getSettings();
  if (!settings.autoDetect) return;

  // Check if content is long enough
  if (isLongFormContent()) {
    setTimeout(() => showSmartNotification(), 3000);
  }
}

/**
 * Show smart notification
 */
function showSmartNotification(): void {
  if (notificationShown) return;
  notificationShown = true;

  const notification = document.createElement("div");
  notification.id = "clarityai-smart-notification";
  notification.innerHTML = `
    <div class="clarityai-notification-content">
      <span>📖 This looks like a long read. Summarize?</span>
      <div class="clarityai-notification-actions">
        <button class="clarityai-btn-yes">Yes</button>
        <button class="clarityai-btn-no">No</button>
      </div>
    </div>
  `;

  notification.querySelector(".clarityai-btn-yes")?.addEventListener("click", () => {
    notification.remove();
    handleSummarizeClick();
  });

  notification.querySelector(".clarityai-btn-no")?.addEventListener("click", () => {
    notification.remove();
  });

  document.body.appendChild(notification);

  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 8000);
}

/**
 * Show error message
 */
function showError(message: string): void {
  const errorDiv = document.createElement("div");
  errorDiv.id = "clarityai-error";
  errorDiv.innerHTML = `
    <div class="clarityai-error-content">
      <span>⚠️ ${message}</span>
    </div>
  `;

  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 4000);
}

// Initialize when script loads
initContent();
