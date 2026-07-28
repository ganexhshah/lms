/**
 * Laravel wraps JsonResource / JsonResource::collection responses as `{ data: ... }`.
 * These helpers normalize either the wrapped or unwrapped shape so callers don't
 * need to think about it.
 */
export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as Record<string, unknown>).data)
  ) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export function unwrapItem<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>)
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function getApiErrorMessage(error: unknown, fallback = "Request failed") {
  if (!error || typeof error !== "object") return fallback;
  const ax = error as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } };
    message?: string;
  };
  const data = ax.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (first?.[0]) return first[0];
  }
  if (data?.message) return data.message;
  if (ax.message) return ax.message;
  return fallback;
}
