"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { IconDarkLightFillDuo18 } from "nucleo-ui-essential-fill-duo-18";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lang } from "../translations";

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
];

export function Controls({
  lang,
  participantName,
  downloadLabel,
  generating,
}: {
  lang: Lang;
  participantName: string;
  downloadLabel: string;
  generating: string;
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [downloading, setDownloading] = useState(false);

  const handleLang = (next: string | null) => {
    if (!next || next === lang) return;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    router.push(url.pathname + url.search);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const jsPDF = (await import("jspdf")).default;

      const el = document.getElementById("certificate");
      if (!el) return;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
        hotfixes: ["px_scaling"],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);

      const safeName = participantName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      pdf.save(`certificate-${safeName}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      {/* Theme toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <IconDarkLightFillDuo18 className="size-3.5" />
      </Button>

      {/* Divider */}
      <div className="w-px h-5 bg-border" />

      {/* Language dropdown */}
      <Select value={lang} onValueChange={handleLang}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectPopup align="center">
          {LANG_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>

      {/* Divider */}
      <div className="w-px h-5 bg-border" />

      {/* Download */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={downloading}
        className="gap-2"
      >
        <Download className="size-3.5" />
        {downloading ? generating : downloadLabel}
      </Button>
    </div>
  );
}
