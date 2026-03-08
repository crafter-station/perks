"use client";

import { PaperclipIcon, XIcon } from "lucide-react";
import {
  IconAward,
  IconBadgeSparkle,
  IconBolt,
  IconBookOpen,
  IconBrightnessIncrease,
  IconCloudUpload,
  IconConnect,
  IconConnections,
  IconFeather,
  IconFile,
  IconFlame,
  IconHeart,
  IconHearts,
  IconKey,
  IconLocation,
  IconLock,
  IconMagicWandSparkle,
  IconOpenInBrowser,
  IconPin,
  IconRocket,
  IconRulerPen,
  IconSignal,
  IconSitemap,
  IconSparkle,
  IconSparkle2,
  IconStar,
  IconStarSparkle,
  IconSwap,
  IconThumbsUp,
  IconVideo,
} from "nucleo-glass";
import {
  IconAwardFillDuo18,
  IconLockFillDuo18,
  IconProgressBarFillDuo18,
  IconTargetFillDuo18,
} from "nucleo-ui-essential-fill-duo-18";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SubtleTab, SubtleTabItem } from "@/components/ui/subtle-tab";
import { Textarea } from "@/components/ui/textarea";
import type { BadgeStatus, OrgBadgeWithBadge } from "@/lib/badges";
import { updateBadgeEvidence } from "../actions";

// Map iconName string → component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, any> = {
  // original 12
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
  // new 21
  IconFile,
  IconConnections,
  IconRulerPen,
  IconOpenInBrowser,
  IconVideo,
  IconSignal,
  IconHearts,
  IconLocation,
  IconSparkle,
  IconCloudUpload,
  IconPin,
  IconBrightnessIncrease,
  IconSparkle2,
  IconConnect,
  IconSitemap,
  IconSwap,
  IconFeather,
  IconBookOpen,
};

const filters = [
  { label: "All", icon: IconTargetFillDuo18 },
  { label: "Unlocked", icon: IconAwardFillDuo18 },
  { label: "In progress", icon: IconProgressBarFillDuo18 },
  { label: "Available", icon: IconLockFillDuo18 },
] as const;
type Filter = (typeof filters)[number]["label"];

const statusLabel: Record<BadgeStatus, string> = {
  unlocked: "Unlocked",
  "in-progress": "In progress",
  available: "Available",
};

const statusColor: Record<BadgeStatus, string> = {
  unlocked: "var(--color-success)",
  "in-progress": "var(--color-warning)",
  available: "var(--color-muted-foreground)",
};

