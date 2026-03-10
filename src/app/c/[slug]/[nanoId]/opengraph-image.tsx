import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const size = { width: 1920, height: 1080 };
export const contentType = "image/png";

let svgDataUriCache: string | null = null;
function getSvgDataUri() {
	if (svgDataUriCache) return svgDataUriCache;
	const svgPath = join(
		process.cwd(),
		"public",
		"certificate",
		"SS-ParticipantCertificate.svg",
	);
	const svgContent = readFileSync(svgPath, "utf-8");
	svgDataUriCache = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;
	return svgDataUriCache;
}

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
					width: 1920,
					height: 1080,
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

	const svgDataUri = getSvgDataUri();

	return new ImageResponse(
		<div
			style={{
				width: 1920,
				height: 1080,
				display: "flex",
				position: "relative",
			}}
		>
			{/* Certificate SVG background template */}
			<img
				src={svgDataUri}
				width={1920}
				height={1080}
				style={{ position: "absolute", top: 0, left: 0 }}
			/>

			{/* Participant Name — positioned to match certificate preview */}
			<div
				style={{
					position: "absolute",
					top: 530,
					left: 655,
					color: "white",
					fontSize: 64,
					fontWeight: 700,
					letterSpacing: "0.06em",
					lineHeight: 1.1,
					maxWidth: 1200,
				}}
			>
				{member.user.name.toUpperCase()}
			</div>

			{/* Team Name */}
			<div
				style={{
					position: "absolute",
					top: 748,
					left: 998,
					color: "#E9A1C9",
					fontSize: 32,
					fontWeight: 600,
				}}
			>
				Team {member.organization.name}
			</div>
		</div>,
		{ ...size },
	);
}
