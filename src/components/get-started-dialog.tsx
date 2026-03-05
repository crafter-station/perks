"use client";

import { Check, ChevronRight, Loader2, Mail, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type Invitation = {
  id: string;
  status: string;
  organizationName?: string;
  organization?: { name: string; slug: string };
  inviterEmail?: string;
  role?: string;
};

// --- Divider ---
function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground/60">o</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// --- Create Organization Form ---
function CreateOrganizationForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; slug: string } | null>(
    null,
  );

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) return;
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.organization.create({
      name: name.trim(),
      slug: slug.trim(),
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Error al crear la organización");
      return;
    }
    setCreated({ name: name.trim(), slug: slug.trim() });
  };

  if (created) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-800 dark:bg-emerald-900/20">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
            <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {created.name}
            </p>
            <p className="text-xs text-emerald-600/70 font-mono">
              /{created.slug}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          render={<Link href={`/${created.slug}`} />}
          className="text-xs h-7 px-2.5 text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
        >
          Ir →
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <label
            htmlFor="org-name"
            className="text-xs font-medium text-muted-foreground"
          >
            Nombre
          </label>
          <Input
            id="org-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Mi equipo"
            size="sm"
          />
        </div>
        <div className="flex flex-col gap-1 w-32">
          <label
            htmlFor="org-slug"
            className="text-xs font-medium text-muted-foreground"
          >
            Slug
          </label>
          <Input
            id="org-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="mi-equipo"
            className="font-mono"
            size="sm"
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <X className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
      <Button
        size="sm"
        onClick={handleCreate}
        disabled={loading || !name.trim() || !slug.trim()}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Creando...
          </>
        ) : (
          "Crear equipo"
        )}
      </Button>
    </div>
  );
}

// --- Invitations List ---
function InvitationsList({
  onAccepted,
}: {
  onAccepted?: (slug: string) => void;
}) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    authClient.organization
      .listUserInvitations()
      .then(({ data }) => setInvitations((data as Invitation[] | null) ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (invitationId: string) => {
    setAccepting(invitationId);
    const { error } = await authClient.organization.acceptInvitation({
      invitationId,
    });
    setAccepting(null);
    if (!error) {
      // Find the slug from the invitation's organization field
      const inv = invitations.find((i) => i.id === invitationId);
      const slug = inv?.organization?.slug;
      if (slug) {
        onAccepted?.(slug);
      } else {
        // Fallback: fetch updated orgs and navigate
        const { data: orgs } = await authClient.organization.list();
        const org = (orgs as { slug: string }[] | null)?.[0];
        if (org) onAccepted?.(org.slug);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-5">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pending = invitations.filter((inv) => inv.status === "pending");

  if (pending.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-3">
        No tienes invitaciones pendientes
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {pending.map((inv) => {
        const orgName =
          inv.organizationName ?? inv.organization?.name ?? "Organización";

        return (
          <div
            key={inv.id}
            className="flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{orgName}</p>
              {inv.inviterEmail && (
                <p className="text-xs text-muted-foreground truncate">
                  de {inv.inviterEmail}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAccept(inv.id)}
              disabled={accepting === inv.id}
              className="shrink-0 h-7 px-2.5"
            >
              {accepting === inv.id ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                "Unirse"
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

// --- Dialog content for users with session but no org ---
function OnboardingContent({
  onAccepted,
}: {
  onAccepted?: (slug: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Crear equipo
        </p>
        <CreateOrganizationForm />
      </section>
      <Divider />
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Mail className="size-3.5" />
          Invitaciones
        </p>
        <InvitationsList onAccepted={onAccepted} />
      </section>
    </div>
  );
}

// --- Main Component ---
export function GetStartedDialog() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: orgs, isPending: orgsPending } =
    authClient.useListOrganizations();

  const isPending = sessionPending || (!!session && orgsPending);

  if (isPending) {
    return (
      <Button variant="default" disabled className="gap-1 pr-1.5">
        <Loader2 className="size-4 animate-spin" />
        Comenzar
      </Button>
    );
  }

  // No session → CTA a signup
  if (!session) {
    return (
      <Button
        variant="default"
        render={
          <Link href="/signup">
            Comenzar
            <ChevronRight />
          </Link>
        }
        className="gap-1 pr-1.5"
      />
    );
  }

  const myOrg = ((orgs ?? []) as { slug: string }[])[0];

  // Tiene org → ir directo
  if (myOrg) {
    return (
      <Button
        variant="default"
        render={
          <Link href={`/${myOrg.slug}`}>
            Ir a mi equipo <ChevronRight />
          </Link>
        }
        className="gap-1 pr-1.5"
      />
    );
  }

  // Con session pero sin org → dialog de onboarding
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="default" className="gap-1 pr-1.5">
            Comenzar
            <ChevronRight />
          </Button>
        }
      />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Empecemos</DialogTitle>
          <DialogDescription>
            Crea tu equipo o únete a uno con una invitación
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <OnboardingContent
            onAccepted={(slug) => {
              window.location.href = `/${slug}`;
            }}
          />
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
