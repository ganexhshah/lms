"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Bell } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOpsStore } from "@/store/ops-store";

export default function NotificationsPage() {
  const notifications = useOpsStore((s) => s.notifications);
  const markNotificationRead = useOpsStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useOpsStore((s) => s.markAllNotificationsRead);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unread} unread · stock, fees, admissions, and more.`}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              markAllNotificationsRead();
              toast.success("All marked as read");
            }}
          >
            Mark all read
          </Button>
        }
      />
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`shadow-none ${n.read ? "opacity-70" : "border-foreground/20"}`}
            >
              <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
                </div>
                <div className="flex gap-2">
                  {!n.read ? (
                    <Button size="xs" variant="outline" onClick={() => markNotificationRead(n.id)}>
                      Mark read
                    </Button>
                  ) : null}
                  {n.href ? (
                    <Button size="xs" nativeButton={false} render={<Link href={n.href} />}>
                      Open
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
