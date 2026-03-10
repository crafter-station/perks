"use client";

import { Check, Copy, ExternalLink, Loader2, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  IconArrowDoorOut3FillDuo18,
  IconAwardCertificateFillDuo18,
  IconDarkLightFillDuo18,
  IconGear2FillDuo18,
  IconOfficeFillDuo18,
  IconTrashFillDuo18,
  IconUserFillDuo18,
  IconUserSearchFillDuo18,
  IconVault3FillDuo18,
} from "nucleo-ui-essential-fill-duo-18";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { Label } from "@/components/ui/label";
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

type ConfirmAction = "leave" | "delete" | null;

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
};

function OrgSettingsDialog({
  orgId,
  orgName,
  open,
  onOpenChange,
}: {
  orgId: string;
  orgName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentUserId = session?.user?.id;
  const currentMember = members.find((m) => m.userId === currentUserId);
  const isOwner = currentMember?.role === "owner";
  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  const load = useCallback(async () => {
    setLoading(true);
    const [membersRes, invitationsRes] = await Promise.all([
      authClient.organization.listMembers({ query: { organizationId: orgId } }),
      authClient.organization.listInvitations({
        query: { organizationId: orgId },
      }),
    ]);
    setMembers((membersRes.data?.members as Member[] | null) ?? []);
    setInvitations((invitationsRes.data as Invitation[] | null) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    if (open) {
      load();
      setConfirmAction(null);
      setActionError(null);
    }
  }, [open, load]);

  const handleCancelInvitation = async (invitationId: string) => {
    setCancellingId(invitationId);
    const { error } = await authClient.organization.cancelInvitation({
      invitationId,
    });
    if (!error) {
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    }
    setCancellingId(null);
  };

  const handleLeave = async () => {
    setActionLoading(true);
    setActionError(null);
    const { error } = await authClient.organization.leave({
      organizationId: orgId,
    });
    setActionLoading(false);
    if (error) {
      setActionError(error.message ?? "Failed to leave");
      return;
    }
    onOpenChange(false);
    router.push("/");
  };

  const handleDelete = async () => {
    setActionLoading(true);
    setActionError(null);
    const { error } = await authClient.organization.delete({
      organizationId: orgId,
    });
    setActionLoading(false);
    if (error) {
      setActionError(error.message ?? "Failed to delete");
      return;
    }
    onOpenChange(false);
    router.push("/");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <p className="text-sm font-semibold text-foreground tracking-tight">
            Settings
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            /{orgName}
          </p>
        </div>

        {confirmAction ? (
          /* ── Confirm view ── */
          <div className="px-5 pb-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-foreground">
                {confirmAction === "delete"
                  ? "Delete organization?"
                  : "Leave organization?"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {confirmAction === "delete"
                  ? `"${orgName}" and all its data will be permanently removed. This cannot be undone.`
                  : isOwner
                    ? `You'll be removed as owner of "${orgName}". This only works if there are other owners.`
                    : `You'll lose access to "${orgName}" and all its badges.`}
              </p>
            </div>
            {actionError && (
              <p className="text-xs text-destructive">{actionError}</p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setConfirmAction(null);
                  setActionError(null);
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 cursor-pointer"
                onClick={
                  confirmAction === "delete" ? handleDelete : handleLeave
                }
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : confirmAction === "delete" ? (
                  "Delete"
                ) : (
                  "Leave"
                )}
              </Button>
            </div>
          </div>
        ) : loading ? (
          /* ── Loading ── */
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          /* ── Main view ── */
          <>
            {/* Members */}
            <div className="px-5 pb-1">
              {members.map((m) => {
                const name = m.user?.name ?? m.user?.email ?? "Unknown";
                const email = m.user?.email;
                const avatarKey = email ?? name;
                const isYou = m.userId === currentUserId;
                return (
                  <div key={m.id} className="flex items-center gap-3 py-2">
                    <Avatar className="size-7 rounded-full shrink-0">
                      <AvatarImage src={vercelAvatar(avatarKey)} alt={name} />
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-medium text-foreground truncate leading-none">
                          {name}
                        </span>
                        {isYou && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            you
                          </span>
                        )}
                      </div>
                      {email && name !== email && (
                        <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {email}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0 capitalize">
                      {m.role}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Pending invitations */}
            {pendingInvitations.length > 0 && (
              <>
                <div className="border-t border-border mx-5 mt-1" />
                <div className="px-5 pt-3 pb-1">
                  <p className="text-[11px] text-muted-foreground mb-2">
                    Pending · {pendingInvitations.length}
                  </p>
                  {pendingInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center gap-3 py-1.5 group"
                    >
                      <Avatar className="size-7 rounded-full shrink-0 opacity-50">
                        <AvatarImage
                          src={vercelAvatar(inv.email)}
                          alt={inv.email}
                        />
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs text-foreground truncate leading-none">
                          {inv.email}
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                          {inv.role}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelInvitation(inv.id)}
                        disabled={cancellingId === inv.id}
                        aria-label="Cancel invitation"
                        className="shrink-0 size-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/8 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer disabled:pointer-events-none"
                      >
                        {cancellingId === inv.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <X className="size-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Danger actions */}
            <div className="border-t border-border mx-5 mt-2" />
            <div className="px-3 py-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setConfirmAction("leave")}
                className="flex items-center gap-1.5 px-2 py-2 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors duration-150 cursor-pointer"
              >
                <IconArrowDoorOut3FillDuo18 className="size-3.5 shrink-0" />
                Leave
              </button>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setConfirmAction("delete")}
                  className="flex items-center gap-1.5 px-2 py-2 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors duration-150 cursor-pointer"
                >
                  <IconTrashFillDuo18 className="size-3.5 shrink-0" />
                  Delete organization
                </button>
              )}
            </div>
          </>
        )}
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
  const [settingsOpen, setSettingsOpen] = useState(false);
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
            className="cursor-pointer"
          >
            <IconUserSearchFillDuo18 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setSettingsOpen(true);
              handleDialogChange(true);
            }}
            aria-label="Organization settings"
            title="Settings"
            className="cursor-pointer"
          >
            <IconGear2FillDuo18 className="size-3.5" />
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
        onOpenChange={(v: boolean) => {
          setInviteOpen(v);
          handleDialogChange(v);
        }}
      />
      <OrgSettingsDialog
        orgId={activeOrg.id}
        orgName={activeOrg.slug}
        open={settingsOpen}
        onOpenChange={(v: boolean) => {
          setSettingsOpen(v);
          handleDialogChange(v);
        }}
      />
    </div>
  );
}

function ProfilePanel({
  onDialogChange,
}: { onDialogChange: (open: boolean) => void }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const avatarKey = user?.name ?? user?.email ?? "unknown";
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpen = () => {
    setName(user?.name ?? "");
    setEditOpen(true);
    onDialogChange(true);
  };

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.name) {
      setEditOpen(false);
      return;
    }
    setSaving(true);
    await authClient.updateUser({ name: trimmed });
    setSaving(false);
    setEditOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-lg shrink-0">
            <AvatarImage
              src={vercelAvatar(avatarKey)}
              alt={user?.name ?? ""}
            />
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <button
              type="button"
              onClick={handleOpen}
              className="text-sm font-semibold text-card-foreground truncate text-left hover:underline cursor-pointer"
              style={{ letterSpacing: "-0.02em" }}
              title="Edit name"
            >
              {user?.name ?? "—"}
            </button>
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

      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          onDialogChange(v);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit your name</DialogTitle>
            <DialogDescription>
              This is the name displayed on your profile and certificates.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                }}
                placeholder="Your name"
                disabled={saving}
                autoFocus
              />
            </div>
          </DialogPanel>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={saveName}
              disabled={saving || !name.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CertificatePanel() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : null;
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: orgs, isPending: orgsPending } =
    authClient.useListOrganizations();
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);

  const activeOrg = slug
    ? ((orgs ?? []).find((o) => o.slug === slug) ?? null)
    : null;

  useEffect(() => {
    if (!activeOrg?.id || !session?.user?.id) return;
    setMemberLoading(true);
    authClient.organization
      .listMembers({ query: { organizationId: activeOrg.id } })
      .then(({ data }) => {
        const me = (data?.members as (Member & { nanoId?: string })[] | null)?.find(
          (m) => m.userId === session.user.id,
        );
        if (me?.nanoId && activeOrg.slug) {
          setCertificateUrl(`/c/${activeOrg.slug}/${me.nanoId}`);
        } else if (me?.id) {
          setCertificateUrl(`/certificate/${me.id}`);
        }
      })
      .finally(() => setMemberLoading(false));
  }, [activeOrg?.id, activeOrg?.slug, session?.user?.id]);

  const isLoading = sessionPending || orgsPending || memberLoading;

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
          View your participation certificate for this hackathon.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        disabled={isLoading || !certificateUrl}
        render={
          certificateUrl ? (
            // biome-ignore lint/a11y/useAnchorContent: Button children are merged into the anchor by useRender
            <a
              href={certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
            />
          ) : undefined
        }
      >
        {isLoading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : certificateUrl ? (
          "View certificate"
        ) : (
          "No team selected"
        )}
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
                          {item.id === 2 && (
                            <ProfilePanel
                              onDialogChange={setDialogOpen}
                            />
                          )}
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
