'use client';

import type React from 'react';
import { HeroUIProvider as Provider, ToastProvider } from '@heroui/react';

export default function HeroUIProvider({ children }: { children: React.ReactNode }) {
	return (
		<Provider>
			<ToastProvider />
			{children}
		</Provider>
	);
}
