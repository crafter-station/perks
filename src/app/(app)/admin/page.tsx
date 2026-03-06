import { BuildingIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Frame, FramePanel } from "@/components/ui/frame";
import { getOrgBadges } from "@/lib/badges";
import { prisma } from "@/lib/prisma";
import { AdminOrgList } from "./_components/admin-org-list";

export default async function AdminPage() {
  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      members: {
        select: {
          id: true,
          role: true,
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const orgsWithBadges = await Promise.all(
    orgs.map(async (org) => ({
      ...org,
      badges: await getOrgBadges(org.id),
    })),
  );

  const totalBadges = orgsWithBadges.reduce(
    (acc, org) => acc + org.badges.length,
    0,
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          Organizations
        </h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          {orgs.length} organization{orgs.length !== 1 ? "s" : ""} &middot;{" "}
          {totalBadges} badge assignments
        </p>
      </div>

      {orgs.length === 0 ? (
        <Frame>
          <FramePanel>
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <BuildingIcon className="size-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No organizations</EmptyTitle>
                <EmptyDescription>
                  No organizations have been created yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </FramePanel>
        </Frame>
      ) : (
        <AdminOrgList orgs={orgsWithBadges} />
      )}
    </main>
  );
}
