import '@/styles/globals.css';

import { routing } from '@/i18n/routing';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Providers from '@/components/providers';

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

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

		<Providers>
			<NextIntlClientProvider messages={messages} locale={locale}>
				<main className='text-foreground bg-background'>{children}</main>
			</NextIntlClientProvider>
		</Providers>

		// </ThemeProvider>
	);
}
