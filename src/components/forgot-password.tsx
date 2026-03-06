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

type Step = "email" | "otp" | "new-password";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const { error } = await authClient.emailOtp.requestPasswordReset({ email });

    setPending(false);

    if (error) {
      sileo.action({
        title: "Error",
        description: error.message ?? "Could not send reset code",
        fill: "fill-destructive",
      });
      return;
    }

    setStep("otp");
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const { error } = await authClient.emailOtp.checkVerificationOtp({
      email,
      otp,
      type: "forget-password",
    });

    setPending(false);

    if (error) {
      sileo.action({
        title: "Invalid code",
        description: error.message ?? "The code is invalid or expired",
        fill: "fill-destructive",
      });
      return;
    }

    setStep("new-password");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password,
    });

    setPending(false);

    if (error) {
      sileo.action({
        title: "Error",
        description: error.message ?? "Could not reset password",
        fill: "fill-destructive",
      });
      return;
    }

    sileo.action({
      title: "Password reset",
      description: "Your password has been updated. Sign in to continue.",
    });
    router.push("/login");
  }

  const titles: Record<Step, string> = {
    email: "Reset your password",
    otp: "Enter your reset code",
    "new-password": "Set a new password",
  };

  const subtitles: Record<Step, string> = {
    email: "Enter your email to receive a reset code",
    otp: `We sent a code to ${email}`,
    "new-password": "Choose a new password for your account",
  };

  const submitHandlers: Record<Step, (e: React.FormEvent) => Promise<void>> = {
    email: handleEmailSubmit,
    otp: handleOtpSubmit,
    "new-password": handlePasswordSubmit,
  };

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <form
        onSubmit={submitHandlers[step]}
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home">
              <IconCube />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">{titles[step]}</h1>
            <p className="text-sm">{subtitles[step]}</p>
          </div>
          <hr className="my-4 border-dashed" />

          <div className="space-y-6">
            {step === "email" && (
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
            )}

            {step === "otp" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp" className="block text-sm">
                    Reset code
                  </Label>
                  <button
                    type="button"
                    className="text-sm underline underline-offset-2"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                    }}
                  >
                    Change email
                  </button>
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

            {step === "new-password" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="block text-sm">
                  New password
                </Label>
                <Input
                  type="password"
                  required
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? "..."
                : step === "email"
                  ? "Send reset code"
                  : step === "otp"
                    ? "Verify code"
                    : "Reset password"}
            </Button>

            {step === "otp" && (
              <p className="text-muted-foreground text-center text-sm">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={async () => {
                    await authClient.emailOtp.requestPasswordReset({ email });
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
            Remember your password?{" "}
            <Button
              render={<Link href="/login">Sign in</Link>}
              variant="link"
              className="px-2"
            />
          </p>
        </div>
      </form>
    </section>
  );
}
