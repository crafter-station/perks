"use client";

import {
  IconAward,
  IconBadgeSparkle,
  IconBolt,
  IconFlame,
  IconHeart,
  IconKey,
  IconLock,
  IconMagicWandSparkle,
  IconRocket,
  IconStar,
  IconStarSparkle,
  IconThumbsUp,
} from "nucleo-glass";
import { useState } from "react";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@/components/ui/morphing-dialog";

const filters = ["All", "Unlocked", "In progress", "Locked"] as const;
type Filter = (typeof filters)[number];
type Status = "unlocked" | "in-progress" | "locked";

type Achievement = {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  status: Status;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
};

const achievements: Achievement[] = [
  {
    id: 1,
    name: "First Commit",
    subtitle: "Submitted your first project",
    description:
      "You took the leap. Submitting your first project at a hackathon is no small feat — it means you shipped something real under pressure. This badge marks the beginning of your builder journey.",
    status: "unlocked",
    Icon: IconRocket,
  },
  {
    id: 2,
    name: "Ship it",
    subtitle: "Deployed a live demo",
    description:
      "A live URL is worth a thousand prototypes. You didn't just build it — you deployed it. Judges can click it, users can try it, and you can be proud of it.",
    status: "unlocked",
    Icon: IconBolt,
  },
  {
    id: 3,
    name: "Best in Show",
    subtitle: "Won a track award",
    description:
      "Your project stood out among the competition and earned recognition from the judges. This badge is reserved for the builders who go above and beyond in their track.",
    status: "unlocked",
    Icon: IconAward,
  },
  {
    id: 4,
    name: "Crowd Favorite",
    subtitle: "Get 50 upvotes",
    description:
      "The community loves what you built. Keep sharing your project and collecting votes — 50 upvotes from fellow hackers means you're building something people genuinely want.",
    status: "in-progress",
    Icon: IconThumbsUp,
  },
  {
    id: 5,
    name: "Hacker Spirit",
    subtitle: "Hack for 24h straight",
    description:
      "Midnight snacks, cold coffee, and raw focus. Log 24 consecutive hours of hacking to prove you've got what it takes to go all the way. Almost there.",
    status: "in-progress",
    Icon: IconFlame,
  },
  {
    id: 6,
    name: "Wizard",
    subtitle: "Use 3+ APIs in one project",
    description:
      "Stitching together multiple APIs into a cohesive product is an art. Integrate three or more external APIs in a single project to unlock this badge.",
    status: "in-progress",
    Icon: IconMagicWandSparkle,
  },
  {
    id: 7,
    name: "Grand Prix",
    subtitle: "Win the overall prize",
    description:
      "The ultimate recognition. Only one team takes home the Grand Prix. Build something extraordinary, present it flawlessly, and make the judges remember your name.",
    status: "locked",
    Icon: IconStarSparkle,
  },
  {
    id: 8,
    name: "Open Source",
    subtitle: "Publish your repo publicly",
    description:
      "Give back to the community. Publish your hackathon project as an open-source repository so others can learn from, fork, and build on top of your work.",
    status: "locked",
    Icon: IconKey,
  },
  {
    id: 9,
    name: "Team Player",
    subtitle: "Join a team of 4+",
    description:
      "Great things are rarely built alone. You joined a full team and collaborated across different skills to ship something together. Teamwork makes the dream work.",
    status: "unlocked",
    Icon: IconHeart,
  },
  {
    id: 10,
    name: "Solo Founder",
    subtitle: "Hack solo and submit",
    description:
      "No team? No problem. Building and submitting a project entirely on your own demonstrates incredible focus and resourcefulness. This badge is for the lone wolves.",
    status: "locked",
    Icon: IconStar,
  },
  {
    id: 11,
    name: "Mentor's Pick",
    subtitle: "Praised by a mentor",
    description:
      "Earning the respect of a seasoned mentor is a badge of honor. Get called out by a mentor for your approach, execution, or vision to unlock this achievement.",
    status: "locked",
    Icon: IconBadgeSparkle,
  },
  {
    id: 12,
    name: "Locked In",
    subtitle: "No sleep, just code",
    description:
      "This one's still a mystery. Some say it's earned at 3am. Others say you just have to feel it. Whatever it is, you haven't unlocked it yet — but you will.",
    status: "locked",
    Icon: IconLock,
  },
];

