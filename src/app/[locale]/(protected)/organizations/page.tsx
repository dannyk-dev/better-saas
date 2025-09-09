import { createOrganization, getOrganizations } from '@/server/actions/org-actions';
import { Card, CardHeader, CardBody, CardFooter, Button, Input } from '@heroui/react';

export const metadata = {
  title: 'Organizations',
};

// Server action to create a new organization.  Defined at the module level
// with the 'use server' directive so that forms can invoke it directly.
export async function createOrgAction(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const slugValue = formData.get('slug') as string | undefined;
  const slug = slugValue && slugValue.trim().length > 0 ? slugValue : undefined;
  if (!name || name.trim() === '') {
    return;
  }
  await createOrganization(name.trim(), slug);
}

// Page component for listing and creating organizations.  This is a server
// component so it can call getOrganizations() on the server.
export default async function OrganizationListPage() {
  const result = await getOrganizations();
  const organizations = result.success ? result.data : [];
  return (
    <div className="space-y-6">
      {/* New organization form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Create Organization</h2>
        </CardHeader>
        <CardBody>
          <form action={createOrgAction} className="flex flex-col gap-4">
            <Input
              name="name"
              placeholder="Organization name"
              required
            />
            <Input
              name="slug"
              placeholder="Slug (optional)"
            />
            <Button type="submit" color="primary">
              Create
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Existing organizations */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Your Organizations</h2>
        </CardHeader>
        <CardBody>
          {organizations.length === 0 && (
            <p className="text-sm text-muted-foreground">You are not a member of any organizations yet.</p>
          )}
          {organizations.length > 0 && (
            <ul className="space-y-2">
              {organizations.map((org: any) => (
                <li key={org.id} className="flex items-center justify-between">
                  <span>{org.name}</span>
                  {/* Link to organization settings goes here.  The path includes the org id. */}
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                  >
                    <a href={`./organizations/${org.id}/settings/members`}>Manage</a>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}