import type { ParsedCaption, YoutubeCaptions } from '~types/youtube/caption';

export function parseYoutubeCaptions(data: YoutubeCaptions): ParsedCaption[] {
	return data.events
		.filter((e) => e.segs && e.segs.length > 0)
		.map((e) => ({
			start: e.tStartMs,
			duration: e.dDurationMs,
			text: e.segs!.map((s) => s.utf8).join('')
		}));
}
