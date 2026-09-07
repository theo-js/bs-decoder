import { useQuery } from '@tanstack/react-query';
import { readCaptions } from '~persistence/db/captions.repo';

export const useReadCaptions = () =>
	useQuery({
		queryKey: ['captions'],
		queryFn: readCaptions
	});
