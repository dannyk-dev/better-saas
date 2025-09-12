'use client';

import { Input, Button } from '@heroui/react';
import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { createOrganization } from '@/server/actions/org-actions';
import { CreateOrgSchema } from '@/types/schemas/org.schema';

export default function CreateOrganizationClient() {
	const [name, setName] = useState('');
	const slug = name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');

	const { execute, status } = useAction(createOrganization, {
		onSuccess: () => setName(''),
	});

	const submit = () => {
		const parsed = CreateOrgSchema.safeParse({ name, slug });
		if (parsed.success) execute(parsed.data);
	};

	return (
		<div className='flex gap-2'>
			<Input size='sm' placeholder='Acme Inc.' value={name} onValueChange={setName} aria-label='Organization name' />
			<Button isLoading={status === 'executing'} onPress={submit} isDisabled={!name.trim()}>
				Create
			</Button>
		</div>
	);
}
