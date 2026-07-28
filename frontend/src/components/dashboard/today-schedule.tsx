import type { ScheduleItem } from "@/data/dashboard-mock";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/dashboard/section-header";

type TodayScheduleProps = {
  items: ScheduleItem[];
};

export function TodaySchedule({ items }: TodayScheduleProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <SectionHeader
          title="Today's classes"
          description="Timetable for active labs"
          actionLabel="Full timetable"
          actionHref="/dashboard/timetable"
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
        ) : (
          items.map((item) => (
          <div
            key={item.id}
            className="grid gap-1 rounded-lg border px-3 py-2.5 sm:grid-cols-[8.5rem_1fr_auto]"
          >
            <p className="text-xs font-medium text-muted-foreground tabular-nums">
              {item.time}
            </p>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.course}</p>
              <p className="truncate text-xs text-muted-foreground">
                {item.batch} · {item.trainer}
              </p>
            </div>
            <p className="text-xs text-muted-foreground sm:text-right">{item.room}</p>
          </div>
        ))
        )}
      </CardContent>
    </Card>
  );
}
