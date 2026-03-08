"use client";

import Link from "next/link";
import { IconCube } from "nucleo-glass";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
        <div className="p-8 pb-6">
          <div>
            <Link prefetch={true} href="/" aria-label="go home">
              <IconCube />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Join She Ships</h1>
            <p className="text-sm">
              Access is by invitation via Luma. If you registered for the event,
              sign in with the email you used on Luma — no password needed.
            </p>
          </div>
          <hr className="my-4 border-dashed" />
          <Button render={<Link href="/login" />} className="w-full">
            Sign in with your Luma email
          </Button>
        </div>

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Already have an account?{" "}
            <Button
              render={<Link href="/login">Sign In</Link>}
              variant="link"
              className="px-2"
            />
          </p>
        </div>
      </div>
    </section>
  );
}
