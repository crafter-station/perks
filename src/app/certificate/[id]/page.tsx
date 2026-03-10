import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CertificateRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
    select: {
      nanoId: true,
      organization: { select: { slug: true } },
    },
  });

  if (!member) notFound();

  redirect(`/c/${member.organization.slug}/${member.nanoId}`);
}
