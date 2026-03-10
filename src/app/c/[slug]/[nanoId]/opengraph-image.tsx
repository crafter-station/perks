import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
	params,
}: {
	params: Promise<{ slug: string; nanoId: string }>;
}) {
	const { slug, nanoId } = await params;

	const member = await prisma.member.findFirst({
		where: {
			nanoId,
			organization: { slug },
		},
		include: {
			user: { select: { name: true } },
			organization: { select: { name: true } },
		},
	});

	if (!member) {
		return new ImageResponse(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#0C0C0C",
					color: "white",
					fontSize: 48,
				}}
			>
				Certificate not found
			</div>,
			{ ...size },
		);
	}

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				backgroundColor: "#0C0C0C",
				padding: "60px 80px",
			}}
		>
			{/* Top accent bar */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: 4,
					backgroundColor: "#E9A1C9",
				}}
			/>

			{/* Branding */}
			<div
				style={{
					display: "flex",
					fontSize: 20,
					fontWeight: 600,
					color: "#E9A1C9",
					letterSpacing: "0.15em",
					marginBottom: 8,
				}}
			>
				SHE SHIPS HACKATHON
			</div>

			<div
				style={{
					display: "flex",
					fontSize: 22,
					color: "rgba(255,255,255,0.4)",
					fontWeight: 600,
					letterSpacing: "0.1em",
					marginBottom: 48,
				}}
			>
				CERTIFICATE OF PARTICIPATION
			</div>

			{/* Name */}
			<div
				style={{
					display: "flex",
					fontSize: 72,
					fontWeight: 700,
					color: "white",
					letterSpacing: "0.04em",
					lineHeight: 1.1,
					marginBottom: 24,
				}}
			>
				{member.user.name.toUpperCase()}
			</div>

			{/* Team */}
			<div
				style={{
					display: "flex",
					fontSize: 32,
					fontWeight: 600,
					color: "#E9A1C9",
				}}
			>
				Team {member.organization.name}
			</div>
		</div>,
		{ ...size },
	);
}
