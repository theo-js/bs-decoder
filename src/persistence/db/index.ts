import { DB_NAME, DB_VERSION, STORES } from './schema';

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB() {
	if (dbPromise) return dbPromise;

	dbPromise = new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;

			Object.values(STORES).forEach((storeName) => {
				if (!db.objectStoreNames.contains(storeName))
					db.createObjectStore(storeName);
			});
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});

	return dbPromise;
}
