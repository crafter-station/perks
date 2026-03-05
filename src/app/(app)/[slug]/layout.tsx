import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppToolbar } from "@/components/app-toolbar";

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hdrs = await headers();

  const [session, orgs] = await Promise.all([
    auth.api.getSession({ headers: hdrs }),
    auth.api.listOrganizations({ headers: hdrs }),
  ]);

  // Parent (app) layout already redirects to /login if no session,
  // but guard here too in case layout order changes
  if (!session) notFound();

  const isMember = (orgs ?? []).some(
    (org: { slug: string }) => org.slug === slug,
  );

  if (!isMember) notFound();

  return (
    <>
      {children}
      <AppToolbar />
    </>
  );
}
