"use client";

import {
  Award,
  Camera,
  ClipboardList,
  CreditCard,
  FileText,
  HeartPulse,
  History,
  UserPlus,
} from "lucide-react";

import type { HistoryEvent } from "@/types/student";
import { cn } from "@/lib/utils";

const categoryIcon = {
  registration: UserPlus,
  profile: ClipboardList,
  photo: Camera,
  emergency: HeartPulse,
  id_card: CreditCard,
  document: FileText,
  batch: Award,
  attendance: ClipboardList,
  payment: Award,
  other: History,
} as const;

type HistoryTimelineProps = {
  events: HistoryEvent[];
  className?: string;
};

export function HistoryTimeline({ events, className }: HistoryTimelineProps) {
  if (!events.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No history events yet
      </p>
    );
  }

  return (
    <ol className={cn("relative space-y-0", className)}>
      {events.map((event, index) => {
        const Icon = categoryIcon[event.category] ?? History;
        const date = new Date(event.date);
        return (
          <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
            {index < events.length - 1 ? (
              <span className="absolute top-8 bottom-0 left-[15px] w-px bg-border" />
            ) : null}
            <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">{event.title}</p>
                <time className="text-xs text-muted-foreground tabular-nums">
                  {date.toLocaleString()}
                </time>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{event.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
