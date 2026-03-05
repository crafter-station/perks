import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getOrgBadges } from "@/lib/badges";
import { prisma } from "@/lib/prisma";
import { AchievementsGrid } from "./_components/achievements-grid";
import { AchievementsSkeleton } from "./_components/achievements-skeleton";

async function AchievementsFetcher({ slug }: { slug: string }) {
  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!org) notFound();

  const badges = await getOrgBadges(org.id);

  return <AchievementsGrid items={badges} />;
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense fallback={<AchievementsSkeleton />}>
      <AchievementsFetcher slug={slug} />
    </Suspense>
  );
}
