// Server Component
'use client';

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Spinner } from '@heroui/react';
import RowActionsClient from './row-actions';
import { useQuery } from '@tanstack/react-query';
import { listOrganizations } from '@/server/actions/org-actions';

export default async function OrganizationsTable() {
	const { data: orgs, isLoading } = useQuery({
		queryKey: ['org-list'],
		queryFn: async () => await listOrganizations(),
	});

	if (!orgs?.data || orgs.data?.length === 0) {
		return <div className='text-sm text-foreground-500'>No organizations yet.</div>;
	}

	return (
		<Table aria-label='Organizations'>
			<TableHeader>
				<TableColumn>NAME</TableColumn>
				<TableColumn>ID</TableColumn>
				<TableColumn>{''}</TableColumn>
			</TableHeader>
			<TableBody>
				{isLoading ? (
					<Spinner />
				) : (
					orgs.data?.map((o) => (
						<TableRow key={o.id}>
							<TableCell className='max-w-[340px] truncate'>{o.name}</TableCell>
							<TableCell className='font-mono text-xs'>{o.id}</TableCell>
							<TableCell className='flex gap-2 justify-end'>
								{/* client-only actions to avoid RSC mutations */}
								<RowActionsClient org={o} />
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}
