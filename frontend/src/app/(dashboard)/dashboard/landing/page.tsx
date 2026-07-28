"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { SoftBadge } from "@/components/shared/soft-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatNpr, useLandingContentStore } from "@/store/landing-content-store";
import { useCoursesStore } from "@/store/courses-store";
import { levelToTag } from "@/lib/landing-courses";

export default function LandingAdminPage() {
  const content = useLandingContentStore((s) => s.content);
  const updateContent = useLandingContentStore((s) => s.updateContent);
  const setMiniCourses = useLandingContentStore((s) => s.setMiniCourses);
  const setTestimonials = useLandingContentStore((s) => s.setTestimonials);
  const setFeaturedCourseIds = useLandingContentStore(
    (s) => s.setFeaturedCourseIds
  );
  const setCourseMeta = useLandingContentStore((s) => s.setCourseMeta);
  const resetContent = useLandingContentStore((s) => s.resetContent);
  const courses = useCoursesStore((s) => s.courses);

  const activeCourses = useMemo(
    () => courses.filter((c) => c.status === "active"),
    [courses]
  );

  const [draft, setDraft] = useState(content);

  function syncDraft() {
    setDraft(useLandingContentStore.getState().content);
  }

  function saveGeneral() {
    updateContent({
      brandName: draft.brandName,
      heroEyebrow: draft.heroEyebrow,
      heroHeadline: draft.heroHeadline,
      heroSubtext: draft.heroSubtext,
      discountBadge: draft.discountBadge,
      aboutTitle: draft.aboutTitle,
      aboutSubtitle: draft.aboutSubtitle,
      aboutBody: draft.aboutBody,
      aboutImage1: draft.aboutImage1,
      aboutImage2: draft.aboutImage2,
      eventsTitle: draft.eventsTitle,
      eventsSubtitle: draft.eventsSubtitle,
      eventsBody: draft.eventsBody,
      coursesSectionEyebrow: draft.coursesSectionEyebrow,
      coursesSectionTitle: draft.coursesSectionTitle,
      contactTitle: draft.contactTitle,
      contactSubtext: draft.contactSubtext,
      footerBlurb: draft.footerBlurb,
    });
    toast.success("Landing content saved");
  }

  function toggleFeatured(id: string, on: boolean) {
    const current = content.featuredCourseIds;
    const next = on
      ? current.includes(id)
        ? current
        : [...current, id]
      : current.filter((x) => x !== id);
    setFeaturedCourseIds(next);
    setCourseMeta(id, {
      showOnLanding: on,
      tag: content.courseMeta[id]?.tag || levelToTag(
        courses.find((c) => c.id === id)?.level || "beginner"
      ),
      coverImage:
        content.courseMeta[id]?.coverImage ||
        "/landing/landing-course-barista.png",
      rating: content.courseMeta[id]?.rating ?? 4.8,
    });
    toast.success(on ? "Course shown on landing" : "Course hidden from landing");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landing page"
        description="Manage public website copy, featured courses, and course cards shown on the landing page."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/" target="_blank" rel="noreferrer" />}
            >
              <ExternalLink /> View site
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetContent();
                syncDraft();
                toast.success("Reset to defaults");
              }}
            >
              Reset
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="hero">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="mini">Quick courses</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-4 space-y-4">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Hero section</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["brandName", "Brand name"],
                  ["heroEyebrow", "Eyebrow"],
                  ["heroHeadline", "Headline"],
                  ["discountBadge", "Discount badge"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Subtext</Label>
                <Textarea
                  rows={3}
                  value={draft.heroSubtext}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, heroSubtext: e.target.value }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Button size="sm" onClick={saveGeneral}>
                  Save hero & shared text
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-4">
          <Card className="shadow-none">
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={draft.aboutTitle}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, aboutTitle: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Subtitle</Label>
                <Input
                  value={draft.aboutSubtitle}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, aboutSubtitle: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Body (paragraphs separated by blank line)</Label>
                <Textarea
                  rows={8}
                  value={draft.aboutBody}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, aboutBody: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Image 1 URL</Label>
                <Input
                  value={draft.aboutImage1}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, aboutImage1: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Image 2 URL</Label>
                <Input
                  value={draft.aboutImage2}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, aboutImage2: e.target.value }))
                  }
                />
              </div>
              <div>
                <Button size="sm" onClick={saveGeneral}>
                  Save about
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <Card className="shadow-none">
            <CardContent className="grid gap-3 pt-6">
              <div className="space-y-1.5">
                <Label className="text-xs">Title</Label>
                <Input
                  value={draft.eventsTitle}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, eventsTitle: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Subtitle</Label>
                <Input
                  value={draft.eventsSubtitle}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, eventsSubtitle: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Body</Label>
                <Textarea
                  rows={4}
                  value={draft.eventsBody}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, eventsBody: e.target.value }))
                  }
                />
              </div>
              <Button size="sm" onClick={saveGeneral}>
                Save events
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-4 space-y-4">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-base">
                Featured courses on landing
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Section eyebrow</Label>
                <Input
                  value={draft.coursesSectionEyebrow}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      coursesSectionEyebrow: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Section title</Label>
                <Input
                  value={draft.coursesSectionTitle}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      coursesSectionTitle: e.target.value,
                    }))
                  }
                />
              </div>
              <Button size="sm" onClick={saveGeneral}>
                Save section titles
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {activeCourses.map((c) => {
              const meta = content.courseMeta[c.id];
              const on =
                meta?.showOnLanding === true ||
                content.featuredCourseIds.includes(c.id);
              return (
                <Card key={c.id} className="shadow-none">
                  <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{c.title}</p>
                        <SoftBadge>{c.level}</SoftBadge>
                        <SoftBadge>{formatNpr(c.fee)}</SoftBadge>
                      </div>
                      <p className="text-muted-foreground max-w-xl text-xs">
                        {c.description}
                      </p>
                      <Link
                        href={`/courses/${c.id}`}
                        className="text-xs text-[#4b3621] underline-offset-2 hover:underline"
                        target="_blank"
                      >
                        Public page → /courses/{c.id}
                      </Link>
                    </div>
                    <div className="flex min-w-[240px] flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={on}
                          onCheckedChange={(v) =>
                            toggleFeatured(c.id, Boolean(v))
                          }
                        />
                        Show on landing
                      </label>
                      <Input
                        placeholder="Cover image URL"
                        value={meta?.coverImage || ""}
                        onChange={(e) =>
                          setCourseMeta(c.id, { coverImage: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Tag (e.g. Barista course)"
                        value={meta?.tag || ""}
                        onChange={(e) =>
                          setCourseMeta(c.id, { tag: e.target.value })
                        }
                      />
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Rating"
                        value={meta?.rating ?? 4.8}
                        onChange={(e) =>
                          setCourseMeta(c.id, {
                            rating: Number(e.target.value) || 4.8,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {activeCourses.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No active courses. Activate courses under Dashboard → Courses.
              </p>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="mini" className="mt-4 space-y-3">
          {content.miniCourses.map((m, idx) => (
            <Card key={m.id} className="shadow-none">
              <CardContent className="grid gap-2 pt-5 sm:grid-cols-2">
                {(
                  [
                    ["label", "Label"],
                    ["days", "Days"],
                    ["price", "Price"],
                    ["was", "Was price"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      value={m[key]}
                      onChange={(e) => {
                        const next = [...content.miniCourses];
                        next[idx] = { ...m, [key]: e.target.value };
                        setMiniCourses(next);
                      }}
                    />
                  </div>
                ))}
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Blurb</Label>
                  <Textarea
                    rows={2}
                    value={m.blurb}
                    onChange={(e) => {
                      const next = [...content.miniCourses];
                      next[idx] = { ...m, blurb: e.target.value };
                      setMiniCourses(next);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-muted-foreground text-xs">
            Changes save instantly.
          </p>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-4 space-y-3">
          {content.testimonials.map((t, idx) => (
            <Card key={t.id} className="shadow-none">
              <CardContent className="grid gap-2 pt-5 sm:grid-cols-2">
                <Input
                  placeholder="Name"
                  value={t.name}
                  onChange={(e) => {
                    const next = [...content.testimonials];
                    next[idx] = { ...t, name: e.target.value };
                    setTestimonials(next);
                  }}
                />
                <Input
                  placeholder="Role"
                  value={t.role}
                  onChange={(e) => {
                    const next = [...content.testimonials];
                    next[idx] = { ...t, role: e.target.value };
                    setTestimonials(next);
                  }}
                />
                <Input
                  placeholder="Company"
                  value={t.company}
                  onChange={(e) => {
                    const next = [...content.testimonials];
                    next[idx] = { ...t, company: e.target.value };
                    setTestimonials(next);
                  }}
                />
                <Textarea
                  className="sm:col-span-2"
                  rows={2}
                  placeholder="Quote"
                  value={t.quote}
                  onChange={(e) => {
                    const next = [...content.testimonials];
                    next[idx] = { ...t, quote: e.target.value };
                    setTestimonials(next);
                  }}
                />
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() =>
                    setTestimonials(
                      content.testimonials.filter((x) => x.id !== t.id)
                    )
                  }
                >
                  <Trash2 /> Remove
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setTestimonials([
                ...content.testimonials,
                {
                  id: `t-${Date.now()}`,
                  name: "New student",
                  role: "Graduate",
                  company: "Partner",
                  quote: "Great training experience.",
                },
              ])
            }
          >
            <Plus /> Add testimonial
          </Button>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <Card className="shadow-none">
            <CardContent className="grid gap-3 pt-6">
              <div className="space-y-1.5">
                <Label className="text-xs">Contact title</Label>
                <Input
                  value={draft.contactTitle}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, contactTitle: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Contact subtext</Label>
                <Textarea
                  rows={2}
                  value={draft.contactSubtext}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, contactSubtext: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Footer blurb</Label>
                <Textarea
                  rows={2}
                  value={draft.footerBlurb}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, footerBlurb: e.target.value }))
                  }
                />
              </div>
              <Button size="sm" onClick={saveGeneral}>
                Save contact & footer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
