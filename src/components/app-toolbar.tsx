"use client";

import { Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  IconAwardCertificateFillDuo18,
  IconGear2FillDuo18,
  IconOfficeFillDuo18,
  IconUserFillDuo18,
  IconVault3FillDuo18,
} from "nucleo-ui-essential-fill-duo-18";
import React, { useEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import useClickOutside from "@/hooks/useClickOutside";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const transition = {
  type: "spring",
  bounce: 0.1,
  duration: 0.25,
};

function OrgPanel() {
  const { data: activeOrg } = authClient.useActiveOrganization();

  if (!activeOrg) {
    return (
      <div className="text-sm text-muted-foreground">
        No organization selected
      </div>
    );
  }

  const initials = activeOrg.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {activeOrg.logo ? (
          <img
            src={activeOrg.logo}
            alt={activeOrg.name}
            className="w-9 h-9 rounded-lg object-cover"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black text-primary shrink-0"
            style={{
              background:
                "color-mix(in srgb, var(--color-primary) 15%, transparent)",
            }}
          >
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span
            className="text-sm font-semibold text-card-foreground truncate"
            style={{ letterSpacing: "-0.02em" }}
          >
            {activeOrg.name}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {activeOrg.slug}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="h-8 w-full select-none rounded-lg border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        Switch organization
      </button>
    </div>
  );
}

function ProfilePanel() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="flex items-center gap-3">
      {user?.image ? (
        <img
          src={user.image}
          alt={user.name ?? ""}
          className="w-9 h-9 rounded-lg object-cover shrink-0"
        />
      ) : (
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black text-primary shrink-0"
          style={{
            background:
              "color-mix(in srgb, var(--color-primary) 15%, transparent)",
          }}
        >
          {initials}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span
          className="text-sm font-semibold text-card-foreground truncate"
          style={{ letterSpacing: "-0.02em" }}
        >
          {user?.name ?? "—"}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {user?.email ?? "—"}
        </span>
      </div>
    </div>
  );
}

function CertificatePanel() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span
          className="text-sm font-semibold text-card-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          Certificate
        </span>
        <span className="text-xs text-muted-foreground">
          Generate your participation certificate for this hackathon.
        </span>
      </div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className={cn(
          "h-8 w-full select-none rounded-lg px-2 text-xs font-semibold transition-all",
          done
            ? "bg-success text-white border-transparent"
            : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground",
          loading && "opacity-50 cursor-not-allowed",
        )}
      >
        {loading
          ? "Generating…"
          : done
            ? "Downloaded!"
            : "Generate certificate"}
      </button>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-card-foreground font-medium">
            Notifications
          </span>
          <button
            type="button"
            className="w-8 h-4 rounded-full relative transition-colors bg-primary"
            aria-label="Toggle notifications"
          >
            <span
              className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-white"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-card-foreground font-medium">
            Public profile
          </span>
          <button
            type="button"
            className="w-8 h-4 rounded-full relative transition-colors bg-muted"
            aria-label="Toggle public profile"
          >
            <span
              className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
            />
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={async () => {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => (window.location.href = "/login"),
            },
          });
        }}
        className="h-8 w-full select-none rounded-lg border border-destructive/30 px-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
      >
        Sign out
      </button>
    </div>
  );
}

type ApiKey = { id: string; sponsor: string; name: string; key: string };

const SPONSOR_KEYS: ApiKey[] = [
  {
    id: "1",
    sponsor: "ElevenLabs",
    name: "Text-to-Speech API",
    key: "xi_4xK9mN2pQr8sT1uVwX3yZ",
  },
  {
    id: "2",
    sponsor: "v0 by Vercel",
    name: "Generation API",
    key: "v0_7aB3cD5eF6gH0iJkL2mN",
  },
  {
    id: "3",
    sponsor: "Supabase",
    name: "Project API Key",
    key: "sbp_9pQ1rS2tU3vW4xY5zA6bC",
  },
  {
    id: "4",
    sponsor: "Resend",
    name: "Email API",
    key: "re_8cD9eF0gH1iJ2kL3mN4oP",
  },
];

