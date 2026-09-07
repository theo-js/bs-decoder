import type { ParsedCaption } from '~types/youtube/caption';
import { getDB } from './index';
import { STORES } from './schema';

export async function persistCaptions(captions: ParsedCaption[] | undefined) {
	const db = await getDB();
	const tx = db.transaction(STORES.captions, 'readwrite');

	if (!captions?.length) {
		tx.objectStore(STORES.captions).delete('latest');
		return;
	}
	tx.objectStore(STORES.captions).put(captions, 'latest');
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
