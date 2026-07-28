"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Play } from "lucide-react";
import { useRef } from "react";

import { easeOut } from "@/components/landing/landing-motion";
import { useLandingContentStore } from "@/store/landing-content-store";

export function LandingHero() {
  const content = useLandingContentStore((s) => s.content);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);

  const badgeLines = content.discountBadge.split(/\s+/);
  const badgeTop = badgeLines[0] || "40%";
  const badgeBottom = badgeLines.slice(1).join(" ") || "Discount";

  return (
    <section
      ref={ref}
      id="home"
      className="relative overflow-x-clip bg-[#f4efe6]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(90deg, #f3eee6 0%, #f3eee6 52%, #e4d8c6 52%, #e4d8c6 100%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-start gap-8 px-4 pt-12 pb-6 sm:px-6 sm:pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-2 lg:pb-0">
        <div className="relative z-20 pt-2 lg:pt-8">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="text-[11px] font-semibold tracking-[0.28em] text-[#4b3621] uppercase"
          >
            {content.heroEyebrow}
            <span className="ml-2 tracking-[0.4em] text-[#4b3621]/50">···</span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: easeOut }}
            className="mt-4 max-w-[15ch] text-[clamp(2.35rem,5.4vw,3.75rem)] leading-[0.98] font-extrabold tracking-[-0.02em] text-[#1a1a1a] uppercase"
          >
            {content.heroHeadline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: easeOut }}
            className="mt-5 max-w-[26rem] text-[13px] leading-relaxed text-[#5a524a] sm:text-sm"
          >
            {content.heroSubtext}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24, ease: easeOut }}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-[4px] bg-[#4b3621] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition duration-200 hover:bg-[#3a2918] hover:shadow-md"
            >
              Contact Us
            </a>
            <Link
              href="/auth/login"
              className="group inline-flex items-center gap-2.5 text-[13px] font-semibold text-[#1a1a1a]"
            >
              <span className="flex size-8 items-center justify-center rounded-full border border-[#4b3621]/35 transition duration-200 group-hover:border-[#4b3621] group-hover:bg-[#4b3621]/5">
                <Play className="size-3.5 fill-[#4b3621] text-[#4b3621]" />
              </span>
              Watch Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.34, ease: easeOut }}
            id="quick-courses"
            className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-8"
          >
            {content.miniCourses.map((c) => (
              <div key={c.id} className="relative pl-0 sm:pl-5">
                <p
                  className="pointer-events-none absolute top-1 left-0 hidden text-[9px] font-bold tracking-[0.22em] text-[#4b3621]/40 uppercase sm:block"
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  {c.label}
                </p>
                <p className="text-[10px] font-bold tracking-[0.18em] text-[#4b3621] uppercase sm:hidden">
                  {c.label}
                </p>
                <p className="mt-1 text-[1.65rem] font-extrabold tracking-tight text-[#1a1a1a] sm:mt-0">
                  {c.days}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-[#6a625a]">
                  {c.blurb}
                </p>
                <p className="mt-3 text-sm font-bold text-[#4b3621]">
                  {c.price}{" "}
                  <span className="ml-1 font-medium text-[#c45c4a] line-through decoration-[#c45c4a]">
                    {c.was}
                  </span>
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10 flex min-h-[340px] items-center justify-center lg:min-h-[560px]">
          <motion.div
            style={{ y: imageY, scale: imageScale }}
            className="relative w-full max-w-[540px]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: easeOut }}
              className="relative aspect-square w-full"
            >
              <Image
                src="/landing/landing-hero-pour-cutout.png"
                alt="Coffee pouring from pitcher into glass"
                fill
                priority
                className="object-contain object-center drop-shadow-[0_20px_40px_rgba(45,27,20,0.18)]"
                sizes="(max-width: 1024px) 90vw, 540px"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.55, delay: 0.55, ease: easeOut }}
              className="absolute top-[6%] right-[0%] z-20 flex size-[4.75rem] items-center justify-center bg-[#121820] text-center text-[10px] leading-tight font-bold tracking-wide text-white uppercase sm:right-[4%] sm:size-[5.4rem] sm:text-[11px]"
              style={{
                clipPath:
                  "polygon(50% 0%, 61% 7%, 75% 3%, 80% 16%, 94% 20%, 89% 34%, 100% 50%, 89% 66%, 94% 80%, 80% 84%, 75% 97%, 61% 93%, 50% 100%, 39% 93%, 25% 97%, 20% 84%, 6% 80%, 11% 66%, 0% 50%, 11% 34%, 6% 20%, 20% 16%, 25% 3%, 39% 7%)",
              }}
            >
              {badgeTop}
              <br />
              {badgeBottom}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-20 mx-auto mb-8 flex w-fit flex-col items-center gap-1.5 text-[#4b3621]"
      >
        <motion.span
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex size-10 items-center justify-center rounded-full bg-[#4b3621] text-white shadow-md"
        >
          <ChevronDown className="size-5" />
        </motion.span>
        <span className="text-[10px] font-semibold tracking-[0.22em] uppercase">
          Scroll Down
        </span>
      </motion.a>
    </section>
  );
}
