"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

import { accountNav, homeNav, navigation } from "@/config/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useOpsStore } from "@/store/ops-store";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

const DETAIL_CRUMBS: Array<{
  pattern: RegExp;
  parent: string;
  parentHref: string;
  label: string;
}> = [
  { pattern: /^\/dashboard\/students\/([^/]+)$/, parent: "Students", parentHref: "/dashboard/students", label: "Profile" },
  { pattern: /^\/dashboard\/admissions\/([^/]+)$/, parent: "Admissions", parentHref: "/dashboard/admissions", label: "Application" },
  { pattern: /^\/dashboard\/courses\/([^/]+)$/, parent: "Courses", parentHref: "/dashboard/courses", label: "Course" },
  { pattern: /^\/dashboard\/batches\/([^/]+)$/, parent: "Batches", parentHref: "/dashboard/batches", label: "Batch" },
  { pattern: /^\/dashboard\/trainers\/([^/]+)$/, parent: "Trainers", parentHref: "/dashboard/trainers", label: "Trainer" },
  { pattern: /^\/dashboard\/payments\/([^/]+)$/, parent: "Payments", parentHref: "/dashboard/payments", label: "Invoice" },
  { pattern: /^\/dashboard\/exams\/([^/]+)$/, parent: "Exams", parentHref: "/dashboard/exams", label: "Exam" },
];

function useBreadcrumbs(pathname: string) {
  if (pathname === "/dashboard") {
    return [{ label: "Home", href: "/dashboard", current: true }];
  }

  for (const rule of DETAIL_CRUMBS) {
    if (rule.pattern.test(pathname)) {
      return [
        { label: "Home", href: "/dashboard", current: false },
        { label: rule.parent, href: rule.parentHref, current: false },
        { label: rule.label, href: pathname, current: true },
      ];
    }
  }

  for (const item of accountNav) {
    if (pathname === item.href) {
      return [
        { label: "Home", href: "/dashboard", current: false },
        { label: item.title, href: item.href, current: true },
      ];
    }
  }

  for (const group of navigation) {
    if (pathname === group.href || pathname.startsWith(`${group.href}/`)) {
      return [
        { label: "Home", href: "/dashboard", current: false },
        { label: group.title, href: group.href, current: true },
      ];
    }
  }

  return [{ label: homeNav.title, href: homeNav.href, current: true }];
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = useBreadcrumbs(pathname);
  const notifications = useOpsStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const initials = (user?.name || "AD")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    await logout();
    router.replace("/auth/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb className="hidden min-w-0 md:block">
        <BreadcrumbList>
          {crumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.label}-${crumb.href}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {crumb.current ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden w-56 lg:block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students, batches…"
            className="h-8 pl-8"
            aria-label="Search"
          />
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label="Notifications"
          nativeButton={false}
          render={<Link href="/dashboard/notifications" />}
        >
          <Bell className="size-4" />
          {unread > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 size-4 justify-center rounded-full p-0 text-[10px]"
            >
              {unread}
            </Badge>
          ) : null}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="gap-2 px-1.5" />
            }
          >
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">
              {user?.name?.split(" ")[0] || "Admin"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/dashboard/notifications" />}>
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
