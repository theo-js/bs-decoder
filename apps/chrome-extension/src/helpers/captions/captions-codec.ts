import type { ParsedCaption } from '~types/youtube/caption';

export const captionsCodec = {
	encode(captions: ParsedCaption[]): string {
		return captions
			.map((c) => `<cap start="${c.start}" dur="${c.duration}">${c.text}</cap>`)
			.join('\n');
	},

	decode(input: string): ParsedCaption[] {
		const regex = /<cap start="(\d+)" dur="(\d+)">(.*?)<\/cap>/gs;

		const result: ParsedCaption[] = [];

		let match;
		while ((match = regex.exec(input)) !== null) {
			result.push({
				start: Number(match[1]),
				duration: Number(match[2]),
				text: match[3].trim()
			});
		}

		return result;
	}
};
