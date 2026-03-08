"use client";

import {
  BuildingIcon,
  PaperclipIcon,
  SearchIcon,
  ShieldIcon,
} from "lucide-react";
import {
  IconMagnifierFillDuo18,
  IconOfficeFillDuo18,
} from "nucleo-ui-essential-fill-duo-18";
import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/ui/frame";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BadgeStatus, OrgBadgeWithBadge } from "@/lib/badges";
import { cn } from "@/lib/utils";
import { BadgeStatusSelect } from "./badge-status-select";

type OrgMember = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string; image: string | null };
};

type Org = {
  id: string;
  name: string;
  slug: string;
  members: OrgMember[];
  badges: OrgBadgeWithBadge[];
};

function vercelAvatar(key: string) {
  return `https://avatar.vercel.sh/${encodeURIComponent(
    key
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
  )}`;
}

type StatusFilter = BadgeStatus | "all";

const STATUS_PILLS: { value: StatusFilter; label: string; dot?: string }[] = [
  { value: "all", label: "All" },
  { value: "unlocked", label: "Unlocked", dot: "bg-success-foreground" },
  { value: "in-progress", label: "In Progress", dot: "bg-warning-foreground" },
  { value: "available", label: "Available", dot: "bg-muted-foreground/50" },
];

type FlatRow = {
  orgId: string;
  orgName: string;
  orgSlug: string;
  badge: OrgBadgeWithBadge;
};

function matchesQuery(org: Org, q: string): boolean {
  if (!q) return true;
  const low = q.toLowerCase();
  return (
    org.name.toLowerCase().includes(low) ||
    org.slug.toLowerCase().includes(low) ||
    org.members.some((m) => m.user.email.toLowerCase().includes(low))
  );
}

