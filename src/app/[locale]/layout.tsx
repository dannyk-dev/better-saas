import '@/styles/globals.css';

import { AuthProvider } from '@/components/providers/auth-provider';
import HeroUIProvider from '@/components/providers/heroui-provider';
import { OrgProvider } from '@/components/providers/org-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { routing } from '@/i18n/routing';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

const queryClient = new QueryClient();

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}
	setRequestLocale(locale);
	const messages = await getMessages();

	return (
		// <ThemeProvider>
		<QueryClientProvider client={queryClient}>
			<HeroUIProvider>
				<ThemeProvider>
					<AuthProvider>
						<OrgProvider>
							<NextIntlClientProvider messages={messages} locale={locale}>
								<main className='text-foreground bg-background'>{children}</main>
							</NextIntlClientProvider>
						</OrgProvider>
					</AuthProvider>
				</ThemeProvider>
			</HeroUIProvider>
		</QueryClientProvider>
		// </ThemeProvider>
	);
}
