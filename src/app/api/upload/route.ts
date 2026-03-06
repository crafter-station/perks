import { put } from "@vercel/blob";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".heic",
  ".heif",
  ".pdf",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function isAllowedFile(file: File): boolean {
  if (ALLOWED_TYPES.includes(file.type)) return true;
  // Fallback: check extension when type is empty (common in some browsers)
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  return ALLOWED_EXTENSIONS.includes(ext);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const orgBadgeId = form.get("orgBadgeId") as string | null;

  if (!file || !orgBadgeId) {
    return Response.json(
      { error: "Missing file or orgBadgeId" },
      { status: 400 },
    );
  }

  if (!isAllowedFile(file)) {
    return Response.json(
      { error: "Only images and PDFs are allowed" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return Response.json(
      { error: "File exceeds 10 MB limit" },
      { status: 400 },
    );
  }

  // Verify user belongs to the org that owns this badge
  const orgBadge = await prisma.orgBadge.findUnique({
    where: { id: orgBadgeId },
    select: {
      organization: {
        select: {
          members: {
            where: { userId: session.user.id },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!orgBadge) return Response.json({ error: "Not found" }, { status: 404 });
  if (orgBadge.organization.members.length === 0)
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const blob = await put(`evidence/${orgBadgeId}/${file.name}`, file, {
    access: "public",
  });

  return Response.json({ url: blob.url });
}
