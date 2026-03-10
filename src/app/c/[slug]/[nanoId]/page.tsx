import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
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
import { prisma } from "@/lib/prisma";
import { AchievementsCard } from "./_components/achievements-card";
import { CertificatePreview } from "./_components/certificate-preview";
import { Controls } from "./_components/controls";

// biome-ignore lint/suspicious/noExplicitAny: icon components are heterogeneous
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

type RouteParams = { slug: string; nanoId: string };

async function getCertificateData(slug: string, nanoId: string) {
  return prisma.member.findFirst({
    where: {
      nanoId,
      organization: { slug },
    },
    include: {
      user: { select: { name: true } },
      organization: {
        select: {
          name: true,
          slug: true,
          orgBadges: {
            where: { status: "unlocked" },
            include: {
              badge: {
                select: {
                  name: true,
                  subtitle: true,
                  iconName: true,
                  order: true,
                },
              },
            },
            orderBy: { badge: { order: "asc" } },
          },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug, nanoId } = await params;
  const member = await getCertificateData(slug, nanoId);

  if (!member) {
    return { title: "Certificate Not Found — She Ships Hackathon" };
  }

  const unlockedCount = member.organization.orgBadges.length;
  const achievementText =
    unlockedCount > 0
      ? ` and earned ${unlockedCount} achievement${unlockedCount === 1 ? "" : "s"}`
      : "";

  const title = `${member.user.name}'s Certificate — She Ships Hackathon`;
  const description = `${member.user.name} participated in the She Ships Hackathon with team ${member.organization.name}${achievementText}.`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug, nanoId } = await params;
  const member = await getCertificateData(slug, nanoId);

  if (!member) notFound();

  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const certUrl = `${proto}://${host}/c/${slug}/${nanoId}`;

  const participantName = member.user.name;
  const teamName = member.organization.name;
  const unlockedBadges = member.organization.orgBadges;

  return (
    <div className="dark min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-6 print:p-0 print:min-h-0">
      {/* Controls — top on desktop, bottom on mobile */}
      <div className="order-last md:order-first w-full max-w-5xl">
        <Controls
          participantName={participantName}
          teamName={teamName}
          certId={member.nanoId}
          issueDate={member.createdAt}
          certUrl={certUrl}
        />
      </div>

      {/* Part 1: Certificate — SVG template + name & team overlay */}
      <div className="w-full max-w-5xl">
        <CertificatePreview
          participantName={participantName}
          teamName={teamName}
        />
      </div>

      {/* Part 2: Achievements — second SVG template + badge grid overlay */}
      {unlockedBadges.length > 0 && (
        <div className="w-full max-w-5xl">
          <AchievementsCard
            heading="Achievements Earned"
            countLabel={`${unlockedBadges.length} achievement${unlockedBadges.length === 1 ? "" : "s"} unlocked`}
            badges={unlockedBadges.map(({ badge }) => {
              const Icon = iconMap[badge.iconName] ?? IconLock;
              return {
                name: badge.name,
                subtitle: badge.subtitle,
                icon: (
                  <Icon
                    className="text-white"
                    style={{ width: "60%", height: "60%" }}
                  />
                ),
              };
            })}
          />
        </div>
      )}
    </div>
  );
}
