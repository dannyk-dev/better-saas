import { ProfileContent } from '@/components/settings/profile-content';
import { getFullOrganization } from '@/server/actions/org-actions';

export default async function ProfilePage() {
	const organization = await getFullOrganization({});

	return <ProfileContent organization={organization.data} />;
}
