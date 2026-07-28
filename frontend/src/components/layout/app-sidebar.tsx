"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronRight } from "lucide-react";

import { homeNav, navigation, accountNav } from "@/config/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

function pathOnly(href: string) {
  return href.split("?")[0].split("#")[0];
}

function isPathActive(pathname: string, href: string) {
  const base = pathOnly(href);
  if (base === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const HomeIcon = homeNav.icon!;

  async function handleLogout() {
    await logout();
    router.replace("/auth/login");
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              tooltip="Vellum LMS"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <BookOpen className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Vellum LMS</span>
                <span className="truncate text-xs text-muted-foreground">
                  Admin console
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isPathActive(pathname, homeNav.href)}
                  tooltip={homeNav.title}
                  render={<Link href={homeNav.href} />}
                >
                  <HomeIcon />
                  <span>{homeNav.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((group) => {
                const groupActive = isPathActive(pathname, group.href);
                const Icon = group.icon;

                if (group.items.length === 0) {
                  return (
                    <SidebarMenuItem key={group.title}>
                      <SidebarMenuButton
                        isActive={groupActive}
                        tooltip={group.title}
                        render={<Link href={group.href} />}
                      >
                        <Icon />
                        <span>{group.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible
                    key={group.title}
                    defaultOpen={groupActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton
                            tooltip={group.title}
                            isActive={groupActive}
                          />
                        }
                      >
                        <Icon />
                        <span>{group.title}</span>
                        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items.map((item) => (
                            <SidebarMenuSubItem key={item.href}>
                              <SidebarMenuSubButton
                                isActive={pathname === pathOnly(item.href)}
                                render={<Link href={item.href} />}
                              >
                                <span>{item.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {accountNav.map((item) => {
            const Icon = item.icon!;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  size="sm"
                  isActive={isPathActive(pathname, item.href)}
                  tooltip={item.title}
                  render={<Link href={item.href} />}
                >
                  <Icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <SidebarMenuItem>
            <SidebarMenuButton
              size="sm"
              className="text-muted-foreground"
              onClick={handleLogout}
            >
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
