/**
 * Promotes an existing user to admin using Better Auth admin plugin.
 *
 * Usage:
 *   bun scripts/promote-admin.ts <email>
 *
 * Example:
 *   bun scripts/promote-admin.ts user@example.com
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const [email] = process.argv.slice(2);

if (!email) {
  console.error("Usage: bun scripts/promote-admin.ts <email>");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "admin" },
  });

  console.log(`✓ "${email}" promoted to admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
