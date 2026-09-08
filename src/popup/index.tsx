import { useEffect, useRef, useState } from 'react';
import { Button } from '~components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~components/ui/hover-card';
import { Info } from 'lucide-react';
import { sendToContentScript } from '@plasmohq/messaging';
import type { Tab } from '~types/chrome/tab';
import { isYoutubeVideoUrl } from '~helpers/youtube/isYoutubeVideoUrl';
import { useReadCaptions } from './hooks/queries/useReadCaptions';
import { useTransformCaptions } from './hooks/mutations/useTransformCaptions';
import { PopupProvider } from './core';
import '~../style.css';

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

	useEffect(() => {
		chrome.storage.local.get('groqApiKey', (result) => {
			if (chrome.runtime.lastError) {
				console.error('Unable to load the Groq API key', chrome.runtime.lastError);
				return;
			}

			const storedApiKey = result.groqApiKey;
			if (typeof storedApiKey === 'string') {
				setGroqApiKey(storedApiKey);
			}
		});
	}, []);

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
		<div className="w-[300px] p-4 flex flex-col gap-1">
			<h1 className='text-primary'>BS Decoder</h1>

			{!currentTab?.isYoutubeVideoUrl && (
				<p>Please open a YouTube video page to decode the subtitles</p>
			)}

			{currentTab?.isYoutubeVideoUrl && (
				<>
					{isFetchingCaptions && <p>Searching for captions...</p>}

					{!isFetchingCaptions && (
						<>
							<label htmlFor="groq-api-key" className="flex items-center gap-1">
								Groq API key
								<HoverCard>
									<HoverCardTrigger
										openOnHover
										render={
											<button
												type="button"
												aria-label="How to get a Groq API key"
												className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
											/>
										}>
										<Info className="size-3" />
									</HoverCardTrigger>
									<HoverCardContent>
										<p className="font-medium">Get your Groq API key</p>
										<p className="mt-1 text-muted-foreground">
											Create a free account at console.groq.com, open the API Keys
											section, create a key, then paste it here. It is saved only
											in this extension&apos;s local storage.
										</p>
									</HoverCardContent>
								</HoverCard>
							</label>
							<input
								id="groq-api-key"
								type="password"
								autoComplete="off"
								value={groqApiKey}
								onChange={(event) => {
									const value = event.target.value;
									setGroqApiKey(value);
									chrome.storage.local.set({ groqApiKey: value }, () => {
										if (chrome.runtime.lastError) {
											console.error('Unable to save the Groq API key', chrome.runtime.lastError);
										}
									});
								}}
								className="h-8 rounded-md border bg-background px-2 text-sm"
								placeholder="gsk_..."
							/>

							{!captions && (
								<p>
									Please enable captions on the YouTube video player to start
									decoding
								</p>
							)}

							{(!transformCaptions.isSuccess) && (
								<Button
									disabled={!captions || !groqApiKey.trim() || transformCaptions.isPending}
									onClick={() =>
										captions &&
										transformCaptions.mutate({ captions, apiKey: groqApiKey.trim() })
									}>
									{transformCaptions.isPending ? 'Decoding...' : 'Decode'}
								</Button>
							)}

							{transformCaptions.isSuccess && <p>
								The BS has been decoded. You can now read the result directly on top of your video.
							</p>}
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
