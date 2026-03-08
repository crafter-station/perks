"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCube } from "nucleo-glass";
import { useState } from "react";
import { sileo } from "sileo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type Step = "email" | "otp";

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    setPending(false);

    if (error) {
      sileo.error({
        title: "Error sending code",
        description: error.message ?? "Could not send verification code",
        fill: "fill-destructive",
      });
      return;
    }

    setStep("otp");
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const { error } = await authClient.signIn.emailOtp({ email, otp });

    setPending(false);

    if (error) {
      sileo.error({
        title: "Sign in error",
        description: error.message ?? "Invalid or expired code",
        fill: "fill-destructive",
      });
      return;
    }

    const { data: orgs } = await authClient.organization.list();
    const slug = orgs?.[0]?.slug;
    router.push(slug ? `/${slug}` : "/");
  }

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        onSubmit={step === "email" ? handleEmailSubmit : handleOtpSubmit}
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <div>
            <Link prefetch={true} href="/" aria-label="go home">
              <IconCube />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Sign In to She Ships
            </h1>
            <p className="text-sm">
              {step === "email"
                ? "Enter your email to receive a sign-in code"
                : `We sent a code to ${email}`}
            </p>
          </div>
          <hr className="my-4 border-dashed" />

          <div className="space-y-6">
            {step === "email" ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="block text-sm">
                  Email
                </Label>
                <Input
                  type="email"
                  required
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp" className="block text-sm">
                    Verification code
                  </Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-sm"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                    }}
                  >
                    Change email
                  </Button>
                </div>
                <Input
                  type="text"
                  required
                  name="otp"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? step === "email"
                  ? "Sending code..."
                  : "Verifying..."
                : step === "email"
                  ? "Send code"
                  : "Sign In"}
            </Button>

            {step === "otp" && (
              <p className="text-muted-foreground text-center text-sm">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={async () => {
                    await authClient.emailOtp.sendVerificationOtp({
                      email,
                      type: "sign-in",
                    });
                    sileo.action({
                      title: "Code resent",
                      description: "A new code has been sent to your email",
                    });
                  }}
                >
                  Resend
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Don't have an account?{" "}
            <Button
              render={<Link href="/signup">Create account</Link>}
              variant="link"
              className="px-2"
            />
          </p>
        </div>
      </form>
    </section>
  );
}
