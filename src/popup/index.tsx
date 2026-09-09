import { useEffect, useRef, useState } from 'react';
import { Button } from '~components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~components/ui/hover-card';
import { Info, KeyRound, Sparkles, Video } from 'lucide-react';
import { sendToContentScript } from '@plasmohq/messaging';
import type { Tab } from '~types/chrome/tab';
import { isYoutubeVideoUrl } from '~helpers/youtube/isYoutubeVideoUrl';
import { useReadCaptions } from './hooks/queries/useReadCaptions';
import { useTransformCaptions } from './hooks/mutations/useTransformCaptions';
import { PopupProvider } from './core';
import '~../style.css';
import { GroqApiKeyField } from './components/GroqApiKeyField';

function IndexPopup() {
	// Attributes
	const currentTabIdRef = useRef<number | null>(null);
	const [currentTab, setCurrentTab] = useState<Tab | null>(null);
	const [groqApiKey, setGroqApiKey] = useState('');

	const { data: captions, isFetching: isFetchingCaptions } = useReadCaptions();
	const transformCaptions = useTransformCaptions({
		onSuccess: (transformedCaptions) => {
			sendToContentScript({
				name: 'captions-transformed',
				tabId: currentTab?.id,
				body: transformedCaptions
			})
		}
	});

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

	// Render
	return (
		<div className="popup-shell w-[360px]">
			<header className="popup-header">
				<div className="brand-mark" aria-hidden="true">
					<Sparkles className="size-5" />
				</div>
				<div>
					<p className="brand-name">BS Decoder</p>
					<p className="brand-tagline">Everyone talks. We translate.</p>
				</div>
			</header>

			{!currentTab?.isYoutubeVideoUrl && (
				<>
					<div className="status-card">
						<Video className="status-icon" />
						<div>
							<p className="status-title">Ready when you are</p>
							<p className="status-copy">Open a YouTube video to translate the doublespeak in its captions.</p>
						</div>
					</div>

					<GroqApiKeyField {...{ groqApiKey, setGroqApiKey }} />
				</>
			)}

			{currentTab?.isYoutubeVideoUrl && (
				<div className="popup-content">
					<div className="eyebrow">THE TRANSLATOR FOR SPEECHES</div>
					<h1>Nobody talks straight anymore.</h1>
					<p className="intro-copy">We turn corporate and diplomatic nonsense into honest sentences.</p>

					{isFetchingCaptions && <div className="status-card"><span className="status-pulse" /> Looking for captions…</div>}

					{!isFetchingCaptions && (
						<>
							<GroqApiKeyField {...{ groqApiKey, setGroqApiKey }} />

							{!captions && (
								<p className="helper-copy">Turn on YouTube captions to make the decoder available.</p>
							)}

							{(!transformCaptions.isSuccess) && (
								<Button
									className="decode-button"
									disabled={!captions || !groqApiKey.trim() || transformCaptions.isPending}
									onClick={() =>
										captions &&
										transformCaptions.mutate({ captions, apiKey: groqApiKey.trim() })
									}>
									{transformCaptions.isPending ? 'Finding the subtext…' : 'Decode the subtext'}
								</Button>
							)}

							{transformCaptions.isSuccess && <p>
								<span className="success-title">Decoded.</span> Read the clearer version directly on your video.
							</p>}

							{transformCaptions.isError && <p className="text-red-500">
								Error: check your Groq key, or wait (you may have hit your token limit).
							</p>}
						</>
					)}
				</div>
			)}
			
			<footer className="popup-footer">Your key stays in this browser.</footer>
		</div>
	);
}

const IndexPopupWithProvider = () => (
	<PopupProvider>
		<IndexPopup />
	</PopupProvider>
);

export default IndexPopupWithProvider;
