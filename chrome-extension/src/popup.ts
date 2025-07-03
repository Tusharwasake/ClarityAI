import { StorageManager } from "./storageManager";
import { Summary, ExtensionSettings } from "./types";

/**
 * Popup Script - Simple functional approach
 */

// Global state
let currentTab: chrome.tabs.Tab | null = null;
let summariesContainer: HTMLElement | null = null;
let settingsContainer: HTMLElement | null = null;

/**
 * Initialize the popup when DOM loads
 */
document.addEventListener("DOMContentLoaded", async () => {
  await initPopup();
});

/**
 * Main initialization function
 */
async function initPopup(): Promise<void> {
  await getCurrentTab();
  setupUI();
  await loadSummaries();
  await loadSettings();
}

/**
 * Get current active tab
 */
async function getCurrentTab(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    currentTab = tab;
  } catch (error) {
    console.error("Failed to get current tab:", error);
  }
}

/**
 * Setup popup UI event listeners
 */
function setupUI(): void {
  summariesContainer = document.getElementById("summaries-container");
  settingsContainer = document.getElementById("settings-container");

  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => switchTab(index));
  });

  // Initially show summaries tab
  switchTab(0);
}

/**
 * Switch between tabs
 */
function switchTab(tabIndex: number): void {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // Update active tab button
  tabButtons.forEach((btn, index) => {
    if (index === tabIndex) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Show/hide tab content
  tabContents.forEach((content, index) => {
    if (index === tabIndex) {
      (content as HTMLElement).style.display = "block";
    } else {
      (content as HTMLElement).style.display = "none";
    }
  });

  // Load content for active tab
  if (tabIndex === 0) {
    loadSummaries();
  } else if (tabIndex === 1) {
    loadSettings();
  }
}

/**
 * Load and display summaries
 */
async function loadSummaries(): Promise<void> {
  if (!summariesContainer) return;

  try {
    const summaries = await StorageManager.getSummaries();

    if (summaries.length === 0) {
      summariesContainer.innerHTML = `
        <div class="empty-state">
          <p>📄 No summaries yet</p>
          <p>Browse to any article and click the floating summarize button!</p>
        </div>
      `;
      return;
    }

    summariesContainer.innerHTML = summaries
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(
        (summary, index) =>
          `
        <div class="summary-item">
          <div class="summary-header">
            <h3 class="summary-title">${escapeHtml(summary.title)}</h3>
            <div class="summary-actions">
              <button class="copy-btn" data-index="${index}" title="Copy summary">
                📋
              </button>
              <button class="delete-btn" data-index="${index}" title="Delete summary">
                🗑️
              </button>
            </div>
          </div>
          <div class="summary-points">
            ${summary.points
              .map(
                (point) =>
                  `<div class="summary-point">• ${escapeHtml(point)}</div>`
              )
              .join("")}
          </div>
          <div class="summary-meta">
            <span class="summary-date">
              ${new Date(summary.timestamp).toLocaleDateString()}
            </span>
            <span class="summary-words">${summary.wordCount} words</span>
          </div>
          <div class="summary-url">
            <a href="${summary.url}" target="_blank" title="${summary.url}">
              ${truncateText(summary.url, 40)}
            </a>
          </div>
        </div>
        `
      )
      .join("");

    // Add event listeners for copy and delete buttons
    summariesContainer.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt((e.target as HTMLElement).dataset.index || "0");
        copySummary(summaries[index]);
      });
    });

    summariesContainer.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt((e.target as HTMLElement).dataset.index || "0");
        deleteSummary(summaries[index].id);
      });
    });
  } catch (error) {
    console.error("Failed to load summaries:", error);
    summariesContainer.innerHTML = `
      <div class="error-state">
        <p>⚠️ Failed to load summaries</p>
      </div>
    `;
  }
}

/**
 * Load and display settings
 */
async function loadSettings(): Promise<void> {
  if (!settingsContainer) return;

  try {
    const settings = await StorageManager.getSettings();
    const isEnabledForCurrentSite = currentTab?.url
      ? await StorageManager.isEnabledForSite(currentTab.url)
      : true;

    settingsContainer.innerHTML = `
      <div class="settings-section">
        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" id="enabledGlobal" ${
              settings.enabled ? "checked" : ""
            }>
            <span>Enable ClarityAI globally</span>
          </label>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" id="autoDetect" ${
              settings.autoDetect ? "checked" : ""
            }>
            <span>Auto-detect long articles</span>
          </label>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <input type="checkbox" id="currentSite" ${
              isEnabledForCurrentSite ? "checked" : ""
            }>
            <span>Enable for current site</span>
          </label>
          <div class="setting-description">
            ${currentTab?.url ? new URL(currentTab.url).hostname : "No site"}
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">
            <span>Disabled sites</span>
          </label>
          <div class="disabled-sites">
            ${settings.disabledSites
              .map(
                (site) => `
                <div class="disabled-site">
                  <span>${site}</span>
                  <button class="remove-site-btn" data-site="${site}">×</button>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    setupSettingsListeners();
  } catch (error) {
    console.error("Failed to load settings:", error);
    settingsContainer.innerHTML = `
      <div class="error-state">
        <p>⚠️ Failed to load settings</p>
      </div>
    `;
  }
}

/**
 * Setup event listeners for settings
 */
function setupSettingsListeners(): void {
  // Global enable/disable
  document
    .getElementById("enabledGlobal")
    ?.addEventListener("change", async (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      await StorageManager.updateSettings({ enabled });
    });

  // Auto-detect toggle
  document
    .getElementById("autoDetect")
    ?.addEventListener("change", async (e) => {
      const autoDetect = (e.target as HTMLInputElement).checked;
      await StorageManager.updateSettings({ autoDetect });
    });

  // Current site toggle
  document
    .getElementById("currentSite")
    ?.addEventListener("change", async (e) => {
      const enabled = (e.target as HTMLInputElement).checked;
      if (currentTab?.url) {
        if (enabled) {
          await StorageManager.enableSite(currentTab.url);
        } else {
          await StorageManager.disableSite(currentTab.url);
        }
      }
    });

  // Remove site buttons
  document.querySelectorAll(".remove-site-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const site = (e.target as HTMLElement).dataset.site;
      if (site) {
        await StorageManager.enableSite(`https://${site}`);
        await loadSettings(); // Reload settings
      }
    });
  });
}

/**
 * Copy summary to clipboard
 */
async function copySummary(summary: Summary): Promise<void> {
  try {
    const text = `${summary.title}\n\n${summary.points.join("\n")}`;
    await navigator.clipboard.writeText(text);
    showToast("Summary copied to clipboard!", "success");
  } catch (error) {
    console.error("Failed to copy summary:", error);
    showToast("Failed to copy summary", "error");
  }
}

/**
 * Delete a summary
 */
async function deleteSummary(summaryId: string): Promise<void> {
  try {
    await StorageManager.deleteSummary(summaryId);
    await loadSummaries(); // Reload summaries
  } catch (error) {
    console.error("Failed to delete summary:", error);
    showToast("Failed to delete summary", "error");
  }
}

/**
 * Show toast notification
 */
function showToast(
  message: string,
  type: "success" | "error" = "success"
): void {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
