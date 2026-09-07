import { useMutation } from '@tanstack/react-query';
import type { ParsedCaption } from '~types/youtube/caption';
import { captionsCodec } from '~helpers/captions/captions-codec';
import { modelService } from '~background';

export const useTransformCaptions = () =>
	useMutation({
		mutationKey: ['transformCaptions'],

		mutationFn: async (captions: ParsedCaption[]): Promise<ParsedCaption[]> => {
			console.log('Transforming captions...', captions);
			const model = await modelService.getModel();
			if (!model) throw new Error('Model not available');

			const encodedCaptions = captionsCodec.encode(captions);

			const transformedEncodedCaptions = await model(`
        Rewrite each caption to be funny.

				Rules:
				- Keep ALL <cap> tags unchanged
				- Only modify text inside

        ${encodedCaptions}
        `);

			console.log('transformedEncodedCaptions', transformedEncodedCaptions);

			return [];
			// const transformedCaptions = captionsCodec.decode(
			// 	transformedEncodedCaptions.
			// );
			// return transformedCaptions;
		}
	});
