"use client";

import { Check, Copy, ExternalLink, Loader2, LogOut } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  IconArrowDoorOut3FillDuo18,
  IconAwardCertificateFillDuo18,
  IconDarkLightFillDuo18,
  IconOfficeFillDuo18,
  IconPaperPlane2FillDuo18,
  IconUserFillDuo18,
  IconUserSearchFillDuo18,
  IconVault3FillDuo18,
} from "nucleo-ui-essential-fill-duo-18";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useMeasure from "react-use-measure";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useClickOutside from "@/hooks/useClickOutside";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const transition = {
  type: "spring" as const,
  bounce: 0.1,
  duration: 0.25,
};

// Normalizes a string to a URL-safe slug for avatar.vercel.sh
function toAvatarKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function vercelAvatar(key: string) {
  return `https://avatar.vercel.sh/${encodeURIComponent(toAvatarKey(key))}`;
}

type Member = {
  id: string;
  userId: string;
  role: string;
  user?: { name?: string; email?: string; image?: string };
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
};

function MemberAvatar({ member }: { member: Member }) {
  const name = member.user?.name ?? member.user?.email ?? "?";
  const key = member.user?.email ?? member.user?.name ?? "unknown";

  return (
    <Avatar className="size-5 ring-1 ring-background rounded-full" title={name}>
      <AvatarImage src={vercelAvatar(key)} alt={name} />
    </Avatar>
  );
}

function InviteDialog({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setSuccess(false);
    setError(null);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.organization.inviteMember({
      email: email.trim(),
      role: "member",
      organizationId: orgId,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Error sending the invitation");
      return;
    }
    setSuccess(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            An invitation will be sent to the provided email address.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Check className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium">Invitation sent</p>
              <p className="text-xs text-muted-foreground">{email}</p>
              <Button size="sm" variant="ghost" onClick={reset}>
                Invite another
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="invite-email"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Email address
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}
        </DialogPanel>
        {!success && (
          <DialogFooter variant="bare">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={loading || !email.trim()}
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Send invitation
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "text-warning",
  accepted: "text-success",
  rejected: "text-destructive",
  cancelled: "text-muted-foreground",
};

function InvitationsDialog({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await authClient.organization.listInvitations({
      query: { organizationId: orgId },
    });
    setInvitations((data as Invitation[] | null) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sent invitations</DialogTitle>
        </DialogHeader>
        <DialogPanel>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No invitations sent
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="size-6 rounded-full shrink-0">
                      <AvatarImage
                        src={vercelAvatar(inv.email)}
                        alt={inv.email}
                      />
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {inv.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {inv.role}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium shrink-0",
                      STATUS_CLASS[inv.status] ?? "text-muted-foreground",
                    )}
                  >
                    {STATUS_LABEL[inv.status] ?? inv.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogPanel>
      </DialogContent>
    </Dialog>
  );
}

function OrgPanel({
  onDialogChange,
}: {
  onDialogChange: (open: boolean) => void;
}) {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : null;
  const { data: orgs, isPending } = authClient.useListOrganizations();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const activeOrg = slug
    ? ((orgs ?? []).find((o) => o.slug === slug) ?? null)
    : null;

  const handleDialogChange = (v: boolean) => onDialogChange(v);

  useEffect(() => {
    if (!activeOrg?.id) return;
    setMembersLoading(true);
    authClient.organization
      .listMembers({ query: { organizationId: activeOrg.id } })
      .then(({ data }) => setMembers((data?.members as Member[] | null) ?? []))
      .finally(() => setMembersLoading(false));
  }, [activeOrg?.id]);

  if (isPending) {
    return <div className="text-xs text-muted-foreground">Loading…</div>;
  }

  if (!activeOrg) {
    return (
      <div className="text-xs text-muted-foreground">
        No organization selected
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Org info + actions in one row */}
      <div className="flex items-center gap-2">
        <Avatar className="size-7 rounded-md shrink-0">
          <AvatarImage
            src={vercelAvatar(activeOrg.slug)}
            alt={activeOrg.name}
          />
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="text-xs font-semibold text-card-foreground truncate"
            style={{ letterSpacing: "-0.02em" }}
          >
            {activeOrg.name}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono truncate leading-tight">
            /{activeOrg.slug}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setInviteOpen(true);
              handleDialogChange(true);
            }}
            aria-label="Invite member"
            title="Invite"
          >
            <IconUserSearchFillDuo18 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setListOpen(true);
              handleDialogChange(true);
            }}
            aria-label="View invitations"
            title="Invitations"
          >
            <IconPaperPlane2FillDuo18 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Members row */}
      <div className="flex items-center gap-1.5">
        {membersLoading ? (
          <Loader2 className="size-3 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="flex -space-x-1">
              {members.slice(0, 6).map((m) => (
                <MemberAvatar key={m.id} member={m} />
              ))}
            </div>
            {members.length > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {members.length > 6 ? `+${members.length - 6} · ` : ""}
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            )}
          </>
        )}
      </div>

      <InviteDialog
        orgId={activeOrg.id}
        open={inviteOpen}
        onOpenChange={(v) => {
          setInviteOpen(v);
          handleDialogChange(v);
        }}
      />
      <InvitationsDialog
        orgId={activeOrg.id}
        open={listOpen}
        onOpenChange={(v) => {
          setListOpen(v);
          handleDialogChange(v);
        }}
      />
    </div>
  );
}

