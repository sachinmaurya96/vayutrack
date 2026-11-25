import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header, UtilityBar } from "@/components/layout/Header";
import { MotionClassSync } from "@/components/scene/SceneControls";
import { SceneHost } from "@/components/scene/SceneHost";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "VayuTrack — Courier & Freight Solutions", template: "%s · VayuTrack" },
  description:
    "Courier delivery with Express, Air and Ocean Freight for individuals and growing businesses. Plan your shipment, follow its progress, and stay connected from pickup to delivery.",
};

export const viewport: Viewport = {
  themeColor: "#f5f8fd",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={manrope.variable}>
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <UtilityBar />
        <Header />
        {children}
        <Footer />
        <SceneHost />
        <MotionClassSync />
      </body>
    </html>
  );
}
