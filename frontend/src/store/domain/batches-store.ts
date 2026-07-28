"use client";

/**
 * Domain facade over useOpsStore — batches slice.
 * Prefer importing from here in new batch-related UI.
 */
export { useOpsStore as useBatchesStore } from "@/store/ops-store";