function EvidenceInput({
  orgBadgeId,
  initialEvidence,
  initialFileUrl,
}: {
  orgBadgeId: string;
  initialEvidence: string | null;
  initialFileUrl: string | null;
}) {
  const [value, setValue] = useState(initialEvidence ?? "");
  const [fileUrl, setFileUrl] = useState<string | null>(initialFileUrl);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPendingFile(file);
    setSaved(false);
  }

  function handleRemoveFile() {
    setPendingFile(null);
    setFileUrl(null);
    setSaved(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave() {
    let uploadedUrl = fileUrl;

    if (pendingFile) {
      setUploading(true);
      const form = new FormData();
      form.append("file", pendingFile);
      form.append("orgBadgeId", orgBadgeId);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setUploading(false);
        return;
      }
      uploadedUrl = data.url;
      setFileUrl(uploadedUrl);
      setPendingFile(null);
      setUploading(false);
    }

    startTransition(async () => {
      await updateBadgeEvidence(orgBadgeId, value, uploadedUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const isPdf = (url: string) => url.toLowerCase().includes(".pdf");
  const displayFile =
    pendingFile ??
    (fileUrl ? { name: fileUrl.split("/").pop() ?? "file" } : null);
  const isLoading = uploading || isPending;

  return (
    <div className="px-8 pb-8 flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor={`evidence-${orgBadgeId}`}
          className="text-muted-foreground"
        >
          Context
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
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground">Attachment</Label>

        {/* File preview */}
        {displayFile && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            {fileUrl && !pendingFile && !isPdf(fileUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fileUrl}
                alt="preview"
                className="h-8 w-8 rounded object-cover shrink-0"
              />
            )}
            <span className="truncate text-xs text-foreground flex-1 min-w-0">
              {displayFile.name}
            </span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Remove file"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        )}

        {/* Upload button */}
        {!displayFile && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer"
          >
            <PaperclipIcon className="size-3.5 shrink-0" />
            Attach image or PDF
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <Button
        variant={saved ? "outline" : "default"}
        onClick={handleSave}
        disabled={isLoading}
        className="self-end"
        size="sm"
      >
        {uploading
          ? "Uploading…"
          : isPending
            ? "Saving…"
            : saved
              ? "Saved!"
              : "Save"}
      </Button>
    </div>
  );
}

function AchievementCard({ item }: { item: OrgBadgeWithBadge }) {
  const { badge, status, evidence } = item;
  const Icon = iconMap[badge.iconName] ?? IconLock;
  const isAvailable = status === "available";
  const isProgress = status === "in-progress";
  const canSubmitEvidence = status === "in-progress" || status === "available";

  return (
    <MorphingDialog
      transition={{ type: "spring", bounce: 0.05, duration: 0.25 }}
    >
      <MorphingDialogTrigger className="w-full h-full text-left cursor-pointer">
        <div className="relative flex flex-col items-center gap-4 p-5 rounded-2xl border bg-card text-card-foreground shadow-xs/5 transition-all duration-200 hover:scale-[1.01] hover:shadow-xs cursor-pointer h-full before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]">
          {isProgress && (
            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
          )}
          {status === "unlocked" && (
            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-success" />
          )}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center bg-muted transition-opacity duration-200"
            style={{ opacity: isAvailable ? 0.5 : 1 }}
          >
            <Icon
              className={
                isProgress
                  ? "text-warning"
                  : isAvailable
                    ? "text-muted-foreground"
                    : "text-card-foreground"
              }
              style={{ width: 28, height: 28 }}
            />
          </div>
          <div className="text-center">
            <MorphingDialogTitle
              className={`font-semibold text-sm leading-tight tracking-tight ${isAvailable ? "text-muted-foreground" : "text-card-foreground"}`}
            >
              {badge.name}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="text-muted-foreground text-xs mt-0.5">
              {badge.subtitle}
            </MorphingDialogSubtitle>
          </div>
          {evidence && (
            <span className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-primary opacity-70" />
          )}
        </div>
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{ borderRadius: "20px" }}
          className="pointer-events-auto relative flex flex-col w-full sm:w-105 bg-card border border-border overflow-hidden shadow-xl"
        >
          <div className="flex flex-col items-center gap-4 px-8 pt-10 pb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center bg-muted"
              style={{ opacity: isAvailable ? 0.5 : 1 }}
            >
              <Icon
                className={
                  isProgress
                    ? "text-warning"
                    : isAvailable
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
              <EvidenceInput
                orgBadgeId={item.id}
                initialEvidence={evidence}
                initialFileUrl={item.fileUrl}
              />
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
  const [filterIndex, setFilterIndex] = useState(0);
  const [search, setSearch] = useState("");

  const activeFilter = filters[filterIndex].label;

  const filtered = items.filter((item) => {
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Unlocked" && item.status === "unlocked") ||
      (activeFilter === "In progress" && item.status === "in-progress") ||
      (activeFilter === "Available" && item.status === "available");

    if (!matchesFilter) return false;

    if (!search.trim()) return true;

    const q = search.toLowerCase();
    return (
      item.badge.name.toLowerCase().includes(q) ||
      item.badge.subtitle?.toLowerCase().includes(q) ||
      item.badge.description?.toLowerCase().includes(q) ||
      item.evidence?.toLowerCase().includes(q) ||
      statusLabel[item.status].toLowerCase().includes(q)
    );
  });

  const counts = {
    All: items.length,
    Unlocked: items.filter((i) => i.status === "unlocked").length,
    "In progress": items.filter((i) => i.status === "in-progress").length,
    Available: items.filter((i) => i.status === "available").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-5 pt-10 sm:pt-16 pb-12">
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-1">
          Achievements
        </h1>
        <p className="text-sm text-muted-foreground mb-5 sm:mb-6">
          {counts.Unlocked} of {counts.All} unlocked
        </p>

        {/* Search */}
        <Input
          type="search"
          placeholder="Search achievements…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 sm:hidden"
        />

        {/* Filters + Search */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-7">
          <SubtleTab
            idPrefix="achievements"
            selectedIndex={filterIndex}
            onSelect={setFilterIndex}
          >
            {filters.map((f, i) => (
              <SubtleTabItem
                key={f.label}
                index={i}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                icon={f.icon as any}
                label={`${f.label} · ${counts[f.label]}`}
              />
            ))}
          </SubtleTab>
          <Input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-44 shrink-0 hidden sm:inline-flex"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <AchievementCard key={item.id} item={item} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-2 sm:col-span-3 text-center py-20 text-muted-foreground text-sm">
              Nothing here yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
