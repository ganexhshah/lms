"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SearchField } from "@/components/shared/search-field";
import { HistoryTimeline } from "@/components/students/history-timeline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HistoryEvent, Student } from "@/types/student";

const CATEGORIES: Array<HistoryEvent["category"] | "all"> = [
  "all",
  "registration",
  "profile",
  "photo",
  "emergency",
  "id_card",
  "document",
  "batch",
  "attendance",
  "payment",
  "other",
];

type HistoryTabProps = {
  student: Student;
};

export function HistoryTab({ student }: HistoryTabProps) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [query, setQuery] = useState("");

  const events = useMemo(() => {
    return student.history.filter((event) => {
      const matchesCategory =
        category === "all" || event.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || `${event.title} ${event.detail}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [student.history, category, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={category}
          onValueChange={(v) =>
            v && setCategory(v as (typeof CATEGORIES)[number])
          }
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All categories" : c.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Filter events…"
          className="sm:max-w-xs"
        />
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={History}
          title="No matching events"
          description="Try clearing filters or pick another category."
        />
      ) : (
        <HistoryTimeline events={events} />
      )}
    </div>
  );
}
