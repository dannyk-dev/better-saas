'use client';

import { Label } from '@/components/ui/label';
import { useAppConfig } from '@/hooks/use-config';
import type { ProfileContentProps } from '@/types/profile';
import { Camera, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import {
	Avatar,
	Badge,
	Button,
	Card,
	CardBody as CardContent,
	CardFooter,
	CardHeader,
	Chip,
	Input,
	Select,
	SelectItem,
} from '@heroui/react';
import { CardDescription, CardTitle } from '@/components/ui';
import { useOrg } from '@/components/providers/org-provider';
import type { Organization } from 'better-auth/plugins';
import { useProfile } from '@/hooks/use-profile';

const orgRoleMap = [
	{
		key: 'member',
		label: 'Member',
	},
	{
		key: 'admin',
		label: 'Admin',
	},
	{
		key: 'owner',
		label: 'Owner',
	},
] as const;

export function ProfileContent({ organization }: { organization?: Organization | null }) {
	const t = useTranslations('profile');
	const locale = useLocale();
	const appConfig = useAppConfig();
	const [selectedLanguage, setSelectedLanguage] = useState(locale === 'zh' ? 'zh' : 'en');
	const { activeOrg } = useOrg();
	const {
		user,
		formData,
		setFormData,
		isUpdatingName,
		isUpdatingAvatar,
		handleUpdateName,
		handleUpdateAvatar,
		getUserInitials,
		hasNameChanged,
		...profileData
	} = useProfile();

	const handleAvatarUpload = () => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = appConfig.upload.allowedTypes.join(',');
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				if (!appConfig.upload.allowedTypes.includes(file.type)) {
					toast.error('Only JPG or PNG');
					return;
				}

				if (file.size > appConfig.upload.maxFileSize) {
					toast.error('MAX 10MB');
					return;
				}

				await handleUpdateAvatar(file);
			}
		};
		input.click();
	};

	const handleSaveEmail = () => {};

	if (profileData.isLoading && !user) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='font-bold text-3xl tracking-tight'>{t('title')}</h1>
				<p className='text-muted-foreground'>{t('description')}</p>
			</div>

			<div className='grid gap-6'>
				{/* Avatar settings */}
				<Card className='p-4'>
					<CardHeader className='flex flex-col gap-y-2  items-start max-w-2xl'>
						<CardTitle>{t('avatar.title')}</CardTitle>
						<CardDescription>{t('avatar.description')}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='flex items-center gap-4 mb-10'>
							<div className='relative'>
								<Avatar className='h-20 w-20' src={user?.image ?? undefined} showFallback />
								{/* <AvatarImage src={user?.image || ''} alt="Avatar" />
                  <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback> */}
								<Button
									size='sm'
									variant='faded'
									className='-bottom-2 -right-2 absolute h-8 w-0 rounded-full p-0'
									onPress={handleAvatarUpload}
									disabled={isUpdatingAvatar}
								>
									{isUpdatingAvatar ? <Loader2 className='h-4 w-4 animate-spin' /> : <Camera className='h-4 w-4' />}
								</Button>
							</div>
						</div>
						<div className='grid md:grid-cols-3 gap-4'>
							<div className='space-y-2'>
								<Select
									label={t('language.label')}
									description={t('language.description')}
									variant='faded'
									size='sm'
									selectedKeys={[selectedLanguage]}
									onChange={(e) => setSelectedLanguage(e.target.value)}
								>
									{[
										{ key: 'en', label: 'English' },
										{ key: 'zh', label: 'Chinese' },
										{ key: 'pt', label: 'portuguese' },
										{ key: 'es', label: 'Spanish' },
									].map((lang) => (
										<SelectItem key={lang.key} variant='faded'>
											{lang.label}
										</SelectItem>
									))}
								</Select>
							</div>
							<Input
								value={formData.name}
								variant='faded'
								size='sm'
								onValueChange={(e) => setFormData((prev) => ({ ...prev, name: e }))}
								label={t('name.title')}
							/>
							<div className='flex flex-col gap-y-2 w-full'>
								<Input
									size='sm'
									type='email'
									value={formData.email}
									variant='faded'
									onValueChange={(e) => setFormData((prev) => ({ ...prev, email: e }))}
									label={t('email.title')}
									disabled
								/>
								{!user?.emailVerified ? (
									<div className='flex flex-row gap-x-2'>
										<Chip size='sm' color='danger' variant='solid'>
											Not Verified
										</Chip>

										<Button variant='light' size='sm'>
											Send Verification Link
										</Button>
									</div>
								) : (
									<Chip color='success' variant='shadow' size='sm' className='px-4 justify-self-end'>
										Verified
									</Chip>
								)}
							</div>
							<Select size='sm' variant='faded' label='Role' selectedKeys={[organization?.role ?? 'all']} disabled>
								{orgRoleMap.map((role) => (
									<SelectItem key={role.key}>{role.label}</SelectItem>
								))}
							</Select>
						</div>
					</CardContent>
					<CardFooter>
						<Button variant='solid' color='primary' isLoading={isUpdatingName} disabled={!hasNameChanged}>
							{isUpdatingName ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									{t('saving')}
								</>
							) : (
								t('save')
							)}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