const statusLabel: Record<Status, string> = {
  unlocked: "Unlocked",
  "in-progress": "In progress",
  locked: "Locked",
};

const statusColor: Record<Status, string> = {
  unlocked: "var(--color-success)",
  "in-progress": "var(--color-warning)",
  locked: "var(--color-muted-foreground)",
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { Icon, name, subtitle, description, status } = achievement;
  const isLocked = status === "locked";
  const isProgress = status === "in-progress";

  return (
    <MorphingDialog
      transition={{ type: "spring", bounce: 0.05, duration: 0.25 }}
    >
      <MorphingDialogTrigger className="w-full text-left">
        <div className="relative flex flex-col items-center gap-4 p-5 rounded-2xl border bg-card text-card-foreground shadow-xs/5 transition-transform duration-200 hover:scale-[1.02] cursor-pointer before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]">
          {isProgress && (
            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-warning" />
          )}
          {status === "unlocked" && (
            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-success" />
          )}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center bg-muted"
            style={{ opacity: isLocked ? 0.3 : 1 }}
          >
            <Icon
              style={{
                width: 28,
                height: 28,
                color: isProgress
                  ? "var(--color-warning)"
                  : isLocked
                    ? "var(--color-muted-foreground)"
                    : "var(--color-card-foreground)",
              }}
            />
          </div>
          <div className="text-center">
            <MorphingDialogTitle
              className="font-semibold text-sm leading-tight tracking-tight"
              style={{
                color: isLocked
                  ? "var(--color-muted-foreground)"
                  : "var(--color-card-foreground)",
              }}
            >
              {name}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="text-muted-foreground text-xs mt-0.5">
              {subtitle}
            </MorphingDialogSubtitle>
          </div>
        </div>
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{ borderRadius: "20px" }}
          className="pointer-events-auto relative flex flex-col w-full sm:w-[420px] bg-card border border-border overflow-hidden shadow-xl"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-4 px-8 pt-10 pb-6 border-b border-border">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center bg-muted"
              style={{ opacity: isLocked ? 0.35 : 1 }}
            >
              <Icon
                style={{
                  width: 40,
                  height: 40,
                  color: isProgress
                    ? "var(--color-warning)"
                    : isLocked
                      ? "var(--color-muted-foreground)"
                      : "var(--color-card-foreground)",
                }}
              />
            </div>
            <div className="text-center">
              <MorphingDialogTitle className="text-xl font-bold text-card-foreground tracking-tight">
                {name}
              </MorphingDialogTitle>
              <MorphingDialogSubtitle className="text-muted-foreground text-sm mt-0.5">
                {subtitle}
              </MorphingDialogSubtitle>
            </div>
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                color: statusColor[status],
                background: `color-mix(in srgb, ${statusColor[status]} 12%, transparent)`,
              }}
            >
              {statusLabel[status]}
            </span>
          </div>

          {/* Description */}
          <MorphingDialogDescription
            disableLayoutAnimation
            variants={{
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 10 },
            }}
          >
            <p className="text-muted-foreground text-sm leading-relaxed px-8 py-6">
              {description}
            </p>
          </MorphingDialogDescription>

          <MorphingDialogClose
            className="text-muted-foreground hover:text-foreground transition-colors"
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
            }}
          />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filtered = achievements.filter((a) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unlocked") return a.status === "unlocked";
    if (activeFilter === "In progress") return a.status === "in-progress";
    if (activeFilter === "Locked") return a.status === "locked";
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 pt-16 pb-12">
        <h1
          className="text-5xl font-black text-foreground mb-6"
          style={{ letterSpacing: "-0.03em" }}
        >
          Badges
        </h1>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-7">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
              style={
                activeFilter === f
                  ? {
                      background: "var(--color-primary)",
                      color: "var(--color-primary-foreground)",
                    }
                  : {
                      background: "var(--color-muted)",
                      color: "var(--color-muted-foreground)",
                      border: "1px solid var(--color-border)",
                    }
              }
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((a) => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-2 text-center py-20 text-muted-foreground text-sm">
              Nothing here yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
