import type { Metadata } from "next";
import Image from "next/image";
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
import { Controls } from "./_components/controls";
import { resolveLang, translations } from "./translations";

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

async function getCertificateData(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      user: { select: { name: true } },
      organization: {
        select: {
          name: true,
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

  return member;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = await getCertificateData(id);

  if (!member) {
    return { title: "Certificate Not Found — She Ships Hackathon" };
  }

  const unlockedCount = member.organization.orgBadges.length;
  const achievementText =
    unlockedCount > 0
      ? ` and earned ${unlockedCount} achievement${unlockedCount === 1 ? "" : "s"}`
      : "";

  return {
    title: `${member.user.name}'s Certificate — She Ships Hackathon`,
    description: `${member.user.name} participated in the She Ships Hackathon with team ${member.organization.name}${achievementText}.`,
  };
}

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const [{ id }, { lang: rawLang }] = await Promise.all([params, searchParams]);
  const lang = resolveLang(rawLang);
  const t = translations[lang];
  const member = await getCertificateData(id);

  if (!member) notFound();

  const participantName = member.user.name;
  const teamName = member.organization.name;
  const unlockedBadges = member.organization.orgBadges;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-6 print:p-0 print:min-h-0">
      {/* Certificate */}
      <div
        id="certificate"
        className="bg-card border border-border w-full max-w-4xl overflow-hidden shadow-xl shadow-black/[0.06] dark:shadow-black/30 print:shadow-none print:max-w-none"
      >
        {/* Top accent bar */}
        <div className="h-2 w-full bg-primary" />

        <div className="px-12 py-14 sm:px-16 sm:py-16">
          {/* Header */}
          <div className="flex flex-col gap-8 mb-14">
            {/* Logo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1288.79 177.6"
              className="h-7 w-auto"
              role="img"
              aria-label="She Ships"
            >
              {/* Pink letters: S (start) and SHIPS */}
              <path
                fill="#e9a1c9"
                d="M12.68,152.22v25.37H0v-25.37h12.68ZM25.37,126.85v25.37h-12.69v-25.37h12.69ZM88.8,164.91v-12.69h12.68v-25.37h-12.68v-12.69h-12.69v-12.69h-12.69v-12.69h-12.69v-12.69h-12.69v-12.69h-12.69V25.37h12.69v-12.69h12.69V0h50.74v12.69h-38.06v12.69h-12.69v25.37h12.69v12.69h12.69v12.69h12.69v12.69h12.68v12.69h12.69v12.69h12.69v38.06h-12.69v12.69h-12.69v12.69h-63.43v-12.69h50.74ZM38.06,152.22v12.69h-12.69v-12.69h12.69ZM114.17,12.69v12.69h-12.69v-12.69h12.69ZM126.85,25.37v25.37h-12.69v-25.37h12.69ZM139.54,0v25.37h-12.69V0h12.69Z"
              />
              {/* Theme-adaptive letters: HE and rest */}
              <path
                fill="currentColor"
                d="M182.66,164.91V12.69h-12.69V0h50.74v12.69h-12.68v76.11h76.11V12.69h-12.69V0h50.74v12.69h-12.69v152.22h12.69v12.69h-50.74v-12.69h12.69v-63.43h-76.11v63.43h12.68v12.69h-50.74v-12.69h12.69Z"
              />
              <path
                fill="currentColor"
                d="M365.33,164.91V12.69h-12.68V0h114.17v25.37h-12.69v-12.69h-63.43v76.11h50.74v-12.69h12.68v38.06h-12.68v-12.69h-50.74v63.43h63.43v-12.69h12.69v25.37h-114.17v-12.69h12.68ZM479.5,25.37v12.69h-12.69v-12.69h12.69ZM479.5,126.85v25.37h-12.69v-25.37h12.69Z"
              />
              <path
                fill="currentColor"
                d="M667.23,164.91v-12.69h12.69v-25.37h-12.69v-12.69h-25.37v-12.69h-25.37v-12.69h-25.37v-12.69h-12.69V25.37h12.69v-12.69h12.69V0h63.43v12.69h-50.74v12.69h-12.69v38.06h25.37v12.69h25.37v12.69h12.69v12.69h25.37v12.69h12.69v38.06h-12.69v12.69h-12.69v12.69h-63.43v-12.69h50.74ZM603.81,139.54v12.69h-12.69v25.37h-12.69v-50.74h12.69v12.68h12.69ZM616.49,152.22v12.69h-12.69v-12.69h12.69ZM679.92,12.69v12.69h-12.69v-12.69h12.69ZM679.92,38.06v-12.69h12.69V0h12.69v50.74h-12.69v-12.69h-12.69Z"
              />
              <path
                fill="#e9a1c9"
                d="M728.12,164.91v-25.37h12.69v-38.06h12.68v-50.74h12.69V12.69h-12.69V0h50.74v12.69h-12.69v38.06h-12.69v38.06h76.11v-38.06h12.69V12.69h-12.69V0h50.74v12.69h-12.68v38.06h-12.69v50.74h-12.69v38.06h-12.69v25.37h12.69v12.69h-50.74v-12.69h12.68v-25.37h12.69v-38.06h-76.11v38.06h-12.69v25.37h12.69v12.69h-50.74v-12.69h12.69Z"
              />
              <path
                fill="currentColor"
                d="M936.15,164.91V12.69h-12.69V0h50.74v12.69h-12.69v152.22h12.69v12.69h-50.74v-12.69h12.69Z"
              />
              <path
                fill="currentColor"
                d="M1017.33,164.91V12.69h-12.69V0h101.48v12.69h12.68v12.69h12.69v50.74h-12.69v12.69h-25.37v-12.69h12.69V25.37h-12.69v-12.69h-50.74v88.8h25.37v12.69h-25.37v50.74h25.37v12.69h-63.43v-12.69h12.69ZM1093.44,88.8v12.69h-25.37v-12.69h25.37Z"
              />
              <path
                fill="currentColor"
                d="M1250.74,164.91v-12.69h12.69v-25.37h-12.69v-12.69h-25.37v-12.69h-25.37v-12.69h-25.37v-12.69h-12.69V25.37h12.69v-12.69h12.69V0h63.43v12.69h-50.74v12.69h-12.68v38.06h25.37v12.69h25.37v12.69h12.69v12.69h25.37v12.69h12.69v38.06h-12.69v12.69h-12.68v12.69h-63.43v-12.69h50.74ZM1187.31,139.54v12.69h-12.69v25.37h-12.69v-50.74h12.69v12.68h12.69ZM1200,152.22v12.69h-12.68v-12.69h12.68ZM1263.42,12.69v12.69h-12.69v-12.69h12.69ZM1263.42,38.06v-12.69h12.68V0h12.69v50.74h-12.69v-12.69h-12.68Z"
              />
            </svg>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-1 text-primary">
                {t.hackathon}
              </p>
              <h1
                className="text-3xl sm:text-4xl font-semibold text-card-foreground"
                style={{ letterSpacing: "-0.03em" }}
              >
                {t.certificateTitle}
              </h1>
            </div>
          </div>

          {/* Body */}
          <div className="mb-12">
            <p className="text-sm text-muted-foreground mb-3">
              {t.certifiesThat}
            </p>
            <p
              className="text-4xl sm:text-5xl font-semibold text-card-foreground mb-4"
              style={{ letterSpacing: "-0.04em" }}
            >
              {participantName}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
              {t.memberOfTeam}{" "}
              <span className="font-semibold text-card-foreground">
                {teamName}
              </span>
              , {t.participated}
            </p>
          </div>

          {/* Achievements */}
          {unlockedBadges.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-primary/20" />
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  {t.achievementsEarned}
                </p>
                <div className="h-px flex-1 bg-primary/20" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {unlockedBadges.map(({ badge }) => {
                  const Icon = iconMap[badge.iconName] ?? IconLock;
                  return (
                    <div
                      key={badge.name}
                      className="flex items-center gap-3 rounded-xl px-3.5 py-3 border border-border bg-card min-h-16"
                    >
                      <div className="shrink-0 size-9 rounded-lg flex items-center justify-center bg-muted">
                        <Icon
                          className="text-card-foreground"
                          style={{ width: 18, height: 18 }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-card-foreground leading-tight">
                          {badge.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                          {badge.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-end justify-between mt-14 pt-8 border-t border-primary/15">
            <div className="flex items-center gap-3">
              <Image
                src="/squared-icon.jpg"
                alt="She Ships"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <p className="text-sm font-semibold text-card-foreground">
                  She Ships
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  sheships.org &nbsp;·&nbsp; 2026
                </p>
              </div>
            </div>
            {unlockedBadges.length > 0 && (
              <p className="text-xs text-muted-foreground text-right">
                {t.achievementsUnlocked(unlockedBadges.length)}
              </p>
            )}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-1 w-full bg-primary opacity-40" />
      </div>

      {/* Controls — theme, language, download */}
      <Controls
        lang={lang}
        participantName={participantName}
        downloadLabel={t.downloadLabel}
        generating={t.generating}
      />
    </div>
  );
}