function ProfilePanel() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const avatarKey = user?.name ?? user?.email ?? "unknown";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-9 rounded-lg shrink-0">
          <AvatarImage src={vercelAvatar(avatarKey)} alt={user?.name ?? ""} />
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
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
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Sign out"
          title="Sign out"
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = "/login";
                },
              },
            });
          }}
        >
          <IconArrowDoorOut3FillDuo18 className="size-3.5" />
        </Button>
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
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleGenerate}
        disabled={true}
      >
        {loading
          ? "Generating…"
          : done
            ? "Downloaded!"
            : "Generate certificate"}
      </Button>
    </div>
  );
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 text-xs bg-muted rounded-md px-2 py-1.5 font-mono text-card-foreground tracking-wider">
        {code}
      </code>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}

function SponsorResourcesPanel({
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
          Sponsor Resources
        </span>
        <span className="text-xs text-muted-foreground">
          Redeem credits and access sponsor tools.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => handleOpenChange(true)}
      >
        <IconVault3FillDuo18 className="h-3.5 w-3.5" />
        View resources
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sponsor Resources</DialogTitle>
            <DialogDescription>
              How to redeem credits and access tools from our sponsors.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div className="flex flex-col gap-4">
              {/* Featherless AI */}
              <div className="flex flex-col gap-1.5 pb-4 border-b border-border">
                <span className="text-sm font-semibold text-card-foreground">
                  Featherless AI
                </span>
                <span className="text-xs text-muted-foreground">
                  Follow the guide to redeem your credits.
                </span>
                <a
                  href="https://drive.google.com/file/d/1DfnRTcefSDoY5d7FJ1ToOOlrUc2Qdjzn/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Redemption guide
                </a>
              </div>

              {/* ElevenLabs */}
              <div className="flex flex-col gap-1.5 pb-4 border-b border-border">
                <span className="text-sm font-semibold text-card-foreground">
                  ElevenLabs
                </span>
                <ol className="flex flex-col gap-1 list-decimal list-inside text-xs text-muted-foreground">
                  <li>Join the Discord server</li>
                  <li>
                    Gain access to the{" "}
                    <span className="font-mono text-card-foreground">
                      #coupon-codes
                    </span>{" "}
                    channel
                  </li>
                  <li>
                    Click{" "}
                    <strong className="text-card-foreground">
                      "Start Redemption"
                    </strong>
                  </li>
                  <li>
                    Select the event and fill out the form using your
                    registration email
                  </li>
                  <li>The bot sends you a unique coupon code</li>
                </ol>
                <div className="flex flex-col gap-1 mt-1">
                  <a
                    href="https://discord.com/invite/VnBvbbcdEC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Join Discord
                  </a>
                  <a
                    href="https://youtu.be/S143_JtCtV8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Video tutorial
                  </a>
                </div>
              </div>

              {/* v0 by Vercel */}
              <div className="flex flex-col gap-1.5 pb-4 border-b border-border">
                <span className="text-sm font-semibold text-card-foreground">
                  v0 by Vercel
                </span>
                <span className="text-xs text-muted-foreground">
                  Use this code to redeem your v0 credits.
                </span>
                <CopyCode code="SHE-SHIPS-V0" />
              </div>

              {/* Other tools */}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-card-foreground">
                  Other Tools
                </span>
                <div className="flex flex-col gap-1">
                  <a
                    href="https://www.pawboard.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Pawboard
                  </a>
                  <a
                    href="https://c3.crafter.run/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    C3 Crafter
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      aria-label="Toggle theme"
      variant="ghost"
      size="icon"
      className="rounded-md"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <IconDarkLightFillDuo18 className="h-4.5 w-4.5" />
    </Button>
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
    label: "Resources",
    icon: <IconVault3FillDuo18 className="h-4.5 w-4.5" />,
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
                          {item.id === 1 && (
                            <OrgPanel onDialogChange={setDialogOpen} />
                          )}
                          {item.id === 2 && <ProfilePanel />}
                          {item.id === 3 && <CertificatePanel />}
                          {item.id === 4 && (
                            <SponsorResourcesPanel
                              onDialogChange={setDialogOpen}
                            />
                          )}
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
              <Button
                key={item.id}
                aria-label={item.label}
                variant={active === item.id ? "secondary" : "ghost"}
                size="icon"
                className="rounded-md"
                onClick={() => {
                  if (!isOpen) setIsOpen(true);
                  if (active === item.id) {
                    setIsOpen(false);
                    setActive(null);
                    return;
                  }
                  setActive(item.id);
                }}
              >
                {item.icon}
              </Button>
            ))}
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
