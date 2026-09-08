import { useEffect, useRef, useState } from 'react';
import { Button } from '~components/ui/button';
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

	const { data: captions, isFetching: isFetchingCaptions } = useReadCaptions();
	const transformCaptions = useTransformCaptions({
		onSuccess: (transformedCaptions) => {
			console.log('sending transformed captions to content script', transformedCaptions);
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
							{!captions && (
								<p>
									Please enable captions on the YouTube video player to start
									decoding
								</p>
							)}

							{(!transformCaptions.isSuccess) && (
								<Button
									disabled={!captions || transformCaptions.isPending}
									onClick={() => captions && transformCaptions.mutate(captions)}>
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
