import localFont from "next/font/local";
import { Space_Grotesk, Space_Mono } from "next/font/google";

const monoblock = localFont({
  src: [
    { path: "../../../../../public/fonts/Monoblock-Regular.otf", weight: "400" },
    { path: "../../../../../public/fonts/Monoblock-SemiBold.otf", weight: "600" },
    { path: "../../../../../public/fonts/Monoblock-Bold.otf", weight: "700" },
  ],
  variable: "--font-monoblock",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export default function CertificateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${monoblock.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      {children}
    </div>
  );
}
