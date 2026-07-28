"use client";

import { LandingHero } from "@/components/landing/landing-hero";
import { LandingSections } from "@/components/landing/landing-sections";
import { PublicSiteShell } from "@/components/landing/public-site-shell";

export function LandingPage() {
  return (
    <PublicSiteShell>
      <LandingHero />
      <LandingSections />
    </PublicSiteShell>
  );
}
