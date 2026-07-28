"use client";

import Link from "next/link";
import { toast } from "sonner";

import { useLandingContentStore } from "@/store/landing-content-store";

export function LandingFooter() {
  const content = useLandingContentStore((s) => s.content);

  return (
    <footer className="bg-[#1a1b21] px-4 pt-14 pb-8 text-white sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[12px] font-bold tracking-[0.16em] uppercase">
            {content.brandName}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-white/55">
            {content.footerBlurb}
          </p>
          <div className="mt-5 flex gap-2">
            <input
              className="h-9 flex-1 rounded-[4px] border border-white/15 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/35"
              placeholder="Subscribe our newsletter"
            />
            <button
              type="button"
              onClick={() => toast.success("Subscribed")}
              className="rounded-[4px] bg-[#c4a574] px-3 text-xs font-semibold text-[#1a1410] transition hover:brightness-110"
            >
              Join
            </button>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-white/40 uppercase">
            Legal
          </p>
          <ul className="mt-4 space-y-2.5 text-[13px] text-white/65">
            {["Privacy Policy", "Terms & Conditions", "Cookie Policy"].map(
              (item) => (
                <li key={item}>
                  <a href="/#contact" className="transition hover:text-white">
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-white/40 uppercase">
            Main Menu
          </p>
          <ul className="mt-4 space-y-2.5 text-[13px] text-white/65">
            {[
              ["/", "Home"],
              ["/courses", "Courses"],
              ["/#about", "About Us"],
              ["/#contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/auth/login" className="transition hover:text-white">
                Staff Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] text-white/40 uppercase">
            Social Media
          </p>
          <ul className="mt-4 space-y-2.5 text-[13px] text-white/65">
            {["Instagram", "Facebook", "LinkedIn", "YouTube"].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
        <p className="text-[11px] text-white/35">
          © {new Date().getFullYear()} {content.brandName}. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold tracking-wide text-white/40 uppercase">
          {["eSewa", "Khalti", "Fonepay", "ConnectIPS", "Visa", "Mastercard"].map(
            (p) => (
              <span key={p} className="rounded border border-white/15 px-2 py-1">
                {p}
              </span>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
