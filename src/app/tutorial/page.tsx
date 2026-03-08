import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tutorial — She Ships",
  description:
    "Watch how She Ships works. Everything you need to start building and shipping.",
};

export default function TutorialPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center px-6 py-16 gap-10">
      {/* Hero */}
      <div className="max-w-2xl w-full text-center flex flex-col items-center gap-3">
        <h1 className="text-4xl font-medium tracking-tight text-balance">
          See how She Ships works
        </h1>
        <p className="text-muted-foreground text-lg text-balance leading-relaxed">
          Everything you need to start building and shipping in the hackathon.
        </p>
      </div>

      {/* Video */}
      <div className="max-w-4xl w-full ring-border/60 bg-card rounded-2xl ring overflow-hidden shadow-xl shadow-black/[0.06]">
        <div className="border-border/60 border-b px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-red-400/80" />
            <div className="size-3 rounded-full bg-amber-400/80" />
            <div className="size-3 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-muted-foreground text-xs mx-auto">
            she-ships-tutorial.mp4
          </span>
        </div>

        <video
          className="w-full aspect-video bg-black"
          controls
          preload="metadata"
          playsInline
          aria-label="She Ships tutorial walkthrough video"
        >
          <source src="/videos/app.mp4" type="video/mp4" />
          <track kind="captions" srcLang="en" label="English" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* CTA */}
      <Button size="lg" render={<Link prefetch={true} href="/" />}>
        Go to home
      </Button>
    </div>
  );
}
