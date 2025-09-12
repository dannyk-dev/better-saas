'use client';

import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Input,
	Select,
	SelectItem,
} from '@heroui/react';
import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { inviteMember } from '@/server/actions/org-actions';
import { InviteSchema } from '@/types/schemas/org.schema';

export function InviteMemberModal({ orgId }: { orgId: string }) {
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState('');
	const [role, setRole] = useState<'member' | 'admin' | 'owner'>('member');

	const { execute, status } = useAction(inviteMember, {
		onSuccess: () => {
			setOpen(false);
			setEmail('');
			setRole('member');
		},
	});

	const submit = () => {
		const parsed = InviteSchema.safeParse({ email, role, organizationId: orgId });
		if (parsed.success) execute(parsed.data);
	};

	return (
		<>
			<Button size='sm' onPress={() => setOpen(true)}>
				Invite
			</Button>
			<Modal isOpen={open} onOpenChange={setOpen}>
				<ModalContent>
					<ModalHeader>Invite member</ModalHeader>
					<ModalBody className='gap-4'>
						<Input label='Email' value={email} onValueChange={setEmail} />
						<Select label='Role' selectedKeys={[role]} onChange={(e) => setRole(e.target.value as any)}>
							{['member', 'admin', 'owner'].map((r) => (
								<SelectItem key={r} value={r}>
									{r}
								</SelectItem>
							))}
						</Select>
					</ModalBody>
					<ModalFooter>
						<Button variant='light' onPress={() => setOpen(false)}>
							Cancel
						</Button>
						<Button isLoading={status === 'executing'} onPress={submit}>
							Send invite
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}
