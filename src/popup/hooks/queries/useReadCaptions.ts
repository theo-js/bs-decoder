import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getCaptionsChangeListener, readCaptions } from '~persistence/db/captions.repo';

export const useReadCaptions = () => {
	const query = useQuery({
		queryKey: ['captions'],
		queryFn: readCaptions
	});

	useEffect(() => {
		// Update value if popup ever stays open on stored captions change (e.g. when popup devtools are open)
		const captionsChangeListener = getCaptionsChangeListener({
			onChange: () => query.refetch()
		});
		chrome.runtime.onMessage.addListener(captionsChangeListener);
		return () => {
			chrome.runtim.onMessage.removeListener(captionsChangeListener);
		}
	}, []);

	return query;
};
