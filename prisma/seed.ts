import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const badges = [
  {
    key: "first-commit",
    name: "First Commit",
    subtitle: "Submitted your first project",
    description:
      "You took the leap. Submitting your first project at a hackathon is no small feat — it means you shipped something real under pressure. This badge marks the beginning of your builder journey.",
    iconName: "IconRocket",
    order: 1,
  },
  {
    key: "ship-it",
    name: "Ship it",
    subtitle: "Deployed a live demo",
    description:
      "A live URL is worth a thousand prototypes. You didn't just build it — you deployed it. Judges can click it, users can try it, and you can be proud of it.",
    iconName: "IconBolt",
    order: 2,
  },
  {
    key: "best-in-show",
    name: "Best in Show",
    subtitle: "Won a track award",
    description:
      "Your project stood out among the competition and earned recognition from the judges. This badge is reserved for the builders who go above and beyond in their track.",
    iconName: "IconAward",
    order: 3,
  },
  {
    key: "crowd-favorite",
    name: "Crowd Favorite",
    subtitle: "Get 50 upvotes",
    description:
      "The community loves what you built. Keep sharing your project and collecting votes — 50 upvotes from fellow hackers means you're building something people genuinely want.",
    iconName: "IconThumbsUp",
    order: 4,
  },
  {
    key: "hacker-spirit",
    name: "Hacker Spirit",
    subtitle: "Hack for 24h straight",
    description:
      "Midnight snacks, cold coffee, and raw focus. Log 24 consecutive hours of hacking to prove you've got what it takes to go all the way. Almost there.",
    iconName: "IconFlame",
    order: 5,
  },
  {
    key: "wizard",
    name: "Wizard",
    subtitle: "Use 3+ APIs in one project",
    description:
      "Stitching together multiple APIs into a cohesive product is an art. Integrate three or more external APIs in a single project to unlock this badge.",
    iconName: "IconMagicWandSparkle",
    order: 6,
  },
  {
    key: "grand-prix",
    name: "Grand Prix",
    subtitle: "Win the overall prize",
    description:
      "The ultimate recognition. Only one team takes home the Grand Prix. Build something extraordinary, present it flawlessly, and make the judges remember your name.",
    iconName: "IconStarSparkle",
    order: 7,
  },
  {
    key: "open-source",
    name: "Open Source",
    subtitle: "Publish your repo publicly",
    description:
      "Give back to the community. Publish your hackathon project as an open-source repository so others can learn from, fork, and build on top of your work.",
    iconName: "IconKey",
    order: 8,
  },
  {
    key: "team-player",
    name: "Team Player",
    subtitle: "Join a team of 4+",
    description:
      "Great things are rarely built alone. You joined a full team and collaborated across different skills to ship something together. Teamwork makes the dream work.",
    iconName: "IconHeart",
    order: 9,
  },
  {
    key: "solo-founder",
    name: "Solo Founder",
    subtitle: "Hack solo and submit",
    description:
      "No team? No problem. Building and submitting a project entirely on your own demonstrates incredible focus and resourcefulness. This badge is for the lone wolves.",
    iconName: "IconStar",
    order: 10,
  },
  {
    key: "mentors-pick",
    name: "Mentor's Pick",
    subtitle: "Praised by a mentor",
    description:
      "Earning the respect of a seasoned mentor is a badge of honor. Get called out by a mentor for your approach, execution, or vision to unlock this achievement.",
    iconName: "IconBadgeSparkle",
    order: 11,
  },
  {
    key: "locked-in",
    name: "Locked In",
    subtitle: "No sleep, just code",
    description:
      "This one's still a mystery. Some say it's earned at 3am. Others say you just have to feel it. Whatever it is, you haven't unlocked it yet — but you will.",
    iconName: "IconLock",
    order: 12,
  },

  // === REPO / CÓDIGO ===
  {
    key: "star-power",
    name: "Star Power",
    subtitle: "Get 5 stars on your repo",
    description:
      "The open source community noticed. Five strangers starred your repo — that means what you built is worth bookmarking.",
    iconName: "IconStarSparkle",
    order: 13,
  },
  {
    key: "readme-hero",
    name: "README Hero",
    subtitle: "Ship a README with screenshots, demo link & instructions",
    description:
      "A great project deserves a great README. You took the time to document, screenshot, and explain — that's the mark of someone who cares.",
    iconName: "IconFile",
    order: 14,
  },
  {
    key: "forked",
    name: "Forked",
    subtitle: "Someone forked your project",
    description:
      "Someone liked your code enough to build on top of it. That's the highest compliment in open source.",
    iconName: "IconConnections",
    order: 15,
  },

  // === DISEÑO / PRODUCTO ===
  {
    key: "pixel-perfect",
    name: "Pixel Perfect",
    subtitle: "Shared a public Figma link",
    description:
      "You designed before you built. Sharing your Figma means you thought through the experience, not just the code.",
    iconName: "IconRulerPen",
    order: 16,
  },
  {
    key: "own-domain",
    name: "Own Domain",
    subtitle: "Deployed to a custom domain",
    description:
      "Not a .vercel.app. Not a .netlify.app. Your project lives at its own address — because you meant business from the start.",
    iconName: "IconOpenInBrowser",
    order: 17,
  },
  {
    key: "lights-camera",
    name: "Lights, Camera, Ship",
    subtitle: "Recorded a demo video",
    description:
      "You hit record and showed the world what you built. A demo video means your project speaks for itself even when you're not in the room.",
    iconName: "IconVideo",
    order: 18,
  },

  // === COMUNIDAD / SOCIAL ===
  {
    key: "she-ships-loud",
    name: "She Ships Loud",
    subtitle: "Posted on social media with #SheShips",
    description:
      "You built in public. Posting with the hashtag means you're not just shipping code — you're inspiring others to do the same.",
    iconName: "IconSignal",
    order: 19,
  },
  {
    key: "good-vibes",
    name: "Good Vibes",
    subtitle: "Left feedback on 3 other projects",
    description:
      "You took time away from your own build to help someone else's. That's what makes a hackathon a community.",
    iconName: "IconHearts",
    order: 20,
  },
  {
    key: "world-wide",
    name: "World Wide",
    subtitle: "Received a vote from another country",
    description:
      "Someone from across the world saw your project and liked it. You built something with global reach.",
    iconName: "IconLocation",
    order: 21,
  },

  // === PRIMERAS VECES ===
  {
    key: "first-hackathon",
    name: "First Timer",
    subtitle: "Your first hackathon ever",
    description:
      "Everyone starts somewhere. You chose to start here — and that already makes you a builder.",
    iconName: "IconSparkle",
    order: 22,
  },
  {
    key: "first-deploy",
    name: "First Deploy",
    subtitle: "First time deploying something live",
    description:
      "The first deploy is terrifying and magical at the same time. You pushed it live. Nothing is the same after this.",
    iconName: "IconCloudUpload",
    order: 23,
  },
  {
    key: "ai-curious",
    name: "AI Curious",
    subtitle: "First time using an AI API",
    description:
      "You connected to an AI API for the first time. Welcome to building with intelligence — the rabbit hole goes deep.",
    iconName: "IconMagicWandSparkle",
    order: 24,
  },

  // === MOMENTO DEL EVENTO ===
  {
    key: "day-one",
    name: "Day One",
    subtitle: "Attended the live kickoff",
    description:
      "You were there from the very beginning. Day One energy is something you carry through the whole hackathon.",
    iconName: "IconPin",
    order: 25,
  },
  {
    key: "midnight-builder",
    name: "Midnight Builder",
    subtitle: "Still coding at midnight on Saturday",
    description:
      "While others slept, you shipped. Checked in past midnight — your dedication is showing.",
    iconName: "IconBrightnessIncrease",
    order: 26,
  },
  {
    key: "early-bird",
    name: "Early Bird",
    subtitle: "Submitted before the halfway mark",
    description:
      "You shipped early and didn't wait for the last minute panic. Confidence in your work — that's rare.",
    iconName: "IconSparkle2",
    order: 27,
  },

  // === TEMÁTICOS 8M ===
  {
    key: "for-us",
    name: "For Us",
    subtitle: "Built a project addressing a women's issue",
    description:
      "Safety, health, pay gap, financial independence — you built something that matters for women. That's the whole point.",
    iconName: "IconHeart",
    order: 28,
  },
  {
    key: "sponsor-powered",
    name: "Sponsor Powered",
    subtitle: "Integrated a sponsor's API",
    description:
      "You made use of the tools our sponsors brought to the table. Built with the support of the whole ecosystem.",
    iconName: "IconConnect",
    order: 29,
  },
  {
    key: "hecha-en-latam",
    name: "Hecha en LATAM",
    subtitle: "100% Latin American team",
    description:
      "Construido desde acá, para el mundo. Tu equipo es completamente latinoamericano — y lo que shippearon habla por sí solo.",
    iconName: "IconSitemap",
    order: 30,
  },

  // === LOS RAROS ===
  {
    key: "pivot",
    name: "The Pivot",
    subtitle: "Changed your idea after kickoff",
    description:
      "You had a plan. Then you had a better plan. Pivoting mid-hackathon takes guts — and usually leads to something more interesting.",
    iconName: "IconSwap",
    order: 31,
  },
  {
    key: "en-espanol",
    name: "En Español",
    subtitle: "Project named in Spanish",
    description:
      "You didn't anglify it. Your project has a Spanish name and it sounds exactly right.",
    iconName: "IconFeather",
    order: 32,
  },
  {
    key: "docs-en-casa",
    name: "Docs en Casa",
    subtitle: "README written in Spanish or Portuguese",
    description:
      "You documented your project in your own language. Tech doesn't have to be in English to be excellent.",
    iconName: "IconBookOpen",
    order: 33,
  },
];

