import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import { AppShell } from "@/components/AppShell";

import "./globals.css";

export const metadata: Metadata = {
  title: "Alfocea",
  description: "Mini CRM familiar para gestionar el terreno: reservas, manuales, normas y familias.",
  applicationName: "Alfocea",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Alfocea",
    statusBarStyle: "default",
    startupImage: [{ url: "/splash.png" }],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#6F8F7B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-dvh antialiased" style={{ backgroundColor: "#F7F5EF" }}>
        <div
          id="alfocea-splash"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "#F7F5EF",
          }}
        >
          {/* PNG grande: en el movil no se estira un icono pequeno. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/splash.png"
            alt=""
            width={1080}
            height={2400}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('alfocea-theme');var m=document.querySelector('meta[name=\"theme-color\"]');if(t==='anochecer'){document.documentElement.dataset.theme='anochecer';if(m)m.setAttribute('content','#7899A8')}else{document.documentElement.removeAttribute('data-theme');if(m)m.setAttribute('content','#6F8F7B')}}catch(e){}",
          }}
        />
        <Suspense fallback={null}>
          <AppShell>{children}</AppShell>
        </Suspense>
      </body>
    </html>
  );
}
