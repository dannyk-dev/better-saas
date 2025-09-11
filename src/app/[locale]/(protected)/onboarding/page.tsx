'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Input, Progress } from '@heroui/react';
import { completeOnboarding } from '@/server/actions/onboarding-actions';
import type { TOnboardingSchema } from '@/types/schemas/onboarding';

/**
 * A step in the onboarding flow.  Each entry defines a key to use
 * in the final payload, a title for the UI, and a list of field names
 * to collect.
 */
const steps: { key: string; title: string; fields: string[] }[] = [
	{ key: 'profile', title: 'Your profile', fields: ['fullName', 'title'] },
	{ key: 'organization', title: 'Organization', fields: ['orgName', 'orgSize'] },
	// { key: 'preferences', title: 'Preferences', fields: ['timezone', 'notifications'] },
];

export default function OnboardingPage() {
	const router = useRouter();
	const [stepIndex, setStepIndex] = useState(0);
	const [values, setValues] = useState<TOnboardingSchema>({
    fullName: '',
    orgName: '',
    orgSize: '',
    title: ''
  });
	const [busy, setBusy] = useState(false);

	const current = useMemo(() => steps?.[stepIndex] || steps[0], [stepIndex]);
	const pct = Math.round(((stepIndex + 1) / steps.length) * 100);

	const handleNext = async () => {
		if (stepIndex < steps.length - 1) {
			setStepIndex((i) => i + 1);
		} else {
			setBusy(true);

			await completeOnboarding(values);
			setBusy(false);
			router.replace('/');
		}
	};

	const handleSkip = async () => {
		setBusy(true);
		await completeOnboarding(null, true);

		setBusy(false);
		router.replace('/');
	};

	return (
		<div className='min-h-[60vh] flex items-center justify-center p-6'>
			<Card className='w-full max-w-xl'>
				<CardHeader className='flex flex-col gap-2'>
					<div className='text-lg font-semibold'>{current?.title}</div>
					<Progress value={pct} aria-label='Progress' />
				</CardHeader>
				<CardBody className='space-y-4'>
					{current?.fields.map((field) => (
						<Input
							key={field}
							label={field}
							size='sm'
							value={values[field] || ''}
							onValueChange={(val) => setValues((prev) => ({ ...prev, [field]: val }))}
						/>
					))}
					<div className='flex gap-2 justify-between'>
						<Button variant='light' onPress={handleSkip} disabled={busy}>
							Skip
						</Button>
						<Button onPress={handleNext} isLoading={busy}>
							{stepIndex < steps.length - 1 ? 'Next' : 'Finish'}
						</Button>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
