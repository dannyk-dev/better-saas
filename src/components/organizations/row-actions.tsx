'use client';

import { useMemo, useState } from 'react';
import { Button, Input, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from '@heroui/react';
import { MoreHorizontal } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { deleteOrganization, setActiveOrganization, updateOrganization } from '@/server/actions/org-actions';
import { UpdateOrgSchema } from '@/types/schemas/org.schema';

type Org = { id: string; name: string };

export default function RowActionsClient({ org }: { org: Org }) {
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState(org.name);

	const { execute: doDelete, status: delStatus } = useAction(deleteOrganization);
	const { execute: doSetActive, status: actStatus } = useAction(setActiveOrganization);
	const { execute: doUpdate, status: updStatus } = useAction(updateOrganization, {
		onSuccess: () => setEditing(false),
	});

	const save = () => {
		const parsed = UpdateOrgSchema.safeParse({ organizationId: org.id, name });
		if (parsed.success) doUpdate(parsed.data);
	};

	if (editing) {
		return (
			<div className='flex items-center gap-2'>
				<Input size='sm' value={name} onValueChange={setName} className='max-w-[260px]' />
				<Button size='sm' variant='flat' onPress={() => setEditing(false)}>
					Cancel
				</Button>
				<Button size='sm' onPress={save} isLoading={updStatus === 'executing'}>
					Save
				</Button>
			</div>
		);
	}

	return (
		<div className='flex items-center gap-2'>
			<Button size='sm' variant='flat' onPress={() => setEditing(true)}>
				Rename
			</Button>

			<Dropdown>
				<DropdownTrigger>
					<Button isIconOnly size='sm' variant='light'>
						<MoreHorizontal className='h-4 w-4' />
					</Button>
				</DropdownTrigger>
				<DropdownMenu aria-label='Org actions'>
					<DropdownItem
						key='set-active'
						onPress={() => doSetActive({ organizationId: org.id })}
						isDisabled={actStatus === 'executing'}
					>
						Set active
					</DropdownItem>
					<DropdownItem
						key='delete'
						className='text-danger'
						color='danger'
						onPress={() => doDelete({ organizationId: org.id })}
						isDisabled={delStatus === 'executing'}
					>
						Delete
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>
	);
}
