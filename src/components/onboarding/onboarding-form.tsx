'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, Progress } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';

import {
	profileSchema,
	organizationSchema,
	preferencesSchema,
	onboardingSchema,
	type TOnboarding,
	type TProfile,
	type TOrganization,
	type TPreferences,
} from '@/types/schemas/onboarding.schema';

import { completeOnboarding } from '@/server/actions/onboarding-actions';
import { OrganizationStep } from '@/components/onboarding/organization-step';
import { PreferencesStep } from '@/components/onboarding/preferences-step';
import { ProfileStep } from '@/components/onboarding/profile-step';
import { useAction } from 'next-safe-action/hooks';

type Errors = Record<string, string | undefined>;

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> =>
	keys.reduce((acc, k) => ((acc[k] = obj[k]), acc), {} as Pick<T, K>);

export default function OnboardingForm() {
	const router = useRouter();

	const [stepIndex, setStepIndex] = useState(0);
	const [errors, setErrors] = useState<Errors>({});
  const { execute, isPending } = useAction(completeOnboarding);

	const [values, setValues] = useState<TOnboarding>({
		// profile
		fullName: '',
		title: '',
		// organization
		orgName: '',
		orgSize: '1-10',
		industry: 'General',
		// preferences
		timezone: '',
		locale: 'en-US',
		notifications: { productUpdates: true, alerts: true },
	});

	const steps = useMemo(
		() => [
			{
				key: 'profile',
				title: 'Your profile',
				schema: profileSchema,
				fields: ['fullName', 'title'] as (keyof TProfile)[],
				Component: (
					<ProfileStep
						values={pick(values, ['fullName', 'title']) as TProfile}
						onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
						errors={errors}
					/>
				),
			},
			{
				key: 'organization',
				title: 'Organization',
				schema: organizationSchema,
				fields: ['orgName', 'orgSize', 'industry'] as (keyof TOrganization)[],
				Component: (
					<OrganizationStep
						values={pick(values, ['orgName', 'orgSize', 'industry']) as TOrganization}
						onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
						errors={errors}
					/>
				),
			},
			{
				key: 'preferences',
				title: 'Preferences',
				schema: preferencesSchema,
				fields: ['timezone', 'locale', 'notifications'] as (keyof TPreferences)[],
				Component: (
					<PreferencesStep
						values={pick(values, ['timezone', 'locale', 'notifications']) as TPreferences}
						onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
						errors={errors}
					/>
				),
			},
		],
		[values, errors]
	);

	const current = steps[stepIndex];
	const pct = Math.round(((stepIndex + 1) / steps.length) * 100);

	async function validateCurrent(): Promise<boolean> {
		const partial = pick(values as any, current.fields as any);
		const result = current?.schema.safeParse(partial);
		if (result?.success) {
			setErrors({});
			return true;
		}
		const fieldErrors: Errors = {};
		for (const [k, v] of Object.entries(result.error.flatten().fieldErrors)) {
			fieldErrors[k] = v?.[0];
		}
		setErrors(fieldErrors);
		return false;
	}

	const handleNext = async () => {
		if (!(await validateCurrent())) return;

		if (stepIndex < steps.length - 1) {
			setStepIndex((i) => i + 1);
			return;
		}

			const final = onboardingSchema.parse(values);
      execute(final);
			router.replace('/');
	}

	const handleSkip = async () => {
			execute({ ...values, skip: true });
			router.replace('/');
	};

	return (
		<div className='min-h-[60vh] flex items-center justify-center p-6'>
			<Card className='w-full max-w-xl'>
				<CardHeader className='flex flex-col gap-2'>
					<div className='text-lg font-semibold'>{current.title}</div>
					<Progress value={pct} aria-label='Progress' />
				</CardHeader>

				<CardBody className='space-y-6'>
					<AnimatePresence mode='wait'>
						<motion.div
							key={current.key}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.18 }}
							className='space-y-4'
						>
							{current.Component}
						</motion.div>
					</AnimatePresence>

					<div className='flex gap-2 justify-between'>
						<Button variant='light' onPress={handleSkip} isDisabled={isPending}>
							Skip
						</Button>
						<Button onPress={handleNext} isLoading={isPending}>
							{stepIndex < steps.length - 1 ? 'Next' : 'Finish'}
						</Button>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
