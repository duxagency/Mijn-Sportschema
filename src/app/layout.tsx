import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mijn Sportschema",
  description: "Bouw trainingsschema's en log je krachttraining.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
