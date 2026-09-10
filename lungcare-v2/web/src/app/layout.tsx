import type { Metadata } from "next";
import "./globals.css";
import { ClinicalProvider } from "@/components/clinical-context";
import { RoleNav } from "@/components/role-nav";

export const metadata: Metadata = {
  title: "LungCare V3 — Connected Oncology Care Loop",
  description: "Next-generation connected oncology care workflow for Patient, Nurse, and Doctor.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900 selection:bg-emerald-200">
        <ClinicalProvider>
          <RoleNav />
          <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-16">
            {children}
          </main>
        </ClinicalProvider>
      </body>
    </html>
  );
}

