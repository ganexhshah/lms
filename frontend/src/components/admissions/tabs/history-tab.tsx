"use client";

import { History } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import type { AdmissionApplication } from "@/types/admission";

type HistoryTabProps = {
  application: AdmissionApplication;
};

export function AdmissionHistoryTab({ application }: HistoryTabProps) {
  if (!application.history.length) {
    return (
      <EmptyState
        icon={History}
        title="No history yet"
        description="Status changes and updates will appear here."
      />
    );
  }

  return (
    <ol className="relative space-y-0">
      {application.history.map((event, index) => {
        const date = new Date(event.date);
        return (
          <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
            {index < application.history.length - 1 ? (
              <span className="absolute top-8 bottom-0 left-[15px] w-px bg-border" />
            ) : null}
            <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <History className="size-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">{event.title}</p>
                <time className="text-xs text-muted-foreground tabular-nums">
                  {date.toLocaleString()}
                </time>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
