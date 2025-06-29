import { StorageManager } from "./storageManager";
import { Summary, ExtensionSettings } from "./types";

/**
 * Popup Script - Extension popup interface
 */
class ClarityAIPopup {
  private summariesContainer: HTMLElement | null = null;
  private settingsContainer: HTMLElement | null = null;
  private currentTab: chrome.tabs.Tab | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initialize the popup
   */
  private async init(): Promise<void> {
    await this.getCurrentTab();
    this.setupUI();
    await this.loadSummaries();
    await this.loadSettings();
  }

  /**
   * Get current active tab
   */
  private async getCurrentTab(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      this.currentTab = tab;
    } catch (error) {
      console.error("Failed to get current tab:", error);
    }
  }

  /**
   * Setup popup UI
   */
  private setupUI(): void {
    this.summariesContainer = document.getElementById("summaries-container");
    this.settingsContainer = document.getElementById("settings-container");

    // Tab switching
    document.getElementById("summaries-tab")?.addEventListener("click", () => {
      this.showTab("summaries");
    });

    document.getElementById("settings-tab")?.addEventListener("click", () => {
      this.showTab("settings");
    });

    // Clear all summaries
    document
      .getElementById("clear-summaries")
      ?.addEventListener("click", async () => {
        await StorageManager.clearSummaries();
        await this.loadSummaries();
      });

    // Toggle site enable/disable
    document
      .getElementById("toggle-site")
      ?.addEventListener("click", async () => {
        if (this.currentTab?.url) {
          await StorageManager.toggleSite(this.currentTab.url);
          await this.loadSettings();
        }
      });
  }

  /**
   * Show specific tab
   */
  private showTab(tab: "summaries" | "settings"): void {
    // Update tab buttons
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document.getElementById(`${tab}-tab`)?.classList.add("active");

    // Update tab content
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));
    document.getElementById(`${tab}-content`)?.classList.add("active");
  }

  /**
   * Load and display summaries
   */
  private async loadSummaries(): Promise<void> {
    if (!this.summariesContainer) return;

    try {
      const summaries = await StorageManager.getSummaries();

      if (summaries.length === 0) {
        this.summariesContainer.innerHTML = `
          <div class="empty-state">
            <p>📖 No summaries yet</p>
            <p>Visit a webpage and click the floating Summarize button to get started!</p>
          </div>
        `;
        return;
      }

      this.summariesContainer.innerHTML = summaries
        .map(
          (summary) => `
        <div class="summary-item" data-id="${summary.id}">
          <div class="summary-header">
            <h4 class="summary-title">${this.truncateText(
              summary.title,
              50
            )}</h4>
            <div class="summary-actions">
              <button class="action-btn copy-btn" title="Copy summary">📋</button>
              <button class="action-btn delete-btn" title="Delete summary">🗑️</button>
            </div>
          </div>
          <div class="summary-meta">
            <span class="word-count">${summary.wordCount} words</span>
            <span class="date">${new Date(
              summary.timestamp
            ).toLocaleDateString()}</span>
          </div>
          <div class="summary-points">
            ${summary.points
              .slice(0, 2)
              .map(
                (point) => `
              <div class="point">• ${this.truncateText(point, 80)}</div>
            `
              )
              .join("")}
            ${
              summary.points.length > 2
                ? `<div class="point-more">+${
                    summary.points.length - 2
                  } more points</div>`
                : ""
            }
          </div>
          <div class="summary-url">
            <a href="${summary.url}" target="_blank" title="${summary.url}">
              ${this.truncateText(summary.url, 40)}
            </a>
          </div>
        </div>
      `
        )
        .join("");

      // Add event listeners
      this.summariesContainer
        .querySelectorAll(".copy-btn")
        .forEach((btn, index) => {
          btn.addEventListener("click", () =>
            this.copySummary(summaries[index])
          );
        });

      this.summariesContainer
        .querySelectorAll(".delete-btn")
        .forEach((btn, index) => {
          btn.addEventListener("click", () =>
            this.deleteSummary(summaries[index].id)
          );
        });
    } catch (error) {
      console.error("Failed to load summaries:", error);
      this.summariesContainer.innerHTML = `
        <div class="error-state">
          <p>⚠️ Failed to load summaries</p>
        </div>
      `;
    }
  }

  /**
   * Load and display settings
   */
  private async loadSettings(): Promise<void> {
    if (!this.settingsContainer) return;

    try {
      const settings = await StorageManager.getSettings();
      const isEnabledForCurrentSite = this.currentTab?.url
        ? await StorageManager.isEnabledForSite(this.currentTab.url)
        : true;

      this.settingsContainer.innerHTML = `
        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" id="extension-enabled" ${
              settings.enabled ? "checked" : ""
            }>
            <span class="checkmark"></span>
            Enable ClarityAI Extension
          </label>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" id="auto-detect" ${
              settings.autoDetect ? "checked" : ""
            }>
            <span class="checkmark"></span>
            Auto-detect long articles
          </label>
          <p class="setting-description">Show suggestions for long content</p>
        </div>

        ${
          this.currentTab?.url
            ? `
          <div class="setting-item">
            <label class="setting-label">
              <input type="checkbox" id="site-enabled" ${
                isEnabledForCurrentSite ? "checked" : ""
              }>
              <span class="checkmark"></span>
              Enable for ${new URL(this.currentTab.url).hostname}
            </label>
          </div>
        `
            : ""
        }

        <div class="setting-item">
          <label class="setting-label">
            Summary Format
            <select id="summary-format">
              <option value="bullets" ${
                settings.summaryFormat === "bullets" ? "selected" : ""
              }>Bullet Points</option>
              <option value="paragraph" ${
                settings.summaryFormat === "paragraph" ? "selected" : ""
              }>Paragraph</option>
            </select>
          </label>
        </div>

        <div class="setting-item">
          <h4>Disabled Sites</h4>
          <div class="disabled-sites-list">
            ${
              settings.disabledSites.length === 0
                ? '<p class="empty-list">No disabled sites</p>'
                : settings.disabledSites
                    .map(
                      (site) => `
                <div class="disabled-site">
                  <span>${site}</span>
                  <button class="remove-site-btn" data-site="${site}">Remove</button>
                </div>
              `
                    )
                    .join("")
            }
          </div>
        </div>
      `;

      // Add event listeners for settings
      this.setupSettingsListeners();
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  /**
   * Setup settings event listeners
   */
  private setupSettingsListeners(): void {
    // Extension enabled toggle
    document
      .getElementById("extension-enabled")
      ?.addEventListener("change", async (e) => {
        const enabled = (e.target as HTMLInputElement).checked;
        const settings = await StorageManager.getSettings();
        settings.enabled = enabled;
        await StorageManager.saveSettings(settings);
      });

    // Auto-detect toggle
    document
      .getElementById("auto-detect")
      ?.addEventListener("change", async (e) => {
        const autoDetect = (e.target as HTMLInputElement).checked;
        const settings = await StorageManager.getSettings();
        settings.autoDetect = autoDetect;
        await StorageManager.saveSettings(settings);
      });

    // Site enabled toggle
    document
      .getElementById("site-enabled")
      ?.addEventListener("change", async (e) => {
        if (this.currentTab?.url) {
          await StorageManager.toggleSite(this.currentTab.url);
        }
      });

    // Summary format change
    document
      .getElementById("summary-format")
      ?.addEventListener("change", async (e) => {
        const format = (e.target as HTMLSelectElement).value as
          | "bullets"
          | "paragraph";
        const settings = await StorageManager.getSettings();
        settings.summaryFormat = format;
        await StorageManager.saveSettings(settings);
      });

    // Remove site buttons
    document.querySelectorAll(".remove-site-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const site = (e.target as HTMLElement).dataset.site;
        if (site) {
          const settings = await StorageManager.getSettings();
          settings.disabledSites = settings.disabledSites.filter(
            (s) => s !== site
          );
          await StorageManager.saveSettings(settings);
          await this.loadSettings();
        }
      });
    });
  }

  /**
   * Copy summary to clipboard
   */
  private async copySummary(summary: Summary): Promise<void> {
    try {
      const text = StorageManager.exportSummaryAsText(summary);
      await navigator.clipboard.writeText(text);

      // Show temporary success message
      this.showToast("Summary copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy summary:", error);
      this.showToast("Failed to copy summary", "error");
    }
  }

  /**
   * Delete a summary
   */
  private async deleteSummary(summaryId: string): Promise<void> {
    try {
      await StorageManager.deleteSummary(summaryId);
      await this.loadSummaries();
    } catch (error) {
      console.error("Failed to delete summary:", error);
      this.showToast("Failed to delete summary", "error");
    }
  }

  /**
   * Show toast notification
   */
  private showToast(
    message: string,
    type: "success" | "error" = "success"
  ): void {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Truncate text with ellipsis
   */
  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }
}

// Initialize popup when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new ClarityAIPopup();
});
