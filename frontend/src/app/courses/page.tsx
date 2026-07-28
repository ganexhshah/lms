"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

import { PublicSiteShell } from "@/components/landing/public-site-shell";
import { fetchPublicCourses, fetchPublicLanding } from "@/lib/api/public";
import { getAllPublicCourses } from "@/lib/landing-courses";
import type { Course } from "@/types/course";
import {
  defaultLandingContent,
  type LandingContent,
} from "@/types/landing";

export default function PublicCoursesPage() {
  const [content, setContent] = useState<LandingContent>(defaultLandingContent);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [landing, list] = await Promise.all([
          fetchPublicLanding(),
          fetchPublicCourses(),
        ]);
        if (cancelled) return;
        setContent({ ...defaultLandingContent, ...landing });
        setCourses(list);
      } catch {
        if (!cancelled) {
          setContent(defaultLandingContent);
          setCourses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const all = useMemo(
    () => getAllPublicCourses(courses, content),
    [courses, content]
  );

  const tags = useMemo(() => {
    const t = Array.from(new Set(all.map((c) => c.tag)));
    return ["All", ...t];
  }, [all]);

  const [filter, setFilter] = useState("All");
  const visible =
    filter === "All" ? all : all.filter((c) => c.tag === filter);

  return (
    <PublicSiteShell>
      <section className="bg-[#f4efe6] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#4b3621] uppercase">
            Coffee courses
          </p>
          <h1 className="mt-2 text-[clamp(1.75rem,4vw,2.6rem)] font-extrabold tracking-tight text-[#1a1a1a] uppercase">
            All courses
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[#5c534c]">
            Browse active academy programs. Fees shown in NPR.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={`rounded-[4px] border px-3.5 py-1.5 text-[12px] font-semibold transition ${
                  filter === t
                    ? "border-[#4b3621] bg-[#4b3621] text-white"
                    : "border-[#4b3621]/25 text-[#4b3621] hover:border-[#4b3621]/55"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="mt-12 text-center text-sm text-[#6b625a]">
              Loading courses…
            </p>
          ) : (
            <>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((c) => (
                  <article
                    key={c.id}
                    className="overflow-hidden rounded-[2px] bg-white shadow-[0_8px_30px_rgba(45,27,20,0.06)]"
                  >
                    <Link href={`/courses/${c.id}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={c.image}
                          alt={c.title}
                          fill
                          className="object-cover transition duration-500 hover:scale-105"
                          sizes="(max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </Link>
                    <div className="p-5">
                      <div className="flex items-center gap-1 text-[#c4a574]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3 ${i < Math.round(c.rating) ? "fill-current" : "opacity-25"}`}
                          />
                        ))}
                        <span className="ml-1 text-[11px] font-semibold text-[#6a625a]">
                          {c.rating}
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] font-bold tracking-[0.14em] text-[#4b3621] uppercase">
                        {c.tag}
                      </p>
                      <h2 className="mt-1 text-[15px] font-bold text-[#1a1a1a]">
                        <Link href={`/courses/${c.id}`}>{c.title}</Link>
                      </h2>
                      <p className="mt-1 line-clamp-2 text-[12px] text-[#6b625a]">
                        {c.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-lg font-extrabold text-[#4b3621]">
                          {c.price}
                        </span>
                        <Link
                          href={`/courses/${c.id}`}
                          className="rounded-[4px] bg-[#4b3621] px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#3a2918]"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {visible.length === 0 ? (
                <p className="mt-12 text-center text-sm text-[#6b625a]">
                  No active courses available right now.
                </p>
              ) : null}
            </>
          )}
        </div>
      </section>
    </PublicSiteShell>
  );
}
