'use client';

import { useAuthLoading, useIsAuthenticated, useUser, useSignOut } from '@/store/auth-store';
import { CreditCard, Home, LogOut, Settings, Shield, User, Key } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
	Avatar,
	Avatar as AvatarFallback,
	Avatar as AvatarImage,
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownSection,
	DropdownTrigger,
} from '@heroui/react';

export function UserAvatarMenu() {
	const router = useRouter();
	const user = useUser();
	const isAuthenticated = useIsAuthenticated();
	const isLoading = useAuthLoading();
	const signOut = useSignOut();
	const t = useTranslations('userMenu');

	const handleLogout = async () => {
		await signOut();
	};

	if (isLoading) {
		return <div className='h-8 w-8 animate-pulse rounded-full bg-muted' />;
	}

	if (!isAuthenticated || !user) {
		return null;
	}

	const userInitials = user.name
		? user.name
				.split(' ')
				.map((n) => n[0])
				.join('')
				.toUpperCase()
		: user.email?.[0]?.toUpperCase() ?? 'U';

	return (
		<Dropdown placement='bottom-end'>
			<DropdownTrigger>
				<Avatar showFallback src={user?.image || undefined} alt={user.name || user.email} />
			</DropdownTrigger>
			<DropdownMenu variant='faded' aria-label='Profile'>
				<DropdownSection title='Signed in as'>
					<DropdownItem key='header' className=' gap-2' unselectable='on'>
						<p className='font-semibold text-sm leading-none'>{user.name || t('user')}</p>
						<p className='text-muted-foreground text-xs leading-none'>{user.email}</p>
					</DropdownItem>
				</DropdownSection>
				<DropdownSection showDivider>
					<DropdownItem
						startContent={<User className='mr-2 h-4 w-4' />}
						key='profile'
						onPress={() => router.push('/settings/profile')}
					>
						{t('profile')}
					</DropdownItem>
					<DropdownItem
						startContent={<Settings className='mr-2 h-4 w-4' />}
						key='billing'
						onPress={() => router.push('/settings/billing')}
					>
						{t('billing')}
					</DropdownItem>
					<DropdownItem
						startContent={<CreditCard className='mr-2 h-4 w-4' />}
						key='credit'
						onPress={() => router.push('/credits/balance')}
					>
						{t('creditBalance')}
					</DropdownItem>
					<DropdownItem
						startContent={<Shield className='mr-2 h-4 w-4' />}
						key='security'
						onPress={() => router.push('/settings/security')}
					>
						{t('security')}
					</DropdownItem>
				</DropdownSection>
				<DropdownItem startContent={<LogOut className='mr-2 h-4 w-4' />} key='logout' onPress={handleLogout}>
					{t('logout')}
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}
