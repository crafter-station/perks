"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { BadgeStatus } from "@/lib/badges";
import { prisma } from "@/lib/prisma";

export async function updateBadgeStatus(
  orgBadgeId: string,
  status: BadgeStatus,
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await prisma.orgBadge.update({
    where: { id: orgBadgeId },
    data: { status },
  });

  revalidatePath("/admin");
}
