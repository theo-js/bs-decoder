import { useEffect, useRef, useState, type FormEvent } from 'react';
import {} from '@plasmohq/messaging';
import styles from './index.module.css';
import type { Tab } from '~types/chrome/tab';
import { isYoutubeVideoUrl } from '~helpers/youtube/isYoutubeVideoUrl';
import { useReadCaptions } from './hooks/queries/useReadCaptions';
import { PopupProvider } from './core';
import './index.css';
import { useTransformCaptions } from './hooks/mutations/useTransformCaptions';
import { useModelStatus } from './hooks/queries/useModelStatus';

function IndexPopup() {
	// Attributes
	const currentTabIdRef = useRef<number | null>(null);
	const [currentTab, setCurrentTab] = useState<Tab | null>(null);

	const { modelStatus } = useModelStatus();

	const { data: captions, isFetching: isFetchingCaptions } = useReadCaptions();
	const { mutate: transformCaptions } = useTransformCaptions();

	// Handlers
	function handleTransformCaptionsFormSubmit(e: FormEvent) {
		e.preventDefault();
		if (!captions?.length) return;

		transformCaptions(captions);
	}

	// Effects
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
							isYoutubeVideoUrl: isYoutubeVideoUrl(tab.url ?? '')
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

	// Render
	return (
		<div className={styles.popupContainer}>
			<h1>Welcome to BS Decoder</h1>

			<strong>Model status: {modelStatus}</strong>

			{!currentTab?.isYoutubeVideoUrl && (
				<p>Please open a YouTube video page to decode the subtitles</p>
			)}

			{currentTab?.isYoutubeVideoUrl && (
				<>
					{isFetchingCaptions && <p>Searching for captions...</p>}

					{!isFetchingCaptions && (
						<>
							{!captions && (
								<p>
									Please enable captions on the YouTube video player to start
									decoding
								</p>
							)}

							<button
								disabled={!captions}
								onClick={handleTransformCaptionsFormSubmit}>
								Decode
							</button>
						</>
					)}
				</>
			)}
		</div>
	);
}

const IndexPopupWithProvider = () => (
	<PopupProvider>
		<IndexPopup />
	</PopupProvider>
);

export default IndexPopupWithProvider;
