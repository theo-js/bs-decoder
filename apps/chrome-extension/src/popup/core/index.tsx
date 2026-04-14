import type { FC, PropsWithChildren } from 'react';
import { TanstackQueryClientProvider } from './tanstack-query/Provider';

export const PopupProvider: FC<PropsWithChildren> = ({ children }) => (
	<TanstackQueryClientProvider>{children}</TanstackQueryClientProvider>
);
