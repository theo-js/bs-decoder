import type { PlasmoMessaging } from '@plasmohq/messaging';
import { parseYoutubeCaptions } from '~helpers/youtube/parseYoutubeCaptions';
import { persistCaptions } from '~persistence/db/captions.repo';
import type { YoutubeCaptions } from '~types/youtube/caption';

const handler: PlasmoMessaging.Handler<{ captions: YoutubeCaptions }> = async (
	req
) => {
	const youtubeCaptions = req.body.captions;
	const parsedCaptions = youtubeCaptions
		? parseYoutubeCaptions(youtubeCaptions)
		: undefined;
	persistCaptions(parsedCaptions);
};

export default handler;
