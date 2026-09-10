import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LungCare V3 Foundation",
  description: "Connected oncology care workflow foundation",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
