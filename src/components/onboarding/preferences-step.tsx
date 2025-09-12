"use client";

import { Input, Switch } from "@heroui/react";
import type { TPreferences } from "@/types/schemas/onboarding.schema";

type Errors = Record<string, string | undefined>;

export function PreferencesStep({
  values,
  onChange,
  errors,
}: {
  values: TPreferences;
  onChange: (patch: Partial<TPreferences>) => void;
  errors: Errors;
}) {
  return (
    <div className="space-y-4">
      <Input
        label="Timezone"
        placeholder="e.g. America/Sao_Paulo"
        value={values.timezone}
        onValueChange={(v) => onChange({ timezone: v })}
        isInvalid={!!errors.timezone}
        errorMessage={errors.timezone}
        size="sm"
      />
      <Input
        label="Locale"
        placeholder="e.g. en-US"
        value={values.locale}
        onValueChange={(v) => onChange({ locale: v })}
        isInvalid={!!errors.locale}
        errorMessage={errors.locale}
        size="sm"
      />
      <div className="grid gap-2">
        <Switch
          isSelected={values.notifications.productUpdates}
          onValueChange={(v) =>
            onChange({ notifications: { ...values.notifications, productUpdates: v } })
          }
          size="sm"
        >
          Product updates
        </Switch>
        <Switch
          isSelected={values.notifications.alerts}
          onValueChange={(v) =>
            onChange({ notifications: { ...values.notifications, alerts: v } })
          }
          size="sm"
        >
          Alerts
        </Switch>
      </div>
    </div>
  );
}
