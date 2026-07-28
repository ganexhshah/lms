"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "sonner";

import {
  fadeUp,
  scaleIn,
  stagger,
  viewportOnce,
} from "@/components/landing/landing-motion";
import { fetchPublicCourses } from "@/lib/api/public";
import { getLandingCourses } from "@/lib/landing-courses";
import { useLandingContentStore } from "@/store/landing-content-store";
import type { Course } from "@/types/course";

export function LandingSections() {
  const content = useLandingContentStore((s) => s.content);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicCourses()
      .then((list) => {
        if (!cancelled) setCourses(list);
      })
      .catch(() => {
        if (!cancelled) setCourses([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const landingCourses = useMemo(
    () => getLandingCourses(courses, content),
    [courses, content]
  );

  const filters = useMemo(() => {
    const tags = Array.from(new Set(landingCourses.map((c) => c.tag)));
    return [...tags, "View All Courses"] as string[];
  }, [landingCourses]);

  const [filter, setFilter] = useState<string>("View All Courses");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const activeFilter =
    filters.includes(filter) ? filter : "View All Courses";

  const visibleCourses = useMemo(() => {
    if (activeFilter === "View All Courses") return landingCourses;
    return landingCourses.filter((c) => c.tag === activeFilter);
  }, [landingCourses, activeFilter]);

  const aboutParagraphs = content.aboutBody
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill name, email, and message");
      return;
    }
    toast.success("Message sent", {
      description: "Our team will get back to you shortly.",
    });
    setForm({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <>
      <section id="about" className="bg-white px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid gap-4"
          >
            <motion.div
              variants={scaleIn}
              className="relative aspect-[4/3] overflow-hidden rounded-[2px]"
            >
              <Image
                src={content.aboutImage1}
                alt="Academy training"
                fill
                className="object-cover transition duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
            <motion.div
              variants={scaleIn}
              className="relative aspect-[16/10] overflow-hidden rounded-[2px]"
            >
              <Image
                src={content.aboutImage2}
                alt="Brewing setup"
                fill
                className="object-cover transition duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-col justify-center"
          >
            <motion.h2
              variants={fadeUp}
              className="text-[clamp(1.65rem,3.4vw,2.45rem)] leading-[1.1] font-extrabold tracking-tight text-[#1a1a1a] uppercase"
            >
              {content.aboutTitle}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 inline-block border-b border-[#4b3621] pb-0.5 text-[11px] font-bold tracking-[0.18em] text-[#4b3621] uppercase"
            >
              {content.aboutSubtitle}
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-6 space-y-4 text-[13.5px] leading-[1.75] text-[#5a524a] sm:text-sm"
            >
              {aboutParagraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section
        id="events"
        className="border-y border-[#ebe4d8] bg-[#f7f3ec] px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <motion.h2
              variants={fadeUp}
              className="text-[clamp(1.55rem,3.2vw,2.25rem)] font-extrabold tracking-tight text-[#1a1a1a] uppercase"
            >
              {content.eventsTitle}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-3 text-[11px] font-bold tracking-[0.18em] text-[#4b3621] uppercase"
            >
              {content.eventsSubtitle}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-lg text-sm leading-relaxed text-[#5c534c]"
            >
              {content.eventsBody}
            </motion.p>
            <motion.a
              variants={fadeUp}
              href="#contact"
              className="mt-7 inline-flex rounded-[4px] bg-[#4b3621] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#3a2918]"
            >
              Learn More
            </motion.a>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid grid-cols-2 gap-3"
          >
            <motion.div
              variants={scaleIn}
              className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-[2px] sm:col-span-1 sm:row-span-2 sm:aspect-auto sm:h-full sm:min-h-[280px]"
            >
              <Image
                src="/landing/landing-event-latte.png"
                alt="Latte art"
                fill
                className="object-cover transition duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </motion.div>
            <motion.div
              variants={scaleIn}
              className="relative aspect-square overflow-hidden rounded-[2px]"
            >
              <Image
                src="/landing/landing-event-pour.png"
                alt="Milk pour"
                fill
                className="object-cover transition duration-700 hover:scale-105"
                sizes="200px"
              />
            </motion.div>
            <motion.div
              variants={scaleIn}
              className="relative aspect-square overflow-hidden rounded-[2px]"
            >
              <Image
                src="/landing/landing-course-roast.png"
                alt="Coffee beans"
                fill
                className="object-cover transition duration-700 hover:scale-105"
                sizes="200px"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="courses" className="bg-[#efe8dc] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              className="text-[11px] font-semibold tracking-[0.18em] text-[#4b3621]/75 uppercase"
            >
              {content.coursesSectionEyebrow}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-2 text-[clamp(1.5rem,3.2vw,2.2rem)] font-extrabold tracking-tight text-[#1a1a1a] uppercase"
            >
              {content.coursesSectionTitle}
            </motion.h2>
          </motion.div>

          {filters.length > 1 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
            >
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-[4px] border px-3.5 py-1.5 text-[12px] font-semibold transition duration-200 ${
                    activeFilter === f
                      ? "border-[#4b3621] bg-[#4b3621] text-white"
                      : "border-[#4b3621]/25 bg-transparent text-[#4b3621] hover:border-[#4b3621]/55"
                  }`}
                >
                  {f}
                </button>
              ))}
            </motion.div>
          ) : null}

          <motion.div
            key={activeFilter}
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visibleCourses.map((c) => (
              <motion.article
                key={c.id}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
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
                  <h3 className="mt-1 text-[15px] font-bold text-[#1a1a1a]">
                    <Link
                      href={`/courses/${c.id}`}
                      className="transition hover:text-[#4b3621]"
                    >
                      {c.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-[12px] text-[#6b625a]">
                    By {c.instructor}
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
              </motion.article>
            ))}
          </motion.div>

          {visibleCourses.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[#6b625a]">
              No courses featured yet. Enable them in Dashboard → Landing page.
            </p>
          ) : (
            <div className="mt-10 text-center">
              <Link
                href="/courses"
                className="inline-flex rounded-[4px] border border-[#4b3621] px-5 py-2.5 text-[13px] font-semibold text-[#4b3621] transition hover:bg-[#4b3621] hover:text-white"
              >
                View all courses
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="text-center text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold tracking-tight text-[#1a1a1a] uppercase"
          >
            What student say?
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 grid gap-5 md:grid-cols-3"
          >
            {content.testimonials.map((t) => (
              <motion.blockquote
                key={t.id}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="rounded-[2px] border border-[#ebe5da] bg-[#fbfaf7] p-6 shadow-[0_10px_28px_rgba(45,27,20,0.05)]"
              >
                <p className="text-[12px] font-extrabold tracking-[0.14em] text-[#1a1a1a] uppercase">
                  {t.company}
                </p>
                <p className="mt-4 text-[13px] leading-relaxed text-[#4a433c]">
                  “{t.quote}”
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#4b3621] text-[11px] font-bold text-white">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-[#6b625a]">{t.role}</p>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="contact" className="bg-[#f7f3ec] px-4 py-16 sm:px-6 sm:py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold tracking-tight text-[#1a1a1a] uppercase"
          >
            {content.contactTitle}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-sm text-[#5c534c]">
            {content.contactSubtext}
          </motion.p>
        </motion.div>

        <motion.form
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          onSubmit={onSubmit}
          className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2"
        >
          <div className="space-y-4">
            {(
              [
                ["name", "Full Name", "text"],
                ["email", "Email", "email"],
                ["phone", "Telephone Number", "text"],
              ] as const
            ).map(([key, placeholder, type]) => (
              <input
                key={key}
                type={type}
                className="h-11 w-full rounded-[4px] border border-[#ddd5c6] bg-white px-3 text-sm outline-none transition focus:border-[#4b3621] focus:ring-2 focus:ring-[#4b3621]/10"
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
              />
            ))}
          </div>
          <textarea
            className="min-h-[168px] w-full rounded-[4px] border border-[#ddd5c6] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#4b3621] focus:ring-2 focus:ring-[#4b3621]/10 md:min-h-full"
            placeholder="Messages"
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
          />
          <div className="flex justify-center pt-2 md:col-span-2">
            <button
              type="submit"
              className="rounded-[4px] bg-[#4b3621] px-10 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a2918]"
            >
              Send Message
            </button>
          </div>
        </motion.form>
      </section>
    </>
  );
}
