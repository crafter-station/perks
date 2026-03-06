/**
 * Creates an admin user or promotes an existing user to admin.
 *
 * Usage:
 *   bun scripts/create-admin.ts <email> <password> [name]
 *
 * Examples:
 *   bun scripts/create-admin.ts admin@example.com secret123
 *   bun scripts/create-admin.ts admin@example.com secret123 "John Doe"
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";
import { auth } from "../src/lib/auth";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const [email, password, name = "Admin"] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: bun scripts/create-admin.ts <email> <password> [name]");
  process.exit(1);
}

async function main() {
  // If user already exists, just promote to admin
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });
    console.log(`✓ "${email}" promoted to admin`);
    return;
  }

  // Create user via Better Auth (handles password hashing)
  const res = await auth.api.signUpEmail({
    body: { email, password, name },
  });

  if (!res?.user?.id) {
    console.error("Failed to create user");
    process.exit(1);
  }

  // Set admin role
  await prisma.user.update({
    where: { id: res.user.id },
    data: { role: "admin" },
  });

  console.log(`✓ Admin user created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
