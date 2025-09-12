"use client";

import { Input } from "@heroui/react";
import type { TProfile } from "@/types/schemas/onboarding.schema";

type Errors = Record<string, string | undefined>;

export function ProfileStep({
  values,
  onChange,
  errors,
}: {
  values: TProfile;
  onChange: (patch: Partial<TProfile>) => void;
  errors: Errors;
}) {
  return (
    <div className="space-y-4">
      <Input
        label="Full name"
        value={values.fullName}
        onValueChange={(v) => onChange({ fullName: v })}
        isInvalid={!!errors.fullName}
        errorMessage={errors.fullName}
        size="sm"
      />
      <Input
        label="Title (optional)"
        value={values.title ?? ""}
        onValueChange={(v) => onChange({ title: v })}
        size="sm"
      />
    </div>
  );
}
