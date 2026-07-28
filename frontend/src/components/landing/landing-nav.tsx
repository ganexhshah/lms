"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";

import { useLandingContentStore } from "@/store/landing-content-store";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Coffee courses" },
  { href: "/#events", label: "Roasting events" },
  { href: "/#about", label: "About Us" },
  { href: "/#contact", label: "Contact" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const brandName = useLandingContentStore((s) => s.content.brandName);
  const home = pathname === "/";

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 bg-[#3d2918] text-white"
    >
      <div className="mx-auto flex h-[58px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-[12px] font-bold tracking-[0.16em] uppercase sm:text-[13px]"
        >
          {brandName}
        </Link>

        <nav className="hidden items-center gap-7 text-[12.5px] font-medium tracking-wide lg:flex">
          {links.map((l) => {
            const href =
              home && l.href.startsWith("/#")
                ? l.href.slice(1)
                : l.href === "/" && home
                  ? "#home"
                  : l.href;
            const Comp = href.startsWith("#") ? "a" : Link;
            return (
              <Comp
                key={l.label}
                href={href}
                className="text-white/80 transition duration-200 hover:text-white"
              >
                {l.label}
              </Comp>
            );
          })}
        </nav>

        <div className="flex items-center gap-3.5">
          <button
            type="button"
            className="hidden text-white/75 transition hover:text-white sm:inline-flex"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            className="hidden text-white/75 transition hover:text-white sm:inline-flex"
            aria-label="Cart"
          >
            <ShoppingBag className="size-4" />
          </button>
          <Link
            href="/auth/login"
            className="inline-flex size-7 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            aria-label="Account"
          >
            <User className="size-3.5" />
          </Link>
          <button
            type="button"
            className="inline-flex text-white lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#3d2918] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-1 text-white/85"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </motion.header>
  );
}
