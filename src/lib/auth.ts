import { dash } from "@better-auth/infra";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, emailOTP, organization } from "better-auth/plugins";
import { Inbound } from "inboundemail";
import { PrismaClient } from "../../generated/client/client";
import { getLumaGuest } from "./luma";

const inbound = new Inbound({
  apiKey: process.env.INBOUND_API_KEY!,
});

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const client = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(client, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  emailAndPassword: { enabled: true },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const result = await getLumaGuest(user.email);
          if (!result.ok) {
            throw new APIError("FORBIDDEN", {
              message:
                result.reason === "not_found"
                  ? "You must use the email you registered with on Luma"
                  : "Your Luma registration is pending approval by the organizers",
            });
          }
          return { data: { ...user, name: result.name } };
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/email-otp/send-verification-otp") return;
      const body = ctx.body as { email: string; type: string } | undefined;
      if (body?.type !== "sign-in") return;
      const result = await getLumaGuest(body.email);
      if (!result.ok) {
        throw new APIError("FORBIDDEN", {
          message:
            result.reason === "not_found"
              ? "You must use the email you registered with on Luma"
              : "Your Luma registration is pending approval by the organizers",
        });
      }
    }),
  },
  plugins: [
    dash(),
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        inbound.emails.send({
          from: "She Ships <perks@sheships.org>",
          subject: "Your She Ships code",
          to: email,
          html: `<p>Your code is: <strong>${otp}</strong></p>`,
        });
      },
    }),
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
