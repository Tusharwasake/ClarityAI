import { Summary, ExtensionSettings } from "./types";

/**
 * Local Storage & Quick Access
 * Manages summaries and settings in Chrome storage
 */
export class StorageManager {
  private static readonly MAX_SUMMARIES = 10;
  private static readonly SUMMARIES_KEY = "clarityai_summaries";
  private static readonly SETTINGS_KEY = "clarityai_settings";

  /**
   * Get default settings
   */
  static getDefaultSettings(): ExtensionSettings {
    return {
      enabled: true,
      autoDetect: true,
      disabledSites: [],
      summaryFormat: "bullets",
    };
  }

  /**
   * Save a summary to local storage
   */
  static async saveSummary(summary: Summary): Promise<void> {
    try {
      const summaries = await this.getSummaries();

      // Add new summary to the beginning
      summaries.unshift(summary);

      // Keep only the latest MAX_SUMMARIES
      const limitedSummaries = summaries.slice(0, this.MAX_SUMMARIES);

      await chrome.storage.local.set({
        [this.SUMMARIES_KEY]: limitedSummaries,
      });
    } catch (error) {
      console.error("Failed to save summary:", error);
    }
  }

  /**
   * Get all saved summaries
   */
  static async getSummaries(): Promise<Summary[]> {
    try {
      const result = await chrome.storage.local.get(this.SUMMARIES_KEY);
      return result[this.SUMMARIES_KEY] || [];
    } catch (error) {
      console.error("Failed to get summaries:", error);
      return [];
    }
  }

  /**
   * Delete a specific summary
   */
  static async deleteSummary(summaryId: string): Promise<void> {
    try {
      const summaries = await this.getSummaries();
      const filteredSummaries = summaries.filter((s) => s.id !== summaryId);

      await chrome.storage.local.set({
        [this.SUMMARIES_KEY]: filteredSummaries,
      });
    } catch (error) {
      console.error("Failed to delete summary:", error);
    }
  }

  /**
   * Clear all summaries
   */
  static async clearSummaries(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.SUMMARIES_KEY);
    } catch (error) {
      console.error("Failed to clear summaries:", error);
    }
  }

  /**
   * Get extension settings
   */
  static async getSettings(): Promise<ExtensionSettings> {
    try {
      const result = await chrome.storage.local.get(this.SETTINGS_KEY);
      return { ...this.getDefaultSettings(), ...result[this.SETTINGS_KEY] };
    } catch (error) {
      console.error("Failed to get settings:", error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Save extension settings
   */
  static async saveSettings(settings: ExtensionSettings): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.SETTINGS_KEY]: settings,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  /**
   * Update extension settings (partial update)
   */
  static async updateSettings(updates: Partial<ExtensionSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...updates };
      await this.saveSettings(newSettings);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  }

  /**
   * Check if the extension is enabled for a specific site
   */
  static async isEnabledForSite(url: string): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      if (!settings.enabled) return false;

      const hostname = new URL(url).hostname;
      return !settings.disabledSites.includes(hostname);
    } catch (error) {
      console.error("Failed to check site settings:", error);
      return true;
    }
  }

  /**
   * Toggle extension for a specific site
   */
  static async toggleSite(url: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      const hostname = new URL(url).hostname;

      if (settings.disabledSites.includes(hostname)) {
        settings.disabledSites = settings.disabledSites.filter(
          (site) => site !== hostname
        );
      } else {
        settings.disabledSites.push(hostname);
      }

      await this.saveSettings(settings);
    } catch (error) {
      console.error("Failed to toggle site:", error);
    }
  }

  /**
   * Enable extension for a specific site
   */
  static async enableSite(url: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      const hostname = new URL(url).hostname;
      
      settings.disabledSites = settings.disabledSites.filter(
        (site) => site !== hostname
      );
      
      await this.saveSettings(settings);
    } catch (error) {
      console.error("Failed to enable site:", error);
    }
  }

  /**
   * Disable extension for a specific site
   */
  static async disableSite(url: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      const hostname = new URL(url).hostname;
      
      if (!settings.disabledSites.includes(hostname)) {
        settings.disabledSites.push(hostname);
      }
      
      await this.saveSettings(settings);
    } catch (error) {
      console.error("Failed to disable site:", error);
    }
  }

  /**
   * Export summary as text
   */
  static exportSummaryAsText(summary: Summary): string {
    const date = new Date(summary.timestamp).toLocaleDateString();
    return `${summary.title}\n${
      summary.url
    }\nSummarized on ${date}\n\n${summary.points
      .map((point, i) => `${i + 1}. ${point}`)
      .join("\n")}`;
  }

  /**
   * Export summary as markdown
   */
  static exportSummaryAsMarkdown(summary: Summary): string {
    const date = new Date(summary.timestamp).toLocaleDateString();
    return `# ${summary.title}\n\n**URL:** ${
      summary.url
    }  \n**Date:** ${date}  \n**Word Count:** ${
      summary.wordCount
    }\n\n## Summary\n\n${summary.points
      .map((point) => `- ${point}`)
      .join("\n")}`;
  }

  /**
   * Generate unique ID for summary
   */
  static generateSummaryId(): string {
    return `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
