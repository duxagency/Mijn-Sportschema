import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export const metadata: Metadata = {
  title: "Mijn Sportschema",
  description: "Bouw trainingsschema's en log je krachttraining.",
  appleWebApp: {
    capable: true,
    title: "Sportschema",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="min-h-screen antialiased">
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
