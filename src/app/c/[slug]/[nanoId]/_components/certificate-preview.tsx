// Certificate canvas dimensions (matches SS-ParticipantCertificate.svg)
export const CERTIFICATE_WIDTH = 1920;
export const CERTIFICATE_HEIGHT = 1080;

// Name safe area — name is always centered within this box
const NAME_BOX_X = 629;
const NAME_BOX_Y = 567;
const NAME_BOX_W = 1100;
const NAME_FONT_SIZE = 64;

// Team position
const TEAM_X = 998;
const TEAM_Y = 764;

// Font stack matching she.ships branding
const FONT_TITLE =
  "var(--font-monoblock), var(--font-space-grotesk), sans-serif";
const FONT_BODY = "var(--font-space-mono), monospace";

// Center of the name box
const NAME_CENTER_X = NAME_BOX_X + NAME_BOX_W / 2;

interface CertificatePreviewProps {
  participantName: string;
  teamName: string;
}

export function CertificatePreview({
  participantName,
  teamName,
}: CertificatePreviewProps) {
  const name = participantName.toUpperCase();
  // Approximate text width: ~0.65em per char with letter-spacing
  const estimatedWidth = name.length * NAME_FONT_SIZE * 0.65;
  const needsShrink = estimatedWidth > NAME_BOX_W;

  return (
    <div
      id="certificate"
      className="w-full"
      style={{ aspectRatio: `${CERTIFICATE_WIDTH}/${CERTIFICATE_HEIGHT}` }}
    >
      <svg
        width={CERTIFICATE_WIDTH}
        height={CERTIFICATE_HEIGHT}
        viewBox={`0 0 ${CERTIFICATE_WIDTH} ${CERTIFICATE_HEIGHT}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <image
          href="/certificate/SS-ParticipantCertificate.svg"
          x="0"
          y="0"
          width={CERTIFICATE_WIDTH}
          height={CERTIFICATE_HEIGHT}
        />

        {/* Participant Name — centered in safe area, auto-shrinks if needed */}
        <text
          x={NAME_CENTER_X}
          y={NAME_BOX_Y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={NAME_FONT_SIZE}
          fontWeight="700"
          fill="#FFFFFF"
          letterSpacing="0.06em"
          fontFamily={FONT_TITLE}
          textLength={needsShrink ? NAME_BOX_W : undefined}
          lengthAdjust="spacingAndGlyphs"
        >
          {name}
        </text>

        {/* Team Name */}
        <text
          x={TEAM_X}
          y={TEAM_Y}
          textAnchor="start"
          dominantBaseline="middle"
          fontSize="32"
          fontWeight="600"
          fill="#E9A1C9"
          fontFamily={FONT_BODY}
        >
          Team {teamName}
        </text>
      </svg>
    </div>
  );
}
