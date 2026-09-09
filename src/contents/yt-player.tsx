import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import type {
	PlasmoCSConfig,
	PlasmoGetOverlayAnchor,
} from 'plasmo';
import type { ParsedCaption } from '~types/youtube/caption';
import { SpeechIcon } from 'lucide-react';
import { Toggle } from '~components/ui/toggle';
import { cn } from 'cn';
import { DecoderIndicator } from '~components/ui/decoder-indicator';
import { franc } from 'lib/franc';

export const config: PlasmoCSConfig = {
	matches: ['https://www.youtube.com/*'],
	world: 'MAIN'
};

export { loadTailwindClassesIntoContentScriptUi as getStyle } from 'lib/utils';

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

	const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
	const isSpeechEnabledRef = useRef<boolean>(false);

	const sortedCaptions = useMemo(
		() => [...captions].sort((a, b) => a.start - b.start),
		[captions]
	);

	const captionsLanguage = useMemo(() => franc(captions.map(c => c.text).join(' ')), [captions]);

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

			handleCaptionChange(nextCaption);
		}

		function handleCaptionChange (nextCaption: ParsedCaption | null) {
			currentCaptionRef.current = nextCaption;
			setCurrentCaption(nextCaption);
			if (nextCaption && isSpeechEnabledRef.current) speakCaption(nextCaption);
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

	function handleToggleSpeech () {
		setIsSpeechEnabled((isSpeechEnabled) => {
			if (isSpeechEnabled) {
				window.speechSynthesis.cancel()
				isSpeechEnabledRef.current = false;
				return false;
			}

			if (currentCaption) speakCaption(currentCaption);
			isSpeechEnabledRef.current = true;
			return true
		});
	}

	function speakCaption (caption: ParsedCaption): void {
		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(caption.text);
		utterance.lang = captionsLanguage;
		const utteranceRate = calculateSpeechSpeed({ caption, language: captionsLanguage });
		if (typeof utteranceRate === 'number') utterance.rate = utteranceRate;
		utterance.pitch = 0;
		window.speechSynthesis.speak(utterance);
	}

	function calculateSpeechSpeed({ caption, language }: { caption: ParsedCaption; language: string; }): number | undefined {
		if (language !== 'fr') return; // only works well for French

		const BASELINE_CHARS_PER_SECOND = 15;
		
		const durationSeconds = caption.duration / 1000;
		if (durationSeconds <= 0) return 5; // default value if duration is invalid
		
		const charsPerSecond = caption.text.length / durationSeconds;
		const ratio = charsPerSecond / BASELINE_CHARS_PER_SECOND;
		
		const scale = Math.round(ratio * 5);
		return Math.min(10, Math.max(1, scale));
	}

	if (!currentCaption) return null;

	return (
		<div className="relative m-4">
			<DecoderIndicator />

			<div
				className="absolute left-[calc(100%+1rem)] top-[13px] border-b-[7px] border-t-[7px] border-b-transparent border-t-transparent border-r-[10px] border-r-black/80"
			/>

			<div
				role="dialog"
				aria-label="Caption"
				className="absolute left-[calc(100%+2rem)] top-[-0.5rem] flex flex-col items-start rounded-lg bg-black/80 px-6 py-4 text-white"
				style={{
				font: "500 2rem/1.4 Arial, sans-serif",
				}}
			>
				<div className="flex w-full items-center justify-between gap-4">
				<legend className="whitespace-nowrap text-[0.625em] font-medium text-[#8b5cf6]">
					BS decoder:
				</legend>

				<Toggle
					onClick={handleToggleSpeech}
					title={`Speech ${isSpeechEnabled ? 'enabled' : 'disabled'}`}
					className={cn('text-[0.625em] text-white/80', isSpeechEnabled && 'text-[#8b5cf6] hover:text-[#8b5cf6] focus:text-[#8b5cf6]')}
				>
					Speech&nbsp;
					<SpeechIcon className='w-8 h-8' />
				</Toggle>
				</div>

				<div className="min-w-[38rem]">
					{currentCaption.text}
				</div>
			</div>
		</div>
	);
};

export default YtPlayer;