function ApiKeyRow({ apiKey }: { apiKey: ApiKey }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-card-foreground">
          {apiKey.sponsor}
        </span>
        <span className="text-xs text-muted-foreground">{apiKey.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-muted rounded-md px-2 py-1.5 font-mono text-muted-foreground truncate">
          {visible ? apiKey.key : apiKey.key.slice(0, 4) + "•".repeat(18)}
        </code>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          {visible ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <Copy className={cn("h-3.5 w-3.5", copied && "text-success")} />
        </button>
      </div>
    </div>
  );
}

function ApiKeysPanel({
  onDialogChange,
}: {
  onDialogChange: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    onDialogChange(val);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span
          className="text-sm font-semibold text-card-foreground"
          style={{ letterSpacing: "-0.02em" }}
        >
          Sponsor API Keys
        </span>
        <span className="text-xs text-muted-foreground">
          Access keys provided by hackathon sponsors.
        </span>
      </div>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="h-8 w-full select-none rounded-lg border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground flex items-center justify-center gap-1.5"
      >
        <KeyRound className="h-3.5 w-3.5" />
        View API keys
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sponsor API Keys</DialogTitle>
          </DialogHeader>
          <DialogPanel>
            <div className="flex flex-col">
              {SPONSOR_KEYS.map((k) => (
                <ApiKeyRow key={k.id} apiKey={k} />
              ))}
            </div>
          </DialogPanel>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ITEM_DEFS = [
  {
    id: 1,
    label: "Organization",
    icon: <IconOfficeFillDuo18 className="h-4.5 w-4.5" />,
  },
  {
    id: 2,
    label: "Profile",
    icon: <IconUserFillDuo18 className="h-4.5 w-4.5" />,
  },
  {
    id: 3,
    label: "Certificate",
    icon: <IconAwardCertificateFillDuo18 className="h-4.5 w-4.5" />,
  },
  {
    id: 4,
    label: "API Keys",
    icon: <IconVault3FillDuo18 className="h-4.5 w-4.5" />,
  },
  {
    id: 5,
    label: "Settings",
    icon: <IconGear2FillDuo18 className="h-4.5 w-4.5" />,
  },
];

export function AppToolbar() {
  const [active, setActive] = useState<number | null>(null);
  const [contentRef, { height: heightContent }] = useMeasure();
  const [menuRef, { width: widthContainer }] = useMeasure();
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [maxWidth, setMaxWidth] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  useClickOutside(ref, () => {
    if (dialogOpen) return;
    setIsOpen(false);
    setActive(null);
  });

  useEffect(() => {
    if (!widthContainer || maxWidth > 0) return;
    setMaxWidth(widthContainer);
  }, [widthContainer, maxWidth]);

  return (
    <MotionConfig transition={transition}>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50" ref={ref}>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Panel content */}
          <AnimatePresence initial={false} mode="sync">
            {isOpen && (
              <motion.div
                key="content"
                initial={{ height: 0 }}
                animate={{ height: heightContent || 0 }}
                exit={{ height: 0 }}
                style={{ width: maxWidth || "auto" }}
                className="overflow-hidden"
              >
                <div ref={contentRef} className="px-3 pt-3 pb-1">
                  {ITEM_DEFS.map((item) => {
                    const isSelected = active === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isSelected ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <div
                          className={cn(
                            "text-sm",
                            isSelected ? "block" : "hidden",
                          )}
                        >
                          {item.id === 1 && <OrgPanel />}
                          {item.id === 2 && <ProfilePanel />}
                          {item.id === 3 && <CertificatePanel />}
                          {item.id === 4 && (
                            <ApiKeysPanel onDialogChange={setDialogOpen} />
                          )}
                          {item.id === 5 && <SettingsPanel />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toolbar buttons */}
          <div className="flex items-center gap-1 p-2" ref={menuRef}>
            {ITEM_DEFS.map((item) => (
              <button
                key={item.id}
                aria-label={item.label}
                type="button"
                onClick={() => {
                  if (!isOpen) setIsOpen(true);
                  if (active === item.id) {
                    setIsOpen(false);
                    setActive(null);
                    return;
                  }
                  setActive(item.id);
                }}
                className={cn(
                  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                  active === item.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
