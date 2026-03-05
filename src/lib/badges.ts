import { prisma } from "./prisma";

export type BadgeStatus = "unlocked" | "in-progress" | "locked";

export type OrgBadgeWithBadge = {
  id: string;
  status: BadgeStatus;
  badge: {
    id: string;
    key: string;
    name: string;
    subtitle: string;
    description: string;
    iconName: string;
    order: number;
  };
};

/**
 * Returns all OrgBadges for an organization.
 * Lazy-initializes them (all unlocked) if the org has none yet.
 */
export async function getOrgBadges(
  organizationId: string,
): Promise<OrgBadgeWithBadge[]> {
  // Check if org already has badges
  const existing = await prisma.orgBadge.findMany({
    where: { organizationId },
    include: { badge: true },
    orderBy: { badge: { order: "asc" } },
  });

  if (existing.length > 0) {
    return existing as OrgBadgeWithBadge[];
  }

  // Lazy-init: create OrgBadge for every Badge, all unlocked by default
  const allBadges = await prisma.badge.findMany({
    orderBy: { order: "asc" },
  });

  if (allBadges.length === 0) return [];

  await prisma.orgBadge.createMany({
    data: allBadges.map((badge) => ({
      organizationId,
      badgeId: badge.id,
      status: "locked",
    })),
    skipDuplicates: true,
  });

  // Fetch again with badge relation
  const created = await prisma.orgBadge.findMany({
    where: { organizationId },
    include: { badge: true },
    orderBy: { badge: { order: "asc" } },
  });

  return created as OrgBadgeWithBadge[];
}
