'use client';
import { AuthProvider } from '@/components/providers/auth-provider';
import { OrgProvider } from '@/components/providers/org-provider';
import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import React, { useState, type PropsWithChildren } from 'react';

const Providers = ({ children }: PropsWithChildren) => {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<HeroUIProvider>
				<ThemeProvider>
					<AuthProvider>
						<OrgProvider>{children}</OrgProvider>
					</AuthProvider>
				</ThemeProvider>
			</HeroUIProvider>
		</QueryClientProvider>
	);
};

export default Providers;
