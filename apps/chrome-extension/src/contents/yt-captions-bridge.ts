import { sendToBackground } from '@plasmohq/messaging';
import type { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
	matches: ['https://www.youtube.com/*']
};

window.addEventListener('message', async (event) => {
	if (event.source !== window) return;

	if (event.data?.name === 'YT_CAPTIONS') {
		sendToBackground({
			name: 'persist-captions',
			body: { captions: event.data.body.captions }
		});
	}
});
