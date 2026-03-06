"use client";

import { BuildingIcon, SearchIcon, ShieldIcon } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { BadgeStatusSelect } from "./badge-status-select";
import {
  IconMagnifierFillDuo18,
  IconOfficeFillDuo18,
} from "nucleo-ui-essential-fill-duo-18";

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

export function AdminOrgList({ orgs }: { orgs: Org[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? orgs.filter(
        (org) =>
          org.name.toLowerCase().includes(query.toLowerCase()) ||
          org.slug.toLowerCase().includes(query.toLowerCase()),
      )
    : orgs;

  return (
    <div className="space-y-4">
      {/* Search */}
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>
            <IconMagnifierFillDuo18 />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search organizations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </InputGroup>

      {/* Results */}
      {filtered.length === 0 ? (
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
        filtered.map((org) => (
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
                    {org.badges.filter((b) => b.status === "locked").length}
                  </Badge>
                </div>
              </div>

              {org.members.length > 0 && (
                <div className="mt-3 pt-3 border-t">
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
