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

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setPending(false);

    if (error) {
      sileo.action({
        title: "Sign in error",
        description: error.message ?? "Invalid credentials",
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
        onSubmit={handleSubmit}
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <div>
            <Link href="/" aria-label="go home">
              <IconCube />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Sign In to She Ships
            </h1>
            <p className="text-sm">Welcome back! Sign in to continue</p>
          </div>
          <hr className="my-4 border-dashed" />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Username
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd" className="text-sm">
                  Password
                </Label>
                <Button
                  render={
                    <Link
                      href="#"
                      className="link intent-info variant-ghost text-sm"
                    >
                      Forgot your Password ?
                    </Link>
                  }
                  variant="link"
                  size="sm"
                ></Button>
              </div>
              <Input
                type="password"
                required
                name="pwd"
                id="pwd"
                className="input sz-md variant-mixed"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </div>

        <div className="bg-muted rounded-(--radius) border p-3">
          <p className="text-accent-foreground text-center text-sm">
            Don't have an account ?
            <Button
              render={<Link href="/signup">Create account</Link>}
              variant="link"
              className="px-2"
            ></Button>
          </p>
        </div>
      </form>
    </section>
  );
}
