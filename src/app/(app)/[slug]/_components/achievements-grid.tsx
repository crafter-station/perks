"use client";

import {
  IconAward,
  IconBadgeSparkle,
  IconBolt,
  IconFlame,
  IconHeart,
  IconKey,
  IconLock,
  IconMagicWandSparkle,
  IconRocket,
  IconStar,
  IconStarSparkle,
  IconThumbsUp,
} from "nucleo-glass";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@/components/ui/morphing-dialog";
import { Textarea } from "@/components/ui/textarea";
import type { BadgeStatus, OrgBadgeWithBadge } from "@/lib/badges";
import { updateBadgeEvidence } from "../actions";

// Map iconName string → component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  IconRocket,
  IconBolt,
  IconAward,
  IconThumbsUp,
  IconFlame,
  IconMagicWandSparkle,
  IconStarSparkle,
  IconKey,
  IconHeart,
  IconStar,
  IconBadgeSparkle,
  IconLock,
};

const filters = ["All", "Unlocked", "In progress", "Locked"] as const;
type Filter = (typeof filters)[number];

const statusLabel: Record<BadgeStatus, string> = {
  unlocked: "Unlocked",
  "in-progress": "In progress",
  locked: "Locked",
};

const statusColor: Record<BadgeStatus, string> = {
  unlocked: "var(--color-success)",
  "in-progress": "var(--color-warning)",
  locked: "var(--color-muted-foreground)",
};

function EvidenceInput({
  orgBadgeId,
  initialEvidence,
}: {
  orgBadgeId: string;
  initialEvidence: string | null;
}) {
  const [value, setValue] = useState(initialEvidence ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateBadgeEvidence(orgBadgeId, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="px-8 pb-8 flex flex-col gap-2">
      <Label
        htmlFor={`evidence-${orgBadgeId}`}
        className="text-muted-foreground"
      >
        Evidence / Context
      </Label>
      <Textarea
        id={`evidence-${orgBadgeId}`}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        placeholder="Add a URL, explanation or any context…"
        rows={3}
        size="sm"
      />
      <Button
        size="sm"
        variant={saved ? "outline" : "default"}
        onClick={handleSave}
        disabled={isPending}
        className="self-end"
      >
        {isPending ? "Saving…" : saved ? "Saved!" : "Save"}
      </Button>
    </div>
  );
}

function AchievementCard({ item }: { item: OrgBadgeWithBadge }) {
  const { badge, status, evidence } = item;
  const Icon = iconMap[badge.iconName] ?? IconLock;
  const isLocked = status === "locked";
  const isProgress = status === "in-progress";
  const canSubmitEvidence = status === "in-progress";

  return (
    <MorphingDialog
      transition={{ type: "spring", bounce: 0.05, duration: 0.25 }}
    >
      <MorphingDialogTrigger className="w-full text-left cursor-pointer">
        <div className="relative flex flex-col items-center gap-4 p-5 rounded-2xl border bg-card text-card-foreground shadow-xs/5 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]">
          {isProgress && (
            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
          )}
          {status === "unlocked" && (
            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-success" />
          )}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center bg-muted transition-opacity duration-200"
            style={{ opacity: isLocked ? 0.3 : 1 }}
          >
            <Icon
              className={
                isProgress
                  ? "text-warning"
                  : isLocked
                    ? "text-muted-foreground"
                    : "text-card-foreground"
              }
              style={{ width: 28, height: 28 }}
            />
          </div>
          <div className="text-center">
            <MorphingDialogTitle
              className={`font-semibold text-sm leading-tight tracking-tight ${isLocked ? "text-muted-foreground" : "text-card-foreground"}`}
            >
              {badge.name}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="text-muted-foreground text-xs mt-0.5">
              {badge.subtitle}
            </MorphingDialogSubtitle>
          </div>
          {evidence && !isLocked && (
            <span className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-primary opacity-70" />
          )}
        </div>
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{ borderRadius: "20px" }}
          className="pointer-events-auto relative flex flex-col w-full sm:w-105 bg-card border border-border overflow-hidden shadow-xl"
        >
          <div className="flex flex-col items-center gap-4 px-8 pt-10 pb-6 border-b border-border">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center bg-muted"
              style={{ opacity: isLocked ? 0.35 : 1 }}
            >
              <Icon
                className={
                  isProgress
                    ? "text-warning"
                    : isLocked
                      ? "text-muted-foreground"
                      : "text-card-foreground"
                }
                style={{ width: 40, height: 40 }}
              />
            </div>
            <div className="text-center">
              <MorphingDialogTitle className="text-xl font-bold text-card-foreground tracking-tight">
                {badge.name}
              </MorphingDialogTitle>
              <MorphingDialogSubtitle className="text-muted-foreground text-sm mt-0.5">
                {badge.subtitle}
              </MorphingDialogSubtitle>
            </div>
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                color: statusColor[status],
                background: `color-mix(in srgb, ${statusColor[status]} 12%, transparent)`,
              }}
            >
              {statusLabel[status]}
            </span>
          </div>

          <MorphingDialogDescription
            disableLayoutAnimation
            variants={{
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 10 },
            }}
          >
            <p className="text-muted-foreground text-sm leading-relaxed px-8 py-6">
              {badge.description}
            </p>

            {canSubmitEvidence && (
              <EvidenceInput orgBadgeId={item.id} initialEvidence={evidence} />
            )}
          </MorphingDialogDescription>

          <MorphingDialogClose
            className="text-muted-foreground hover:text-foreground transition-colors"
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
            }}
          />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

export function AchievementsGrid({ items }: { items: OrgBadgeWithBadge[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filtered = items.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unlocked") return item.status === "unlocked";
    if (activeFilter === "In progress") return item.status === "in-progress";
    if (activeFilter === "Locked") return item.status === "locked";
    return true;
  });

  // Counts for filter labels
  const counts: Record<Filter, number> = {
    All: items.length,
    Unlocked: items.filter((i) => i.status === "unlocked").length,
    "In progress": items.filter((i) => i.status === "in-progress").length,
    Locked: items.filter((i) => i.status === "locked").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 pt-16 pb-12">
        <h1 className="text-4xl font-semibold text-foreground mb-1">
          Achievements
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {counts.Unlocked} of {counts.All} unlocked
        </p>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-7">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer"
              style={
                activeFilter === f
                  ? {
                      background: "var(--color-primary)",
                      color: "var(--color-primary-foreground)",
                    }
                  : {
                      background: "var(--color-muted)",
                      color: "var(--color-muted-foreground)",
                      border: "1px solid var(--color-border)",
                    }
              }
            >
              {f}
              {counts[f] > 0 && f !== "All" && (
                <span className="ml-1.5 text-xs opacity-60">{counts[f]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <AchievementCard key={item.id} item={item} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-2 text-center py-20 text-muted-foreground text-sm">
              Nothing here yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
