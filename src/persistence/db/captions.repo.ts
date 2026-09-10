import type { ParsedCaption } from '~types/youtube/caption';
import { getDB } from './index';
import { STORES } from './schema';
import type { DbWriteMessage } from './types';

export async function persistCaptions(captions: ParsedCaption[] | undefined) {
	const db = await getDB();
	const tx = db.transaction(STORES.captions, 'readwrite');

	if (!captions?.length) {
		tx.objectStore(STORES.captions).delete('latest');
		return;
	}
	tx.objectStore(STORES.captions).put(captions, 'latest');
	emitCaptionsChange(captions);
}

export async function readCaptions(): Promise<ParsedCaption[] | undefined> {
	const db = await getDB();

	return new Promise((resolve) => {
		try {
			const tx = db.transaction(STORES.captions, 'readonly');
			const req = tx.objectStore(STORES.captions).get('latest');

			req.onsuccess = () => resolve(req.result);
		} catch (e) {
			console.log({ e })
		}
	});
}

function emitCaptionsChange (captions: ParsedCaption[]) {
	const message: DbWriteMessage<ParsedCaption[]> = {
		type: 'DB_WRITE',
		transaction: STORES.captions,
		value: captions
	};
	chrome.runtime.sendMessage(message);
}

export function getCaptionsChangeListener({ onChange }: { onChange: (captions: ParsedCaption[]) => void; }) {
	return (message: DbWriteMessage<ParsedCaption[]>) => {
		if (message.type === 'DB_WRITE' && message.transaction === STORES.captions)
			onChange(message.value);
	};
}