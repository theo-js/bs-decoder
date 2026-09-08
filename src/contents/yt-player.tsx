import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import type {
	PlasmoCSConfig,
	PlasmoGetOverlayAnchor,
	PlasmoGetStyle
} from 'plasmo';
import type { ParsedCaption } from '~types/youtube/caption';

export const config: PlasmoCSConfig = {
	matches: ['https://www.youtube.com/*'],
	world: 'MAIN'
};

const SYNC_INTERVAL_IN_MS = 50;

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () => {
	const player = document.querySelector<HTMLElement>('video');
	if (!player) throw new Error('YouTube player was not found');

	return player;
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

const YtPlayer: FC = () => {
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
		<div style={{ position: 'relative', margin: '1rem' }}>
			<div style={{
				width: '2rem',
				height: '2rem',
				border: '1rem solid rgb(0 0 0 / 80%)',
				background: 'lightgreen',
				borderRadius: '100%'
			}} />

			<div style={{
				position: 'absolute',
				left: 'calc(100% + 1rem',
				top: '13px',
				borderTop: '7px solid transparent',
				borderBottom: '7px solid transparent',
				borderRight: '10px solid rgb(0 0 0 / 80%)',
			}} />

			<div role="dialog" aria-label="Caption" style={{
				position: 'absolute',
				left: 'calc(100% + 2rem)',
				top: '-0.5rem',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-start',
				padding: '1rem 1.5rem',
				borderRadius: '0.5rem',
				background: 'rgb(0 0 0 / 80%)',
				color: 'white',
				font: '500 2rem/1.4 Arial, sans-serif'
			}}>
				<legend style={{
					color: 'lightgreen',
					whiteSpace: 'nowrap',
					fontWeight: '500',
					fontSize: '.625em'
				}}>
						BS decoder:
				</legend>

				<div style={{ minWidth: '38rem' }}>
					{currentCaption.text}
				</div>
			</div>
		</div>
	);
};

export default YtPlayer;