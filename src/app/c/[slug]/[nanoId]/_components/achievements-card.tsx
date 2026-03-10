import type { ReactNode } from "react";

interface Badge {
  name: string;
  subtitle: string;
  icon: ReactNode;
}

interface AchievementsCardProps {
  badges: Badge[];
  heading: string;
  countLabel: string;
}

/**
 * Layout params scale by badge count so everything fits the safe area.
 * Card style mirrors the home achievements grid: centered icon + text, rounded.
 */
/**
 * Square cards need more columns to fit vertically.
 * Safe area is ~88×68.5 cqw (~1690×740px at 1920w).
 * Max rows ≈ floor(68.5 / (cardSize + gap)).
 */
function getLayout(count: number) {
  if (count <= 3) return { cols: 3, gap: 0.8, p: 1.0, icon: 3.2, iconR: 0.7, title: 0.8, sub: 0.65, radius: 1.0, dot: 0.4 };
  if (count <= 6) return { cols: 3, gap: 0.7, p: 0.9, icon: 2.8, iconR: 0.6, title: 0.75, sub: 0.6, radius: 0.9, dot: 0.35 };
  if (count <= 9) return { cols: 3, gap: 0.6, p: 0.8, icon: 2.6, iconR: 0.55, title: 0.7, sub: 0.55, radius: 0.8, dot: 0.3 };
  if (count <= 12) return { cols: 4, gap: 0.55, p: 0.7, icon: 2.2, iconR: 0.5, title: 0.65, sub: 0.5, radius: 0.7, dot: 0.28 };
  if (count <= 15) return { cols: 5, gap: 0.5, p: 0.6, icon: 2.0, iconR: 0.45, title: 0.6, sub: 0.48, radius: 0.65, dot: 0.25 };
  if (count <= 20) return { cols: 5, gap: 0.45, p: 0.55, icon: 1.8, iconR: 0.4, title: 0.55, sub: 0.44, radius: 0.55, dot: 0.22 };
  if (count <= 25) return { cols: 6, gap: 0.4, p: 0.5, icon: 1.6, iconR: 0.35, title: 0.52, sub: 0.42, radius: 0.5, dot: 0.2 };
  return { cols: 6, gap: 0.35, p: 0.45, icon: 1.4, iconR: 0.3, title: 0.48, sub: 0.38, radius: 0.45, dot: 0.18 };
}

export function AchievementsCard({
  badges,
  heading,
  countLabel,
}: AchievementsCardProps) {
  const l = getLayout(badges.length);

  return (
    <div
      id="achievements"
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "1920/1080", containerType: "inline-size" }}
    >
      <img
        src="/certificate/SS-ParticipantCertificate-2.svg"
        alt=""
        className="absolute inset-0 w-full h-full"
        draggable={false}
      />

      {/* Safe area */}
      <div
        className="absolute flex flex-col overflow-hidden"
        style={{
          top: "23.5%",
          left: "6%",
          right: "6%",
          bottom: "8%",
          fontFamily: "var(--font-space-mono), monospace",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ marginBottom: `${l.gap * 1.5}cqw` }}
        >
          <p
            className="font-semibold uppercase tracking-[0.15em] text-[#E9A1C9]"
            style={{
              fontSize: `${l.title + 0.3}cqw`,
              fontFamily:
                "var(--font-monoblock), var(--font-space-grotesk), sans-serif",
            }}
          >
            {heading}
          </p>
          <p className="text-white/50" style={{ fontSize: `${l.sub + 0.2}cqw` }}>
            {countLabel}
          </p>
        </div>

        {/* Badge grid — same card style as home achievements */}
        <div
          className="flex-1 content-start"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${l.cols}, minmax(0, 1fr))`,
            gap: `${l.gap}cqw`,
          }}
        >
          {badges.map((badge) => (
            <div
              key={badge.name}
              className="relative flex flex-col items-center justify-center border border-white/10 bg-white/[0.04]"
              style={{
                gap: `${l.p * 0.5}cqw`,
                borderRadius: `${l.radius}cqw`,
                padding: `${l.p}cqw`,
              }}
            >
              {/* Unlocked dot */}
              <span
                className="absolute bg-green-400 rounded-full"
                style={{
                  width: `${l.dot}cqw`,
                  height: `${l.dot}cqw`,
                  top: `${l.p * 0.5}cqw`,
                  right: `${l.p * 0.5}cqw`,
                }}
              />

              {/* Icon */}
              <div
                className="flex items-center justify-center bg-white/[0.06]"
                style={{
                  width: `${l.icon}cqw`,
                  height: `${l.icon}cqw`,
                  borderRadius: `${l.iconR}cqw`,
                }}
              >
                {badge.icon}
              </div>

              {/* Text */}
              <div className="text-center min-w-0 w-full">
                <p
                  className="font-semibold text-white leading-tight tracking-tight truncate"
                  style={{ fontSize: `${l.title}cqw` }}
                >
                  {badge.name}
                </p>
                <p
                  className="text-white/50 leading-snug truncate"
                  style={{
                    fontSize: `${l.sub}cqw`,
                    marginTop: `${l.gap * 0.2}cqw`,
                  }}
                >
                  {badge.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
