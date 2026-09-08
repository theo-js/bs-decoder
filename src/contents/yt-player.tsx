import { useEffect, useMemo, useRef, useState } from 'react';
import type {
	PlasmoCSConfig,
	PlasmoGetInlineAnchor,
	PlasmoGetStyle
} from 'plasmo';
import type { ParsedCaption } from '~types/youtube/caption';

export const config: PlasmoCSConfig = {
	matches: ['https://www.youtube.com/*']
};

const SYNC_INTERVAL_IN_MS = 50;

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
	const player = document.querySelector<HTMLElement>('#movie_player');

	if (!player) {
		throw new Error('YouTube player was not found');
	}

	return player;
};

export const getStyle: PlasmoGetStyle = () => {
	const style = document.createElement('style');
	style.textContent = `
		:host {
			position: absolute;
			inset: 0;
			z-index: 2;
			pointer-events: none;
		}

		.yt-player-dialogue {
			position: absolute;
			left: 50%;
			bottom: 12%;
			transform: translateX(-50%);
			max-width: min(80%, 720px);
			padding: 0.5rem 0.75rem;
			border-radius: 0.25rem;
			background: rgb(0 0 0 / 80%);
			color: white;
			font: 500 1.25rem/1.4 Arial, sans-serif;
			text-align: center;
			text-wrap: balance;
		}
	`;
	return style;
};

function findCaptionAtTime(captions: ParsedCaption[], timeInSeconds: number) {
	const timeInMilliseconds = timeInSeconds * 1000;
	let low = 0;
	let high = captions.length - 1;
	let candidateIndex = -1;

	while (low <= high) {
		const middle = Math.floor((low + high) / 2);
		if (captions[middle].start <= timeInMilliseconds) {
			candidateIndex = middle;
			low = middle + 1;
		} else {
			high = middle - 1;
		}
	}

	if (candidateIndex === -1) return null;

	const caption = captions[candidateIndex];
	return timeInMilliseconds < caption.start + caption.duration
		? caption
		: null;
}

function YtPlayer() {
	const [captions, setCaptions] = useState<ParsedCaption[]>([]);
	const [currentCaption, setCurrentCaption] = useState<ParsedCaption | null>(
		null
	);
	const currentCaptionRef = useRef<ParsedCaption | null>(null);

	const sortedCaptions = useMemo(
		() => [...captions].sort((a, b) => a.start - b.start),
		[captions]
	);

	useEffect(() => {
		function handleCaptions(event: MessageEvent) {
			if (event.source !== window) return;

			const payload = event.data?.payload;
			if (
				event.data?.source !== 'captions-transformed-relay' ||
				!Array.isArray(payload)
			) {
				return;
			}

			currentCaptionRef.current = null;
			setCurrentCaption(null);
			setCaptions(payload);
		}

		window.addEventListener('message', handleCaptions);
		return () => window.removeEventListener('message', handleCaptions);
	}, []);

	useEffect(() => {
		const video = document.querySelector<HTMLVideoElement>('video');
		if (video === null || sortedCaptions.length === 0) return;

		function syncCaption() {
			const currentTime = document.querySelector<HTMLVideoElement>('video')
				?.currentTime;
			if (currentTime === undefined) return;

			const nextCaption = findCaptionAtTime(
				sortedCaptions,
				currentTime
			);
			if (
				nextCaption?.start === currentCaptionRef.current?.start &&
				nextCaption?.text === currentCaptionRef.current?.text
			) {
				return;
			}

			currentCaptionRef.current = nextCaption;
			setCurrentCaption(nextCaption);
		}

		let intervalId: number | null = null;
		function stopSync() {
			if (intervalId !== null) window.clearInterval(intervalId);
			intervalId = null;
		}
		function startSync() {
			if (intervalId !== null) return;
			syncCaption();
			intervalId = window.setInterval(syncCaption, SYNC_INTERVAL_IN_MS);
		}

		function handleSeeked() {
			syncCaption();
		}

		video.addEventListener('play', startSync);
		video.addEventListener('pause', stopSync);
		video.addEventListener('seeked', handleSeeked);
		syncCaption();
		if (!video.paused) startSync();

		return () => {
			stopSync();
			video.removeEventListener('play', startSync);
			video.removeEventListener('pause', stopSync);
			video.removeEventListener('seeked', handleSeeked);
		};
	}, [sortedCaptions]);

	if (!currentCaption) return null;

	return (
		<div className="yt-player-dialogue" role="dialog" aria-label="Caption">
			{currentCaption.text}
		</div>
	);
}

export default YtPlayer;
