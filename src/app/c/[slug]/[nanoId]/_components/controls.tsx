"use client";

import { Award, Copy, Download, ExternalLink, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT } from "./certificate-preview";

// ── Font embedding for PDF ───────────────────────────────────────────

async function fontToDataUri(url: string, format: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return `data:font/${format};base64,${b64}`;
}

async function buildFontStyle(): Promise<SVGStyleElement> {
  const [boldUri, semiBoldUri] = await Promise.all([
    fontToDataUri("/fonts/Monoblock-Bold.otf", "otf"),
    fontToDataUri("/fonts/Monoblock-SemiBold.otf", "otf"),
  ]);

  const style = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "style",
  );
  style.textContent = `
    @font-face {
      font-family: 'Monoblock';
      font-weight: 700;
      src: url('${boldUri}') format('opentype');
    }
    @font-face {
      font-family: 'Monoblock';
      font-weight: 600;
      src: url('${semiBoldUri}') format('opentype');
    }
  `;
  return style;
}

// ── SVG → Canvas ─────────────────────────────────────────────────────

async function svgToCanvas(
  svgEl: SVGSVGElement,
): Promise<HTMLCanvasElement | null> {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  const images = clone.querySelectorAll("image");
  await Promise.all(
    Array.from(images).map(async (img) => {
      const href =
        img.getAttribute("href") ||
        img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
      if (!href || href.startsWith("data:")) return;
      const res = await fetch(href);
      const text = await res.text();
      img.setAttribute(
        "href",
        `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(text)))}`,
      );
    }),
  );

  const fontStyle = await buildFontStyle();
  clone.insertBefore(fontStyle, clone.firstChild);

  for (const textEl of clone.querySelectorAll("text")) {
    const ff = textEl.getAttribute("font-family") || "";
    if (ff.includes("--font-monoblock")) {
      textEl.setAttribute("font-family", "Monoblock, sans-serif");
    } else if (ff.includes("--font-space-mono")) {
      textEl.setAttribute("font-family", "monospace");
    }
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = CERTIFICATE_WIDTH * scale;
  canvas.height = CERTIFICATE_HEIGHT * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

// ── HTML → Canvas ────────────────────────────────────────────────────

async function htmlToCanvas(
  el: HTMLElement,
): Promise<HTMLCanvasElement | null> {
  const html2canvas = (await import("html2canvas-pro")).default;
  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    width: el.offsetWidth,
    height: el.offsetHeight,
  });
}

// ── Controls Component ───────────────────────────────────────────────

export function Controls({
  participantName,
  teamName,
  certId,
  issueDate,
  certUrl,
}: {
  participantName: string;
  teamName: string;
  certId: string;
  issueDate: Date;
  certUrl: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // ── LinkedIn Add to Profile URL ─────────────────────────────────
  const linkedInCertUrl = (() => {
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: "She Ships Hackathon — Participant Certificate",
      organizationId: "111972105",
      issueYear: String(issueDate.getFullYear()),
      issueMonth: String(issueDate.getMonth() + 1),
      certUrl,
      certId,
    });
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  })();

  const shareText = `🚀 I participated in the She Ships Hackathon with team ${teamName}!

Check out my certificate:
${certUrl}

#SheShips #Hackathon #WomenInTech`;

  // ── Download PDF ─────────────────────────────────────────────────

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const jsPDF = (await import("jspdf")).default;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT],
        hotfixes: ["px_scaling"],
      });

      const certSvg = document
        .getElementById("certificate")
        ?.querySelector("svg") as SVGSVGElement | null;
      if (!certSvg) return;

      const certCanvas = await svgToCanvas(certSvg);
      if (!certCanvas) return;

      pdf.addImage(
        certCanvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        CERTIFICATE_WIDTH,
        CERTIFICATE_HEIGHT,
      );

      const achievementsEl = document.getElementById("achievements");
      if (achievementsEl) {
        const achCanvas = await htmlToCanvas(achievementsEl);
        if (achCanvas) {
          pdf.addPage(
            [CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT],
            "landscape",
          );
          pdf.addImage(
            achCanvas.toDataURL("image/png"),
            "PNG",
            0,
            0,
            CERTIFICATE_WIDTH,
            CERTIFICATE_HEIGHT,
          );
        }
      }

      const safeName = participantName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      pdf.save(`certificate-${safeName}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  // ── Copy ─────────────────────────────────────────────────────────

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // ── Native Share ─────────────────────────────────────────────────

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${participantName}'s Certificate — She Ships Hackathon`,
          text: shareText,
          url: certUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else {
      handleCopy();
    }
  };

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-5xl print:hidden space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
          Share certificate
        </p>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={downloading}
          className="text-xs gap-1.5"
        >
          <Download className="size-3" />
          {downloading ? "Generating…" : "Download PDF"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="text-xs gap-1.5"
        >
          <Copy className="size-3" />
          {copied ? "Copied!" : "Copy"}
        </Button>

        {canShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="text-xs gap-1.5"
          >
            <Share2 className="size-3" />
            Share
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          render={
            <a
              href={linkedInCertUrl}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <Award className="size-3" />
          Add to LinkedIn
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          render={
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          LinkedIn
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          render={
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          X / Twitter
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          render={
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          WhatsApp
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          render={
            <a href={certUrl} target="_blank" rel="noopener noreferrer" />
          }
        >
          <ExternalLink className="size-3" />
          View page
        </Button>
      </div>
    </div>
  );
}
