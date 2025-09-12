
import { Card, CardHeader, CardBody, Skeleton } from "@heroui/react";
import CreateOrganizationClient from "@/components/organizations/create-organization";
import OrganizationsTable from "@/components/organizations/organizations-table";
import { listOrganizations } from "@/server/actions/org-actions";

// export const metadata = { title: "Organizations" };

export default async function SettingsOrganizationsPage() {

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>New organization</CardHeader>
        <CardBody>
          {/* client form (uses useAction) */}
          <CreateOrganizationClient />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>Organizations</CardHeader>
        <CardBody>
            <OrganizationsTable  />
        </CardBody>
      </Card>
    </div>
  );
}
