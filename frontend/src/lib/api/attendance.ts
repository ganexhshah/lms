import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type { AttendanceMark, AttendanceSession } from "@/types/ops";

export type AttendanceListParams = {
  batch_id?: string;
  date?: string;
};

export type AttendanceCreateInput = {
  date: string;
  batch: string;
  batchId?: string | null;
  course: string;
  method: AttendanceSession["method"];
  records?: AttendanceMark[];
};

export async function fetchAttendanceSessions(
  params?: AttendanceListParams
): Promise<AttendanceSession[]> {
  const res = await api.get("/attendance/sessions", { params });
  return unwrapList<AttendanceSession>(res.data);
}

export async function fetchAttendanceSession(
  id: string
): Promise<AttendanceSession> {
  const res = await api.get(`/attendance/sessions/${id}`);
  return unwrapItem<AttendanceSession>(res.data);
}

export async function createAttendanceSession(
  input: AttendanceCreateInput
): Promise<AttendanceSession> {
  const res = await api.post("/attendance/sessions", input);
  return unwrapItem<AttendanceSession>(res.data);
}

export async function updateAttendanceSession(
  id: string,
  patch: Partial<{
    date: string;
    batch: string;
    batchId: string | null;
    course: string;
    method: AttendanceSession["method"];
    notifiedAt: string | null;
  }>
): Promise<AttendanceSession> {
  const res = await api.patch(`/attendance/sessions/${id}`, patch);
  return unwrapItem<AttendanceSession>(res.data);
}

export async function markAttendanceRecords(
  sessionId: string,
  records: AttendanceMark[]
): Promise<AttendanceSession> {
  const res = await api.put(`/attendance/sessions/${sessionId}/records`, {
    records,
  });
  return unwrapItem<AttendanceSession>(res.data);
}