async function main() {
  console.log("Seeding badges...");

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {
        name: badge.name,
        subtitle: badge.subtitle,
        description: badge.description,
        iconName: badge.iconName,
        order: badge.order,
      },
      create: badge,
    });
  }

  console.log(`✓ ${badges.length} badges seeded`);

  // Assign missing badges to orgs that already have OrgBadge records (lazy-init already ran for them)
  console.log("Assigning missing badges to existing orgs...");

  const allBadges = await prisma.badge.findMany();
  const orgsWithBadges = await prisma.orgBadge.findMany({
    select: { organizationId: true },
    distinct: ["organizationId"],
  });

  for (const { organizationId } of orgsWithBadges) {
    const existing = await prisma.orgBadge.findMany({
      where: { organizationId },
      select: { badgeId: true },
    });
    const existingIds = new Set(existing.map((ob) => ob.badgeId));
    const missing = allBadges.filter((b) => !existingIds.has(b.id));

    if (missing.length > 0) {
      await prisma.orgBadge.createMany({
        data: missing.map((badge) => ({
          organizationId,
          badgeId: badge.id,
          status: "available",
        })),
        skipDuplicates: true,
      });
      console.log(
        `  → ${organizationId}: assigned ${missing.length} missing badge(s)`,
      );
    }
  }

  console.log("✓ Done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
