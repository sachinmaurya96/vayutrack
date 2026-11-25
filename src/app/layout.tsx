import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VayuTrack — Courier & Freight Solutions",
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
        {children}
      </body>
    </html>
  );
}
