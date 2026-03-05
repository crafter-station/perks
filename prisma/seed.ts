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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