export function AdminOrgList({ orgs }: { orgs: Org[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [evidenceFilter, setEvidenceFilter] = useState(false);

  const q = query.trim();
  const hasActiveFilters =
    statusFilter !== "all" || evidenceFilter || Boolean(q);

  // Default view: filter orgs by search only
  const filteredOrgs = orgs.filter((org) => matchesQuery(org, q));

  // Filtered view: flat badge rows matching all filters
  const flatRows: FlatRow[] = orgs.flatMap((org) => {
    if (!matchesQuery(org, q)) return [];
    return org.badges
      .filter((b) => statusFilter === "all" || b.status === statusFilter)
      .filter((b) => !evidenceFilter || b.evidence || b.fileUrl)
      .map((b) => ({
        orgId: org.id,
        orgName: org.name,
        orgSlug: org.slug,
        badge: b,
      }));
  });

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_PILLS.map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => setStatusFilter(pill.value)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === pill.value
                ? "border-foreground/20 bg-foreground text-background"
                : "border-input bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground",
            )}
          >
            {pill.dot && (
              <span
                className={cn(
                  "inline-block size-1.5 shrink-0 rounded-full",
                  pill.dot,
                )}
                aria-hidden="true"
              />
            )}
            {pill.label}
          </button>
        ))}

        <div className="h-4 w-px bg-border" aria-hidden="true" />

        <button
          type="button"
          onClick={() => setEvidenceFilter((v) => !v)}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            evidenceFilter
              ? "border-foreground/20 bg-foreground text-background"
              : "border-input bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground",
          )}
        >
          <PaperclipIcon className="size-3 shrink-0" />
          Has evidence
        </button>
      </div>

      {/* Search */}
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>
            <IconMagnifierFillDuo18 />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search by name, slug or member email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </InputGroup>

      {/* ── FILTERED VIEW: badge cards ── */}
      {hasActiveFilters ? (
        <>
          <p className="text-xs text-muted-foreground">
            {flatRows.length} result{flatRows.length !== 1 ? "s" : ""}
          </p>

          {flatRows.length === 0 ? (
            <Frame>
              <FramePanel>
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia>
                      <SearchIcon className="size-7 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No results</EmptyTitle>
                    <EmptyDescription>
                      {q ? (
                        <>
                          No results match &ldquo;{q}&rdquo; with the active
                          filters.
                        </>
                      ) : (
                        "No badges match the active filters."
                      )}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </FramePanel>
            </Frame>
          ) : (
            <div className="space-y-2">
              {flatRows.map((row) => (
                <Frame key={row.badge.id}>
                  <FramePanel className="py-3">
                    {/* Org header */}
                    <div className="mb-3 flex items-center gap-1.5">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded border bg-muted/60 text-muted-foreground">
                        <IconOfficeFillDuo18 className="size-3" />
                      </div>
                      <span className="truncate text-xs font-medium text-muted-foreground">
                        {row.orgName}
                      </span>
                      <span className="text-xs text-muted-foreground/50">
                        ·
                      </span>
                      <span className="truncate text-xs text-muted-foreground/50">
                        /{row.orgSlug}
                      </span>
                    </div>

                    {/* Badge row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {row.badge.badge.name}
                        </p>
                        {row.badge.badge.subtitle && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {row.badge.badge.subtitle}
                          </p>
                        )}
                        {(row.badge.evidence || row.badge.fileUrl) && (
                          <div className="mt-2">
                            <EvidenceCell ob={row.badge} />
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        <BadgeStatusSelect
                          orgBadgeId={row.badge.id}
                          current={row.badge.status as BadgeStatus}
                        />
                      </div>
                    </div>
                  </FramePanel>
                </Frame>
              ))}
            </div>
          )}
        </>
      ) : /* ── DEFAULT VIEW: orgs expanded ── */
      filteredOrgs.length === 0 ? (
        <Frame>
          <FramePanel>
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <SearchIcon className="size-7 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No results</EmptyTitle>
                <EmptyDescription>
                  No organizations match &ldquo;{query}&rdquo;.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </FramePanel>
        </Frame>
      ) : (
        filteredOrgs.map((org) => (
          <Frame key={org.slug}>
            {/* Org header + members */}
            <FramePanel>
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/60 text-muted-foreground">
                  <IconOfficeFillDuo18 className="size-4" />
                </div>
                <div className="min-w-0">
                  <FrameTitle className="truncate text-sm font-semibold">
                    {org.name}
                  </FrameTitle>
                  <FrameDescription className="truncate text-xs">
                    /{org.slug}
                  </FrameDescription>
                </div>
                <div className="ml-auto flex items-center gap-1.5 shrink-0">
                  <Badge variant="success" className="tabular-nums gap-1">
                    <span className="inline-block size-1.5 rounded-full bg-success-foreground" />
                    {org.badges.filter((b) => b.status === "unlocked").length}
                  </Badge>
                  <Badge variant="warning" className="tabular-nums gap-1">
                    <span className="inline-block size-1.5 rounded-full bg-warning-foreground" />
                    {
                      org.badges.filter((b) => b.status === "in-progress")
                        .length
                    }
                  </Badge>
                  <Badge variant="outline" className="tabular-nums gap-1">
                    <span className="inline-block size-1.5 rounded-full bg-muted-foreground/50" />
                    {org.badges.filter((b) => b.status === "available").length}
                  </Badge>
                </div>
              </div>

              {org.members.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Members ({org.members.length}) &middot; Badges (
                    {org.badges.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {org.members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1"
                      >
                        <Avatar className="size-5 rounded-full ring-1 ring-background">
                          <AvatarImage
                            src={vercelAvatar(m.user.email)}
                            alt={m.user.name}
                          />
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {m.user.email}
                        </span>
                        {m.role === "owner" && (
                          <Badge
                            variant="secondary"
                            size="sm"
                            className="ms-0.5"
                          >
                            owner
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FramePanel>

            {/* Badges table */}
            {org.badges.length === 0 ? (
              <FramePanel>
                <Empty className="py-4">
                  <EmptyHeader>
                    <EmptyMedia>
                      <ShieldIcon className="size-6 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm font-medium">
                      No badges
                    </EmptyTitle>
                    <EmptyDescription className="text-xs">
                      This organization has no badge assignments.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </FramePanel>
            ) : (
              <FramePanel className="p-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="ps-5 w-full">Badge</TableHead>
                      <TableHead className="w-56">Evidence</TableHead>
                      <TableHead className="pe-5 w-44">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {org.badges.map((ob) => (
                      <TableRow key={ob.id}>
                        <TableCell className="ps-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">
                              {ob.badge.name}
                            </span>
                            {ob.badge.subtitle && (
                              <span className="max-w-xs truncate text-xs text-muted-foreground">
                                {ob.badge.subtitle}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[16rem]">
                          <EvidenceCell ob={ob} />
                        </TableCell>
                        <TableCell className="pe-5">
                          <BadgeStatusSelect
                            orgBadgeId={ob.id}
                            current={ob.status as BadgeStatus}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </FramePanel>
            )}
          </Frame>
        ))
      )}
    </div>
  );
}

function EvidenceCell({ ob }: { ob: OrgBadgeWithBadge }) {
  if (!ob.evidence && !ob.fileUrl) {
    return <span className="text-xs text-muted-foreground/40">—</span>;
  }

  const isPdf = ob.fileUrl?.toLowerCase().includes(".pdf");
  const fileName = ob.fileUrl?.split("/").pop();

  // Trigger: preview snippet + eye icon
  const trigger = (
    <Button size="sm" variant="outline">
      View
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogPopup showCloseButton>
        <DialogHeader>
          <DialogTitle>{ob.badge.name}</DialogTitle>
          {ob.badge.subtitle && (
            <DialogDescription>{ob.badge.subtitle}</DialogDescription>
          )}
        </DialogHeader>
        <DialogPanel>
          <div className="flex flex-col gap-4">
            {ob.evidence && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Context
                </p>
                {ob.evidence.startsWith("http") ? (
                  <a
                    href={ob.evidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-primary underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    {ob.evidence}
                  </a>
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {ob.evidence}
                  </p>
                )}
              </div>
            )}

            {ob.fileUrl && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Attachment
                </p>
                {isPdf ? (
                  <a
                    href={ob.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm text-primary hover:opacity-80 transition-opacity cursor-pointer w-fit"
                  >
                    <PaperclipIcon className="size-4 shrink-0" />
                    <span className="truncate max-w-xs">{fileName}</span>
                  </a>
                ) : (
                  <a
                    href={ob.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-fit"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ob.fileUrl}
                      alt="evidence"
                      className="max-h-72 w-auto rounded-xl border border-border object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </a>
                )}
              </div>
            )}
          </div>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
