"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateBadgeEvidence(
  orgBadgeId: string,
  evidence: string,
  fileUrl?: string | null,
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Unauthorized");

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
  if (orgBadge.status === "unlocked")
    throw new Error("Badge is already unlocked");

  const trimmed = evidence.trim();
  const hasEvidence = trimmed || fileUrl;

  await prisma.orgBadge.update({
    where: { id: orgBadgeId },
    data: {
      evidence: trimmed || null,
      fileUrl: fileUrl ?? undefined,
      // Auto-advance to in-progress when any evidence is submitted from available
      ...(hasEvidence &&
        orgBadge.status === "available" && { status: "in-progress" }),
    },
  });

  revalidatePath(`/${orgBadge.organization.slug}`);
}

export async function getCertificateUrl(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const member = await prisma.member.findFirst({
    where: { userId: session.user.id },
    select: {
      nanoId: true,
      organization: { select: { slug: true } },
    },
  });

  if (!member?.nanoId) return null;
  return `/c/${member.organization.slug}/${member.nanoId}`;
}
