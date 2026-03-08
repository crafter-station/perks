import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { GetStartedDialog } from "@/components/get-started-dialog";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ClerkIconDark as Clerk } from "@/components/ui/svgs/clerk";
import { Firebase } from "@/components/ui/svgs/firebase";
import { Linear } from "@/components/ui/svgs/linear";
import { Slack } from "@/components/ui/svgs/slack";
import { Supabase } from "@/components/ui/svgs/supabase";
import { Vercel } from "@/components/ui/svgs/vercel";

export default function Integrations() {
  return (
    <section className="bg-background @container min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-3xl flex flex-col items-center gap-16">
        <IntegrationsIllustration />
        <div className="max-w-md text-balance text-center flex flex-col items-center gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-4xl font-medium">The hackathon for women</h2>
            <p className="text-muted-foreground">
              The hackathon for women who build. Sign up and start shipping.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <GetStartedDialog />
            <Button
              variant="outline"
              render={<Link prefetch={true} href="/tutorial" />}
              className="gap-1.5"
            >
              <PlayCircle className="size-4" />
              Watch tutorial
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const IntegrationsIllustration = () => {
  return (
    <div
      aria-hidden
      className="**:fill-foreground w-full flex h-44 flex-col justify-between"
    >
      <div className="@lg:px-6 relative flex h-10 items-center justify-between gap-12">
        <div className="bg-border absolute inset-0 my-auto h-px"></div>

        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Vercel className="size-3.5" />
        </div>
        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Slack className="size-3.5" />
        </div>
      </div>
      <div className="@lg:px-24 relative flex h-10 items-center justify-between px-12">
        <div className="bg-border absolute inset-0 my-auto h-px"></div>
        <div className="bg-linear-to-r mask-l-from-15% mask-l-to-40% mask-r-from-75% mask-r-to-75% from-primary absolute inset-0 my-auto h-px w-1/2 via-amber-500 to-pink-400"></div>
        <div className="bg-linear-to-r mask-r-from-15% mask-r-to-40% mask-l-from-75% mask-l-to-75% absolute inset-0 my-auto ml-auto h-px w-1/2 from-indigo-500 via-emerald-500 to-blue-400"></div>

        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Clerk className="size-3.5" />
        </div>
        <div className="border-foreground/15 rounded-full border border-dashed p-2">
          <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
            She Ships
          </div>
        </div>
        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Linear className="size-3.5" />
        </div>
      </div>
      <div className="@lg:px-6 relative flex h-10 items-center justify-between gap-12">
        <div className="bg-border absolute inset-0 my-auto h-px"></div>

        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Supabase className="size-3.5" />
        </div>
        <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 shadow-sm ring">
          <Firebase className="size-3.5" />
        </div>
      </div>
    </div>
  );
};
