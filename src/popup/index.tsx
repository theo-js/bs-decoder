import { useState } from 'react';
import { Button } from '~components/ui/button';
import { Sparkles, Video } from 'lucide-react';
import { sendToBackground } from '@plasmohq/messaging';
import { useReadCaptions } from './hooks/queries/useReadCaptions';
import { GroqApiKeyField } from './components/GroqApiKeyField';
import type { ParsedCaption } from '~types/youtube/caption';
import type { TransformCaptionsParams } from '~background/messages/transform-captions';
import { TASK_IDS } from '~persistence/extension-storage/schema';
import { useTaskState } from './hooks/useTaskState';
import { useCurrentTab } from './core/useCurrentTab';
import { PopupProvider } from './core';
import '~../style.css';

function IndexPopup() {
	// Attributes
	const { currentTab } = useCurrentTab();
	const [groqApiKey, setGroqApiKey] = useState('');

	const { data: captions, isFetching: isFetchingCaptions } = useReadCaptions();
	const [transformCaptionsTask, setTransformCaptionsTask] = useTaskState<ParsedCaption[], string>({
		taskId: TASK_IDS.transformCaptionsTask
	});

	function handleTransformCaptionsClick() {
		if (!captions?.length || !groqApiKey) return;

		setTransformCaptionsTask({ status: 'pending' });
		sendToBackground<TransformCaptionsParams>({
			name: 'transform-captions',
			body: { captions, groqApiKey, tabId: currentTab?.id }
		})
	}

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

							{!captions?.length && (
								<p className="helper-copy">Turn on YouTube captions to make the decoder available.</p>
							)}

							<Button
								className="decode-button"
								disabled={!captions?.length || !groqApiKey.trim() || transformCaptionsTask.status === 'pending'}
								onClick={handleTransformCaptionsClick}>
								{transformCaptionsTask.status === 'pending' ? 'Finding the subtext…' : 'Decode the subtext'}
							</Button>

							{transformCaptionsTask.status === 'success' && <p>
								<span className="success-title">Decoded.</span> Read the clearer version directly on your video.
							</p>}

							{transformCaptionsTask.status === 'error' && <p className="text-red-500">
								{transformCaptionsTask.error}
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
