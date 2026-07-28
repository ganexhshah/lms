"use client";

import { useEffect, useState } from "react";
import { Montserrat, Poppins } from "next/font/google";

import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { useLandingContentStore } from "@/store/landing-content-store";

const display = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-land-display",
  display: "swap",
});

const body = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-land-body",
  display: "swap",
});

export function PublicSiteShell({ children }: { children: React.ReactNode }) {
  const loadPublic = useLandingContentStore((s) => s.loadPublic);
  const loaded = useLandingContentStore((s) => s.loaded);
  const [ready, setReady] = useState(loaded);

  useEffect(() => {
    void loadPublic().finally(() => setReady(true));
  }, [loadPublic]);

  return (
    <div
      className={`${display.variable} ${body.variable} ${body.className} min-h-screen overflow-x-hidden bg-[#f8f6f1] text-[#1a1a1a] antialiased [&_h1]:font-[family-name:var(--font-land-display)] [&_h2]:font-[family-name:var(--font-land-display)] [&_h3]:font-[family-name:var(--font-land-display)]`}
    >
      <LandingNav />
      {ready ? children : (
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#6b625a]">
          Loading…
        </div>
      )}
      <LandingFooter />
    </div>
  );
}
