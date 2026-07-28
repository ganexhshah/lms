import Link from "next/link";

import type { QuickAction } from "@/data/dashboard-mock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/dashboard/section-header";

type QuickActionsProps = {
  items: QuickAction[];
};

export function QuickActions({ items }: QuickActionsProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <SectionHeader
          title="Quick actions"
          description="Common admin tasks"
        />
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="outline"
              size="sm"
              className="gap-2"
              nativeButton={false}
              render={<Link href={item.href} />}
            >
              <Icon data-icon="inline-start" />
              {item.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
