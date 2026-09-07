import { useMutation } from '@tanstack/react-query';
import type { ParsedCaption } from '~types/youtube/caption';
import { captionsCodec } from '~helpers/captions/captions-codec';

export const useTransformCaptions = () => useMutation({
	mutationKey: ['transformCaptions'],
	mutationFn: async (captions: ParsedCaption[]): Promise<ParsedCaption[]> => {
		const encodedCaptions = captionsCodec.encode(captions);
		const promptContents = `
		Here's a collection of captions that compose a text. Rewrite it entirely by "translating" the political doublespeak into what the person actually means, in a humorous way — feel free to make uncharitable assumptions about their intentions if it adds to the humor

				Rules:
				- Keep ALL <cap> tags unchanged
				- Only modify text inside
				- Keep the original language
				- Understand the sentences globally
				- Do not add any comments, only give the result

		${encodedCaptions}
		`;
		const response = await fetch(
			'https://api.groq.com/openai/v1/chat/completions',
			{
				method: 'POST',
				body: JSON.stringify({
					model: 'groq/compound',
					messages: [{
						role: 'user',
						content: promptContents
					}]
				}),
				headers: {
					'Authorization': `Bearer ${process.env.PLASMO_PUBLIC_GROQ_API_KEY}`,
					'Content-type': 'application/json',
				}
			}
		);
		const responseBody = await response.json() as { choices: { message: { reasoning: string; } }[] };
		const transformedEncodedCaptions = responseBody.choices[0]?.message.reasoning;

		const transformedCaptions = captionsCodec.decode(transformedEncodedCaptions);
		console.log({ captions, transformedCaptions });
		return transformedCaptions;
	}
});