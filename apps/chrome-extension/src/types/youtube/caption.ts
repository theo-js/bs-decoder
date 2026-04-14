// ===============================
// Raw YouTube Captions (json3)
// ===============================

export interface YoutubeCaptions {
	wireMagic: string;
	pens: unknown[];
	wsWinStyles: unknown[];
	wpWinPositions: unknown[];
	events: CaptionEvent[];
}

export interface CaptionEvent {
	tStartMs: number;
	dDurationMs: number;
	segs?: CaptionSegment[];
}

export interface CaptionSegment {
	utf8: string;
	acAsrConf?: number;
}

// ===============================
// Parsed / App-friendly format
// ===============================

export interface ParsedCaption {
	start: number;
	duration: number;
	text: string;
}
