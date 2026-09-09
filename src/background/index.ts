import { sendToContentScript } from "@plasmohq/messaging";

export {};

// Detect page change
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId !== 0) return

  sendToContentScript({
    tabId: details.tabId,
    name: "page-changed"
  });
});