import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ['https://www.youtube.com/*']
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.name !== 'page-changed') return;
    
    window.postMessage({
        source: 'page-changed-relay',
        payload: request.body
    }, "*")
});
