"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Layers, Star, User } from "lucide-react";

import { PublicSiteShell } from "@/components/landing/public-site-shell";
import { fetchPublicCourse } from "@/lib/api/public";
import { toPublicCourseCard } from "@/lib/landing-courses";
import { useLandingContentStore } from "@/store/landing-content-store";
import type { Course } from "@/types/course";
import type { PublicCourseCard } from "@/lib/landing-courses";

export default function PublicCourseDetailPage() {
  const params = useParams();
  const id = String(params.id || "");
  const content = useLandingContentStore((s) => s.content);
  const [card, setCard] = useState<PublicCourseCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    void fetchPublicCourse(id)
      .then((course: Course) => {
        if (cancelled) return;
        setCard(toPublicCourseCard(course, content, 0));
      })
      .catch(() => {
        if (!cancelled) {
          setCard(null);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, content]);

  if (loading) {
    return (
      <PublicSiteShell>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm text-[#5c534c]">Loading course…</p>
        </section>
      </PublicSiteShell>
    );
  }

  if (notFound || !card) {
    return (
      <PublicSiteShell>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h1 className="text-2xl font-extrabold uppercase text-[#1a1a1a]">
            Course not found
          </h1>
          <p className="mt-3 text-sm text-[#5c534c]">
            This course is inactive or does not exist.
          </p>
          <Link
            href="/courses"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#4b3621]"
          >
            <ArrowLeft className="size-4" /> Back to courses
          </Link>
        </section>
      </PublicSiteShell>
    );
  }

  const { course } = card;

  return (
    <PublicSiteShell>
      <section className="bg-[#f4efe6] px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#4b3621]"
          >
            <ArrowLeft className="size-4" /> All courses
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-[#4b3621] uppercase">
                {card.tag}
              </p>
              <h1 className="mt-2 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold tracking-tight text-[#1a1a1a] uppercase">
                {card.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-[#5c534c]">
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-3.5" /> {card.instructor}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {card.durationWeeks} weeks ·{" "}
                  {card.durationHours} hrs
                </span>
                <span className="inline-flex items-center gap-1.5 capitalize">
                  <Layers className="size-3.5" /> {card.level}
                </span>
                <span className="inline-flex items-center gap-1 text-[#c4a574]">
                  <Star className="size-3.5 fill-current" />
                  <span className="font-semibold text-[#6a625a]">
                    {card.rating}
                  </span>
                </span>
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#5a524a]">
                {card.description}
              </p>

              {course.discountNotes ? (
                <p className="mt-4 text-sm font-medium text-[#4b3621]">
                  {course.discountNotes}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-end gap-5">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-[#6b625a] uppercase">
                    Fee
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-[#4b3621]">
                    {card.price}
                  </p>
                  {course.installments > 1 ? (
                    <p className="mt-1 text-xs text-[#6b625a]">
                      Up to {course.installments} installments
                    </p>
                  ) : null}
                </div>
                <Link
                  href="/auth/login"
                  className="rounded-[4px] bg-[#4b3621] px-6 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#3a2918]"
                >
                  Enroll / Login
                </Link>
                <a
                  href="/#contact"
                  className="rounded-[4px] border border-[#4b3621] px-6 py-2.5 text-[13px] font-semibold text-[#4b3621] transition hover:bg-[#4b3621] hover:text-white"
                >
                  Ask a question
                </a>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-[#e8dfd0] shadow-[0_16px_40px_rgba(45,27,20,0.1)]">
              <Image
                src={card.image}
                alt={card.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#1a1a1a] uppercase">
              Syllabus
            </h2>
            {course.syllabus.length === 0 ? (
              <p className="mt-4 text-sm text-[#6b625a]">
                Syllabus details coming soon.
              </p>
            ) : (
              <ul className="mt-6 space-y-4">
                {course.syllabus.map((item, i) => (
                  <li
                    key={item.id}
                    className="border-b border-[#ebe5da] pb-4 last:border-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-[#1a1a1a]">
                        <span className="mr-2 text-[#4b3621]/50">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {item.title}
                      </p>
                      <span className="text-xs font-semibold text-[#6b625a]">
                        {item.hours} hrs
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] text-[#5c534c]">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#1a1a1a] uppercase">
              Trainers
            </h2>
            <ul className="mt-6 space-y-3">
              {course.trainers.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 border border-[#ebe5da] bg-[#fbfaf7] px-4 py-3"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#4b3621] text-[11px] font-bold text-white">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-[#6b625a]">{t.role}</p>
                  </div>
                </li>
              ))}
            </ul>

            {course.materials.length > 0 ? (
              <div className="mt-10">
                <h2 className="text-xl font-extrabold tracking-tight text-[#1a1a1a] uppercase">
                  Materials
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-[#5c534c]">
                  {course.materials.map((m) => (
                    <li key={m.id}>
                      {m.name}{" "}
                      <span className="text-xs text-[#8a8078]">
                        ({m.sizeLabel})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </PublicSiteShell>
  );
}
