import {
	QueryCache,
	QueryClient,
	QueryClientProvider
} from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';

const client = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnMount: false
		}
	},
	queryCache: new QueryCache()
});

export const TanstackQueryClientProvider: FC<PropsWithChildren> = ({
	children
}) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
