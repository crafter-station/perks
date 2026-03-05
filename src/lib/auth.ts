import { dash } from "@better-auth/infra";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { admin, organization } from "better-auth/plugins";
import { PrismaClient } from "../../generated/client/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const client = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(client, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  plugins: [
    dash(),
    admin(),
    organization({
      organizationHooks: {
        beforeAddMember: async ({ user }) => {
          const orgs = await client.member.findMany({
            where: { userId: user.id },
          });
          if (orgs.length > 0) {
            throw new APIError("BAD_REQUEST", {
              message: "You already belong to an organization",
            });
          }
        },
        beforeCreateOrganization: async ({ user }) => {
          const orgs = await client.member.findMany({
            where: { userId: user.id },
          });
          if (orgs.length > 0) {
            throw new APIError("BAD_REQUEST", {
              message: "You already belong to an organization",
            });
          }
        },
      },
    }),
  ],
});
