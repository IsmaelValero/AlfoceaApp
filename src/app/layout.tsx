import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import { AppShell } from "@/components/AppShell";

import "./globals.css";

export const metadata: Metadata = {
  title: "Alfocea",
  description: "Mini CRM familiar para gestionar el terreno: reservas, manuales, normas y familias.",
  applicationName: "Alfocea",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7899A8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('alfocea-theme')==='amanecer'){document.documentElement.dataset.theme='amanecer';var m=document.querySelector('meta[name=\"theme-color\"]');if(m)m.setAttribute('content','#6F8F7B')}}catch(e){}",
          }}
        />
        <Suspense fallback={null}>
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
