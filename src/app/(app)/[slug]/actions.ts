"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateBadgeEvidence(
  orgBadgeId: string,
  evidence: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Unauthorized");

  // Verify the orgBadge belongs to an org the user is a member of
  const orgBadge = await prisma.orgBadge.findUnique({
    where: { id: orgBadgeId },
    select: {
      status: true,
      organization: {
        select: {
          slug: true,
          members: { where: { userId: session.user.id }, select: { id: true } },
        },
      },
    },
  });

  if (!orgBadge) throw new Error("Not found");
  if (orgBadge.organization.members.length === 0) throw new Error("Forbidden");
  if (orgBadge.status !== "in-progress")
    throw new Error("Badge must be in-progress to submit evidence");

  await prisma.orgBadge.update({
    where: { id: orgBadgeId },
    data: { evidence: evidence.trim() || null },
  });

  revalidatePath(`/${orgBadge.organization.slug}`);
}
