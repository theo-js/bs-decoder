import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ['https://www.youtube.com/*']
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.name !== "captions-transformed") return;
    
    window.postMessage({
        source: 'captions-transformed-relay',
        payload: request.body
    }, "*")
})