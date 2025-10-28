import type { Metadata } from "next";
import "../styles/globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Rug Line Sheet Builder",
  description: "Create print-ready line sheets for Gertmenian collections."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-brand antialiased">{children}</body>
    </html>
  );
}
