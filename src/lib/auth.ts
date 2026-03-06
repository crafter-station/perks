import { dash } from "@better-auth/infra";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { admin, organization } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { PrismaClient } from "../../generated/client/client";
import { getLumaGuest } from "./luma";
import { Inbound } from "inboundemail";

const inbound = new Inbound({
  apiKey: process.env.INBOUND_API_KEY!,
});

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const client = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(client, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
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
  plugins: [
    dash(),
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          // Send the OTP for sign in
          const response = await inbound.emails.send({
            from: "She Ships <perks@sheships.org>",
            subject: "Sign in OTP",
            to: email,
            html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
          });
        } else if (type === "email-verification") {
          // Send the OTP for email verification
          const response = await inbound.emails.send({
            from: "She Ships <perks@sheships.org>",
            subject: "Email Verification OTP",
            to: email,
            html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
          });
        } else {
          // Send the OTP for password reset
          const response = await inbound.emails.send({
            from: "She Ships <perks@sheships.org>",
            subject: "Password Reset OTP",
            to: email,
            html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
          });
        }
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
