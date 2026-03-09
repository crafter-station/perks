export const SUPPORTED_LANGS = ["en", "es", "pt"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export function resolveLang(raw: string | undefined): Lang {
  return SUPPORTED_LANGS.includes(raw as Lang) ? (raw as Lang) : "en";
}

export const translations = {
  en: {
    hackathon: "Hackathon",
    certificateTitle: "Certificate of Participation",
    certifiesThat: "This certifies that",
    memberOfTeam: "a member of team",
    participated:
      "actively participated in the She Ships Hackathon — a hackathon celebrating women who build, ship, and inspire.",
    achievementsEarned: "Achievements Earned",
    achievementsUnlocked: (n: number) =>
      `${n} achievement${n === 1 ? "" : "s"} unlocked`,
    downloadLabel: "Download as PDF",
    generating: "Generating…",
  },
  es: {
    hackathon: "Hackathon",
    certificateTitle: "Certificado de Participación",
    certifiesThat: "Esto certifica que",
    memberOfTeam: "miembro del equipo",
    participated:
      "participó activamente en el She Ships Hackathon — un hackathon que celebra a las mujeres que construyen, publican e inspiran.",
    achievementsEarned: "Logros Obtenidos",
    achievementsUnlocked: (n: number) =>
      `${n} logro${n === 1 ? "" : "s"} desbloqueado${n === 1 ? "" : "s"}`,
    downloadLabel: "Descargar como PDF",
    generating: "Generando…",
  },
  pt: {
    hackathon: "Hackathon",
    certificateTitle: "Certificado de Participação",
    certifiesThat: "Isso certifica que",
    memberOfTeam: "membro do time",
    participated:
      "participou ativamente do She Ships Hackathon — um hackathon que celebra mulheres que constroem, lançam e inspiram.",
    achievementsEarned: "Conquistas Obtidas",
    achievementsUnlocked: (n: number) =>
      `${n} conquista${n === 1 ? "" : "s"} desbloqueada${n === 1 ? "" : "s"}`,
    downloadLabel: "Baixar como PDF",
    generating: "Gerando…",
  },
} satisfies Record<Lang, object>;
