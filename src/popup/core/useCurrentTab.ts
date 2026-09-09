import { useEffect, useRef, useState } from "react";
import { isYoutubeVideoUrl } from "~helpers/youtube/isYoutubeVideoUrl";
import type { Tab } from "~types/chrome/tab";

export function useCurrentTab() {
    const currentTabIdRef = useRef<number | null>(null);
    const [currentTab, setCurrentTab] = useState<Tab | null>(null);

    useEffect(() => {
		// Get initial state of the current tab
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs.length === 0) return;
			const tab = tabs[0];
			currentTabIdRef.current = tab.id ?? null;
			setCurrentTab(
				tab.id && tab.url
					? {
							id: tab.id,
							url: tab.url,
							isYoutubeVideoUrl: isYoutubeVideoUrl(tab.url ?? ''),
						}
					: null
			);
		});

		// Handle URL changes (only for current tab)
		function handleTabUpdated(
			tabId: number,
			changeInfo: chrome.tabs.TabChangeInfo
		) {
			if (tabId === currentTabIdRef.current && changeInfo.url) {
				setCurrentTab((prev) => ({
					id: prev?.id ?? tabId,
					url: changeInfo.url ?? '',
					isYoutubeVideoUrl: isYoutubeVideoUrl(changeInfo.url ?? '')
				}));
			}
		}

		chrome.tabs.onUpdated.addListener(handleTabUpdated);

		// Cleanup when closing popup
		return () => {
			chrome.tabs.onUpdated.removeListener(handleTabUpdated);
		};
	}, []);

    return { currentTab };
}