"use client";

import { Input, Select, SelectItem } from "@heroui/react";
import type { TOrganization } from "@/types/schemas/onboarding.schema";

type Errors = Record<string, string | undefined>;

const sizeOptions = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;
const industryOptions = [
  "General",
  "Real Estate",
  "Finance",
  "Healthcare",
  "Education",
  "Technology",
  "Retail",
  "Other",
] as const;

export function OrganizationStep({
  values,
  onChange,
  errors,
}: {
  values: TOrganization;
  onChange: (patch: Partial<TOrganization>) => void;
  errors: Errors;
}) {
  return (
    <div className="space-y-4">
      <Input
        label="Organization name"
        value={values.orgName}
        onValueChange={(v) => onChange({ orgName: v })}
        isInvalid={!!errors.orgName}
        errorMessage={errors.orgName}
        size="sm"
      />

      <Select
        label="Organization size"
        selectedKeys={values.orgSize ? [values.orgSize] : []}
        onSelectionChange={(keys) =>
          onChange({ orgSize: Array.from(keys)[0] as TOrganization["orgSize"] })
        }
        isInvalid={!!errors.orgSize}
        errorMessage={errors.orgSize}
        size="sm"
      >
        {sizeOptions.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </Select>

      <Select
        label="Industry"
        selectedKeys={values.industry ? [values.industry] : ["General"]}
        onSelectionChange={(keys) =>
          onChange({ industry: Array.from(keys)[0] as TOrganization["industry"] })
        }
        size="sm"
      >
        {industryOptions.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
