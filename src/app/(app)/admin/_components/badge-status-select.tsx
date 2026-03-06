"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BadgeStatus } from "@/lib/badges";
import { updateBadgeStatus } from "../actions";

const STATUS_LABELS: Record<BadgeStatus, string> = {
  available: "Available",
  "in-progress": "In Progress",
  unlocked: "Unlocked",
};

const STATUS_DOT_CLASS: Record<BadgeStatus, string> = {
  available: "bg-muted-foreground/50",
  "in-progress": "bg-warning-foreground",
  unlocked: "bg-success-foreground",
};

export function BadgeStatusSelect({
  orgBadgeId,
  current,
}: {
  orgBadgeId: string;
  current: BadgeStatus;
}) {
  const [value, setValue] = useState<BadgeStatus>(current);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string | null) {
    if (!next) return;
    const status = next as BadgeStatus;
    setValue(status);
    startTransition(() => updateBadgeStatus(orgBadgeId, status));
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger size="sm" className="w-36">
        <span
          className={`inline-block size-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[value]}`}
          aria-hidden="true"
        />
        <SelectValue />
      </SelectTrigger>
      <SelectPopup>
        {(Object.keys(STATUS_LABELS) as BadgeStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            <span className="flex items-center gap-2">
              <span
                className={`inline-block size-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[s]}`}
                aria-hidden="true"
              />
              {STATUS_LABELS[s]}
            </span>
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
