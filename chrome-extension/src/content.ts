import { ContentExtractor } from "./contentExtractor";
import { StorageManager } from "./storageManager";
import { SummarizationService } from "./summarizationService";
import { Summary } from "./types";

/**
 * Content Script - Runs on every page
 * Handles floating button, smart trigger detection, and content interaction
 */
class ClarityAIContent {
  private floatingButton: HTMLElement | null = null;
  private summaryPanel: HTMLElement | null = null;
  private isProcessing = false;
  private notificationShown = false;

  constructor() {
    this.init();
  }

  /**
   * Initialize the content script
   */
  private async init(): Promise<void> {
    // Check if this page should be processed
    if (!ContentExtractor.shouldProcessPage()) {
      return;
    }

    // Check if extension is enabled for this site
    const isEnabled = await StorageManager.isEnabledForSite(
      window.location.href
    );
    if (!isEnabled) return;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Setup the extension UI and functionality
   */
  private async setup(): Promise<void> {
    await this.createFloatingButton();
    await this.setupSmartTrigger();
  }

  /**
   * Create the floating summarize button
   */
  private async createFloatingButton(): Promise<void> {
    // Remove existing button if present
    if (this.floatingButton) {
      this.floatingButton.remove();
    }

    this.floatingButton = document.createElement("div");
    this.floatingButton.id = "clarityai-floating-button";
    this.floatingButton.innerHTML = `
      <div class="clarityai-btn-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Summarize</span>
      </div>
    `;

    this.floatingButton.addEventListener("click", () =>
      this.handleSummarizeClick()
    );
    document.body.appendChild(this.floatingButton);
  }

  /**
   * Smart Trigger Detection - Auto-suggest summarization for long content
   */
  private async setupSmartTrigger(): Promise<void> {
    const settings = await StorageManager.getSettings();
    if (!settings.autoDetect) return;

    // Check if content is significant enough
    if (ContentExtractor.isLongFormContent()) {
      setTimeout(() => this.showSmartNotification(), 3000); // Show after 3 seconds
    }
  }

  /**
   * Show smart notification for long content
   */
  private showSmartNotification(): void {
    if (this.notificationShown) return;
    this.notificationShown = true;

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

    notification
      .querySelector(".clarityai-btn-yes")
      ?.addEventListener("click", () => {
        notification.remove();
        this.handleSummarizeClick();
      });

    notification
      .querySelector(".clarityai-btn-no")
      ?.addEventListener("click", () => {
        notification.remove();
      });

    document.body.appendChild(notification);

    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 8000);
  }

  /**
   * Handle summarize button click
   */
  private async handleSummarizeClick(): Promise<void> {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      this.updateButtonState("loading");

      // Extract content
      const extraction = ContentExtractor.extractContent();

      if (extraction.wordCount < 50) {
        this.showError("Not enough content to summarize");
        return;
      }

      // Generate summary
      const summaryResponse = await SummarizationService.summarize({
        content: extraction.content,
        title: extraction.title,
        url: extraction.url,
      });

      const summary: Summary = {
        id: StorageManager.generateSummaryId(),
        url: extraction.url,
        title: extraction.title,
        points: summaryResponse.points,
        timestamp: Date.now(),
        wordCount: extraction.wordCount,
      };

      // Save to storage
      await StorageManager.saveSummary(summary);

      // Show summary panel
      this.showSummaryPanel(summary);
    } catch (error) {
      console.error("Summarization error:", error);
      this.showError("Failed to generate summary. Please try again.");
    } finally {
      this.isProcessing = false;
      this.updateButtonState("ready");
    }
  }

  /**
   * Update floating button state
   */
  private updateButtonState(state: "ready" | "loading"): void {
    if (!this.floatingButton) return;

    const content = this.floatingButton.querySelector(".clarityai-btn-content");
    if (!content) return;

    if (state === "loading") {
      content.innerHTML = `
        <div class="clarityai-spinner"></div>
        <span>Processing...</span>
      `;
      this.floatingButton.classList.add("loading");
    } else {
      content.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>Summarize</span>
      `;
      this.floatingButton.classList.remove("loading");
    }
  }

  /**
   * Show summary in slide-out panel
   */
  private showSummaryPanel(summary: Summary): void {
    // Remove existing panel
    if (this.summaryPanel) {
      this.summaryPanel.remove();
    }

    this.summaryPanel = document.createElement("div");
    this.summaryPanel.id = "clarityai-summary-panel";
    this.summaryPanel.innerHTML = `
      <div class="clarityai-panel-header">
        <h3>📖 Summary</h3>
        <button class="clarityai-close-btn">×</button>
      </div>
      <div class="clarityai-panel-content">
        <div class="clarityai-summary-meta">
          <h4>${summary.title}</h4>
          <p class="clarityai-meta-info">${
            summary.wordCount
          } words • ${new Date(summary.timestamp).toLocaleDateString()}</p>
        </div>
        <div class="clarityai-summary-points">
          ${summary.points
            .map(
              (point, i) => `
            <div class="clarityai-point">
              <span class="clarityai-point-number">${i + 1}</span>
              <span class="clarityai-point-text">${point}</span>
            </div>
          `
            )
            .join("")}
        </div>
        <div class="clarityai-panel-actions">
          <button class="clarityai-copy-btn">📋 Copy Summary</button>
          <button class="clarityai-export-btn">📄 Export</button>
        </div>
      </div>
    `;

    // Event listeners
    this.summaryPanel
      .querySelector(".clarityai-close-btn")
      ?.addEventListener("click", () => {
        this.summaryPanel?.remove();
      });

    this.summaryPanel
      .querySelector(".clarityai-copy-btn")
      ?.addEventListener("click", () => {
        this.copySummary(summary);
      });

    this.summaryPanel
      .querySelector(".clarityai-export-btn")
      ?.addEventListener("click", () => {
        this.exportSummary(summary);
      });

    document.body.appendChild(this.summaryPanel);

    // Animate in
    setTimeout(() => {
      this.summaryPanel?.classList.add("show");
    }, 10);
  }

  /**
   * Copy summary to clipboard
   */
  private async copySummary(summary: Summary): Promise<void> {
    try {
      const text = StorageManager.exportSummaryAsText(summary);
      await navigator.clipboard.writeText(text);

      // Show success feedback
      const btn = this.summaryPanel?.querySelector(".clarityai-copy-btn");
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = "✅ Copied!";
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to copy summary:", error);
      this.showError("Failed to copy summary");
    }
  }

  /**
   * Export summary as markdown file
   */
  private exportSummary(summary: Summary): void {
    try {
      const markdown = StorageManager.exportSummaryAsMarkdown(summary);
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${summary.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export summary:", error);
      this.showError("Failed to export summary");
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
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
}

// Initialize when script loads
new ClarityAIContent();
