/**
 * Background Script - Service Worker
 * Handles extension lifecycle and background tasks
 */

// Extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("ClarityAI Extension installed");
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTabInfo") {
    // Get current tab information
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({
          url: tabs[0].url,
          title: tabs[0].title,
        });
      }
    });
    return true; // Will respond asynchronously
  }
});

// Context menu for right-click summarization
chrome.contextMenus.create({
  id: "clarityai-summarize",
  title: "Summarize with ClarityAI",
  contexts: ["page", "selection"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "clarityai-summarize" && tab?.id) {
    // Send message to content script to trigger summarization
    chrome.tabs.sendMessage(tab.id, { action: "triggerSummarization" });
  }
});
