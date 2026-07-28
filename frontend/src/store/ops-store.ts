"use client";

import { create } from "zustand";

import { api } from "@/lib/api/client";
import * as attendanceApi from "@/lib/api/attendance";
import * as batchesApi from "@/lib/api/batches";
import * as certificatesApi from "@/lib/api/certificates";
import * as communicationApi from "@/lib/api/communication";
import * as examsApi from "@/lib/api/exams";
import * as inventoryApi from "@/lib/api/inventory";
import * as learningApi from "@/lib/api/learning";
import * as notificationsApi from "@/lib/api/notifications";
import * as paymentsApi from "@/lib/api/payments";
import * as placementApi from "@/lib/api/placement";
import * as timetableApi from "@/lib/api/timetable";
import * as trainersApi from "@/lib/api/trainers";
import { getApiErrorMessage } from "@/lib/api/utils";
import type {
  AdminProfile,
  Announcement,
  AppNotification,
  AttendanceMark,
  AttendanceSession,
  BatchRecord,
  CertificateRecord,
  EmployerRecord,
  ExamGrade,
  ExamRecord,
  InventoryItem,
  LearningItem,
  PaymentInvoice,
  PlacementRecord,
  RatingEvent,
  SalaryEntry,
  TimetableSlot,
  TrainerRecord,
  TrainerScheduleSlot,
} from "@/types/ops";

function normalizeBatch(b: BatchRecord): BatchRecord {
  return {
    ...b,
    courseId: b.courseId ?? "",
    trainerId: b.trainerId ?? "",
    trainer: b.trainer ?? "",
    room: b.room ?? "",
    studentIds: b.studentIds ?? [],
    transfers: (b.transfers ?? []).map((t) => ({
      ...t,
      toBatchName: t.toBatchName ?? "",
      studentName: t.studentName ?? "",
      note: t.note ?? "",
    })),
    enrolled: (b.studentIds ?? []).length || b.enrolled || 0,
  };
}

function normalizeAttendance(a: AttendanceSession): AttendanceSession {
  return { ...a, batchId: a.batchId ?? "", records: a.records ?? [] };
}

function normalizePayment(p: PaymentInvoice): PaymentInvoice {
  return {
    ...p,
    studentId: p.studentId ?? "",
    reminders: p.reminders ?? [],
    receipts: p.receipts ?? [],
  };
}

function normalizeExam(e: ExamRecord): ExamRecord {
  return { ...e, batchId: e.batchId ?? "", grades: e.grades ?? [] };
}

function normalizeCert(c: CertificateRecord): CertificateRecord {
  return {
    ...c,
    studentId: c.studentId ?? "",
    verifyLog: c.verifyLog ?? [],
    issuedAt: c.issuedAt ?? "",
  };
}

function normalizeInventory(i: InventoryItem): InventoryItem {
  return {
    ...i,
    purchases: i.purchases ?? [],
    usage: i.usage ?? [],
    lastPurchase: i.lastPurchase ?? "",
  };
}

function normalizeTrainer(t: TrainerRecord): TrainerRecord {
  return {
    ...t,
    scheduleSlots: t.scheduleSlots ?? [],
    salaryHistory: t.salaryHistory ?? [],
    ratingHistory: t.ratingHistory ?? [],
  };
}

function normalizeLearning(l: LearningItem): LearningItem {
  return { ...l, url: l.url ?? "", description: l.description ?? "" };
}

function normalizePlacement(p: PlacementRecord): PlacementRecord {
  return {
    ...p,
    studentId: p.studentId ?? "",
    employerId: p.employerId ?? "",
    cvName: p.cvName ?? null,
  };
}

function normalizeAnnouncement(a: Announcement): Announcement {
  return {
    ...a,
    audience: a.audience ?? "all",
    audienceId: a.audienceId ?? null,
    audienceLabel: a.audienceLabel ?? "All",
    deliveryLog: a.deliveryLog ?? [],
  };
}

function normalizeSlot(s: TimetableSlot): TimetableSlot {
  return {
    ...s,
    batchId: s.batchId ?? "",
    trainerId: s.trainerId ?? "",
    room: s.room ?? "",
  };
}

const emptyProfile: AdminProfile = {
  name: "",
  email: "",
  phone: "",
  role: "",
  institution: "",
  notifyFees: true,
  notifyStock: true,
  notifyAbsences: true,
};

function mapUserToProfile(user: Record<string, unknown>): AdminProfile {
  return {
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    phone: String(user.phone ?? ""),
    role: String(user.role ?? ""),
    institution: String(user.institution ?? ""),
    notifyFees: Boolean(user.notify_fees ?? user.notifyFees ?? true),
    notifyStock: Boolean(user.notify_stock ?? user.notifyStock ?? true),
    notifyAbsences: Boolean(
      user.notify_absences ?? user.notifyAbsences ?? true
    ),
  };
}

function replaceById<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [item, ...list];
  const next = list.slice();
  next[idx] = item;
  return next;
}

function findConflict(
  slots: TimetableSlot[],
  candidate: Omit<TimetableSlot, "id">,
  excludeId?: string
): string | null {
  const clash = slots.find((s) => {
    if (excludeId && s.id === excludeId) return false;
    if (s.day !== candidate.day || s.time !== candidate.time) return false;
    if (s.trainerId && candidate.trainerId && s.trainerId === candidate.trainerId) {
      return true;
    }
    if (s.room && candidate.room && s.room === candidate.room) return true;
    if (s.batchId && candidate.batchId && s.batchId === candidate.batchId) {
      return true;
    }
    return false;
  });
  if (!clash) return null;
  return `Conflicts with ${clash.course} (${clash.batch} · ${clash.room})`;
}

type OpsState = {
  batches: BatchRecord[];
  attendance: AttendanceSession[];
  trainers: TrainerRecord[];
  payments: PaymentInvoice[];
  exams: ExamRecord[];
  certificates: CertificateRecord[];
  inventory: InventoryItem[];
  timetable: TimetableSlot[];
  learning: LearningItem[];
  placement: PlacementRecord[];
  employers: EmployerRecord[];
  announcements: Announcement[];
  notifications: AppNotification[];
  profile: AdminProfile;
  loading: boolean;
  loaded: boolean;
  error: string | null;

  load: () => Promise<void>;

  updateBatch: (id: string, patch: Partial<BatchRecord>) => Promise<BatchRecord>;
  addBatch: (
    batch: Omit<BatchRecord, "id" | "studentIds" | "transfers" | "enrolled"> & {
      studentIds?: string[];
    }
  ) => Promise<BatchRecord>;
  enrollStudentInBatch: (
    batchId: string,
    studentId: string,
    studentName?: string
  ) => Promise<boolean>;
  removeStudentFromBatch: (batchId: string, studentId: string) => Promise<void>;
  transferStudent: (
    studentId: string,
    studentName: string,
    fromBatchId: string,
    toBatchId: string,
    note?: string
  ) => Promise<boolean>;

  markAttendance: (input: {
    date: string;
    batchId: string;
    method: AttendanceSession["method"];
    records: AttendanceMark[];
  }) => Promise<AttendanceSession | null>;
  notifyAbsences: (sessionId: string) => Promise<void>;

  addTrainer: (
    data: Omit<
      TrainerRecord,
      "id" | "scheduleSlots" | "salaryHistory" | "ratingHistory" | "rating"
    > & { rating?: number }
  ) => Promise<TrainerRecord>;
  updateTrainer: (
    id: string,
    patch: Partial<TrainerRecord>
  ) => Promise<TrainerRecord>;
  addTrainerScheduleSlot: (
    trainerId: string,
    slot: Omit<TrainerScheduleSlot, "id">
  ) => Promise<void>;
  removeTrainerScheduleSlot: (
    trainerId: string,
    slotId: string
  ) => Promise<void>;
  addSalaryEntry: (
    trainerId: string,
    entry: Omit<SalaryEntry, "id">
  ) => Promise<void>;
  addRatingEvent: (
    trainerId: string,
    entry: Omit<RatingEvent, "id">
  ) => Promise<void>;

  createInvoice: (data: {
    studentId: string;
    student: string;
    course: string;
    amount: number;
    dueDate: string;
    discount?: number;
  }) => Promise<PaymentInvoice>;
  updatePayment: (
    id: string,
    patch: Partial<PaymentInvoice>
  ) => Promise<PaymentInvoice>;
  recordPayment: (id: string, amount: number) => Promise<void>;
  refundPayment: (id: string) => Promise<void>;
  sendPaymentReminder: (
    id: string,
    channel: PaymentInvoice["reminders"][0]["channel"]
  ) => Promise<void>;
  logReceiptDownload: (id: string) => Promise<void>;

  addExam: (
    data: Omit<ExamRecord, "id" | "grades" | "status">
  ) => Promise<ExamRecord>;
  updateExam: (id: string, patch: Partial<ExamRecord>) => Promise<ExamRecord>;
  saveExamGrades: (id: string, grades: ExamGrade[]) => Promise<void>;

  issueCertificate: (id: string) => Promise<void>;
  createCertificate: (data: {
    studentId: string;
    student: string;
    course: string;
    number?: string;
    issuedAt?: string;
    pdfUrl?: string | null;
    editUrl?: string | null;
  }) => Promise<CertificateRecord>;
  updateCertificate: (
    id: string,
    patch: Partial<
      Pick<
        CertificateRecord,
        | "number"
        | "student"
        | "studentId"
        | "course"
        | "issuedAt"
        | "status"
        | "pdfUrl"
        | "editUrl"
      >
    >
  ) => Promise<void>;
  verifyCertificate: (number: string) => CertificateRecord | null;
  logCertVerify: (id: string, result: "valid" | "invalid") => void;

  addInventoryItem: (
    data: Omit<
      InventoryItem,
      "id" | "purchases" | "usage" | "lastPurchase" | "stock"
    > & { stock?: number }
  ) => Promise<InventoryItem>;
  updateInventory: (
    id: string,
    patch: Partial<InventoryItem>
  ) => Promise<InventoryItem>;
  restock: (
    id: string,
    qty: number,
    unitCost?: number,
    note?: string
  ) => Promise<void>;
  logInventoryUsage: (
    id: string,
    qty: number,
    batch: string,
    note?: string
  ) => Promise<void>;

  addTimetableSlot: (slot: Omit<TimetableSlot, "id">) => Promise<{
    ok: boolean;
    conflict?: string;
    slot?: TimetableSlot;
  }>;
  updateTimetableSlot: (
    id: string,
    patch: Partial<TimetableSlot>
  ) => Promise<{ ok: boolean; conflict?: string }>;
  removeTimetableSlot: (id: string) => Promise<void>;

  addLearning: (data: Omit<LearningItem, "id">) => Promise<LearningItem>;
  updateLearning: (
    id: string,
    patch: Partial<LearningItem>
  ) => Promise<LearningItem>;
  removeLearning: (id: string) => Promise<void>;

  addEmployer: (data: Omit<EmployerRecord, "id">) => Promise<EmployerRecord>;
  updateEmployer: (
    id: string,
    patch: Partial<EmployerRecord>
  ) => Promise<EmployerRecord>;
  addPlacement: (
    data: Omit<PlacementRecord, "id">
  ) => Promise<PlacementRecord>;
  updatePlacement: (
    id: string,
    patch: Partial<PlacementRecord>
  ) => Promise<PlacementRecord>;

  addAnnouncement: (data: {
    channel: Announcement["channel"];
    title: string;
    body: string;
    audience: Announcement["audience"];
    audienceId: string | null;
    audienceLabel: string;
  }) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  pushNotification: (
    data: Omit<AppNotification, "id" | "read">
  ) => Promise<void>;

  updateProfile: (patch: Partial<AdminProfile>) => void;
  saveProfile: () => Promise<void>;
};

export const useOpsStore = create<OpsState>((set, get) => ({
  batches: [],
  attendance: [],
  trainers: [],
  payments: [],
  exams: [],
  certificates: [],
  inventory: [],
  timetable: [],
  learning: [],
  placement: [],
  employers: [],
  announcements: [],
  notifications: [],
  profile: emptyProfile,
  loading: false,
  loaded: false,
  error: null,

  load: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const [
        batches,
        attendance,
        trainers,
        payments,
        exams,
        certificates,
        inventory,
        timetable,
        learning,
        placement,
        employers,
        announcements,
        notifications,
        meRes,
      ] = await Promise.all([
        batchesApi.fetchBatches(),
        attendanceApi.fetchAttendanceSessions(),
        trainersApi.fetchTrainers(),
        paymentsApi.fetchInvoices(),
        examsApi.fetchExams(),
        certificatesApi.fetchCertificates(),
        inventoryApi.fetchInventoryItems(),
        timetableApi.fetchTimetableSlots(),
        learningApi.fetchLearningItems(),
        placementApi.fetchPlacements(),
        placementApi.fetchEmployers(),
        communicationApi.fetchAnnouncements(),
        notificationsApi.fetchNotifications(),
        api.get("/auth/me").catch(() => null),
      ]);

      const profile = meRes?.data?.user
        ? mapUserToProfile(meRes.data.user as Record<string, unknown>)
        : get().profile;

      set({
        batches: batches.map(normalizeBatch),
        attendance: attendance.map(normalizeAttendance),
        trainers: trainers.map(normalizeTrainer),
        payments: payments.map(normalizePayment),
        exams: exams.map(normalizeExam),
        certificates: certificates.map(normalizeCert),
        inventory: inventory.map(normalizeInventory),
        timetable: timetable.map(normalizeSlot),
        learning: learning.map(normalizeLearning),
        placement: placement.map(normalizePlacement),
        employers,
        announcements: announcements.map(normalizeAnnouncement),
        notifications,
        profile,
        loading: false,
        loaded: true,
      });
    } catch (e) {
      set({
        loading: false,
        loaded: true,
        error: getApiErrorMessage(e, "Failed to load operations data"),
      });
    }
  },

  updateBatch: async (id, patch) => {
    const updated = normalizeBatch(await batchesApi.updateBatch(id, patch));
    set((s) => ({ batches: replaceById(s.batches, updated) }));
    return updated;
  },

  addBatch: async (batch) => {
    const created = normalizeBatch(
      await batchesApi.createBatch({
        name: batch.name,
        course: batch.course,
        courseId: batch.courseId || null,
        shift: batch.shift,
        capacity: batch.capacity,
        startDate: batch.startDate,
        endDate: batch.endDate,
        progress: batch.progress,
        trainer: batch.trainer || null,
        trainerId: batch.trainerId || null,
        room: batch.room || null,
        status: batch.status,
      })
    );
    set((s) => ({ batches: [created, ...s.batches] }));
    return created;
  },

  enrollStudentInBatch: async (batchId, studentId) => {
    try {
      const updated = normalizeBatch(
        await batchesApi.enrollStudentInBatch(batchId, studentId)
      );
      set((s) => ({ batches: replaceById(s.batches, updated) }));
      return true;
    } catch {
      return false;
    }
  },

  removeStudentFromBatch: async (batchId, studentId) => {
    const updated = normalizeBatch(
      await batchesApi.removeStudentFromBatch(batchId, studentId)
    );
    set((s) => ({ batches: replaceById(s.batches, updated) }));
  },

  transferStudent: async (
    studentId,
    _studentName,
    fromBatchId,
    toBatchId,
    note
  ) => {
    try {
      const fromUpdated = normalizeBatch(
        await batchesApi.transferStudent(fromBatchId, {
          studentId,
          toBatchId,
          note,
        })
      );
      const toUpdated = normalizeBatch(await batchesApi.fetchBatch(toBatchId));
      set((s) => ({
        batches: s.batches.map((b) => {
          if (b.id === fromUpdated.id) return fromUpdated;
          if (b.id === toUpdated.id) return toUpdated;
          return b;
        }),
      }));
      return true;
    } catch {
      return false;
    }
  },

  markAttendance: async ({ date, batchId, method, records }) => {
    const batch = get().batches.find((b) => b.id === batchId);
    if (!batch) return null;
    const created = normalizeAttendance(
      await attendanceApi.createAttendanceSession({
        date,
        batch: batch.name,
        batchId,
        course: batch.course,
        method,
        records,
      })
    );
    set((s) => ({ attendance: [created, ...s.attendance] }));
    return created;
  },

  notifyAbsences: async (sessionId) => {
    const session = get().attendance.find((a) => a.id === sessionId);
    if (!session) return;
    const absentNames = session.records
      .filter((r) => r.status === "absent")
      .map((r) => r.studentName)
      .join(", ");
    await get().addAnnouncement({
      channel: "sms",
      title: `Absence notice — ${session.batch}`,
      body: `Absent on ${session.date}: ${absentNames || "n/a"}`,
      audience: "batch",
      audienceId: session.batchId,
      audienceLabel: session.batch,
    });
    await get().pushNotification({
      title: `Absences notified — ${session.batch}`,
      body: absentNames || "No absences",
      time: "Just now",
      href: "/dashboard/attendance",
    });
    const updated = normalizeAttendance(
      await attendanceApi.updateAttendanceSession(sessionId, {
        notifiedAt: new Date().toISOString(),
      })
    );
    set((s) => ({
      attendance: replaceById(s.attendance, updated),
    }));
  },

  addTrainer: async (data) => {
    const created = normalizeTrainer(
      await trainersApi.createTrainer({
        name: data.name,
        email: data.email,
        phone: data.phone,
        specialty: data.specialty,
        status: data.status,
        salary: data.salary,
        rating: data.rating ?? 4.5,
        schedule: data.schedule,
      })
    );
    set((s) => ({ trainers: [created, ...s.trainers] }));
    return created;
  },

  updateTrainer: async (id, patch) => {
    const updated = normalizeTrainer(
      await trainersApi.updateTrainer(id, {
        name: patch.name,
        email: patch.email,
        phone: patch.phone,
        specialty: patch.specialty,
        status: patch.status,
        salary: patch.salary,
        rating: patch.rating,
        schedule: patch.schedule,
      })
    );
    set((s) => ({ trainers: replaceById(s.trainers, updated) }));
    return updated;
  },

  addTrainerScheduleSlot: async (trainerId, slot) => {
    await trainersApi.addTrainerScheduleSlot(trainerId, slot);
    const trainer = normalizeTrainer(
      await trainersApi.fetchTrainer(trainerId)
    );
    set((s) => ({ trainers: replaceById(s.trainers, trainer) }));
  },

  removeTrainerScheduleSlot: async (trainerId, slotId) => {
    await trainersApi.removeTrainerScheduleSlot(trainerId, slotId);
    const trainer = normalizeTrainer(
      await trainersApi.fetchTrainer(trainerId)
    );
    set((s) => ({ trainers: replaceById(s.trainers, trainer) }));
  },

  addSalaryEntry: async (trainerId, entry) => {
    await trainersApi.addTrainerSalary(trainerId, entry);
    const trainer = normalizeTrainer(
      await trainersApi.fetchTrainer(trainerId)
    );
    set((s) => ({ trainers: replaceById(s.trainers, trainer) }));
  },

  addRatingEvent: async (trainerId, entry) => {
    await trainersApi.addTrainerRating(trainerId, entry);
    const trainer = normalizeTrainer(
      await trainersApi.fetchTrainer(trainerId)
    );
    set((s) => ({ trainers: replaceById(s.trainers, trainer) }));
  },

  createInvoice: async (data) => {
    const amount = Math.max(0, data.amount - (data.discount ?? 0));
    const today = new Date().toISOString().slice(0, 10);
    const status: PaymentInvoice["status"] =
      data.dueDate >= today ? "partial" : "overdue";
    const inv = normalizePayment(
      await paymentsApi.createInvoice({
        student: data.student,
        studentId: data.studentId || null,
        course: data.course,
        amount,
        paid: 0,
        dueDate: data.dueDate,
        status,
        discount: data.discount ?? 0,
      })
    );
    set((s) => ({ payments: [inv, ...s.payments] }));
    return inv;
  },

  updatePayment: async (id, patch) => {
    const updated = normalizePayment(
      await paymentsApi.updateInvoice(id, {
        student: patch.student,
        studentId: patch.studentId,
        course: patch.course,
        amount: patch.amount,
        paid: patch.paid,
        dueDate: patch.dueDate,
        status: patch.status,
        discount: patch.discount,
        number: patch.number,
      })
    );
    set((s) => ({ payments: replaceById(s.payments, updated) }));
    return updated;
  },

  recordPayment: async (id, amount) => {
    const inv = get().payments.find((p) => p.id === id);
    if (!inv) return;
    const paid = Math.min(inv.amount, inv.paid + amount);
    await get().updatePayment(id, {
      paid,
      status: paid >= inv.amount ? "paid" : "partial",
    });
  },

  refundPayment: async (id) => {
    await get().updatePayment(id, { status: "refunded", paid: 0 });
  },

  sendPaymentReminder: async (id, channel) => {
    const updated = normalizePayment(
      await paymentsApi.sendInvoiceReminder(id, channel)
    );
    set((s) => ({ payments: replaceById(s.payments, updated) }));
    const inv = updated;
    await get().pushNotification({
      title: `Reminder sent — ${inv.number}`,
      body: `${inv.student} via ${channel}`,
      time: "Just now",
      href: `/dashboard/payments/${id}`,
    });
  },

  logReceiptDownload: async (id) => {
    const inv = get().payments.find((p) => p.id === id);
    if (!inv) return;
    const updated = normalizePayment(
      await paymentsApi.logInvoiceReceipt(id, inv.paid)
    );
    set((s) => ({ payments: replaceById(s.payments, updated) }));
  },

  addExam: async (data) => {
    const exam = normalizeExam(
      await examsApi.createExam({
        title: data.title,
        course: data.course,
        batch: data.batch,
        batchId: data.batchId || null,
        type: data.type,
        date: data.date,
        passMark: data.passMark,
        status: "scheduled",
      })
    );
    set((s) => ({ exams: [exam, ...s.exams] }));
    return exam;
  },

  updateExam: async (id, patch) => {
    const exam = normalizeExam(
      await examsApi.updateExam(id, {
        title: patch.title,
        course: patch.course,
        batch: patch.batch,
        batchId: patch.batchId,
        type: patch.type,
        date: patch.date,
        passMark: patch.passMark,
        status: patch.status,
      })
    );
    set((s) => ({ exams: replaceById(s.exams, exam) }));
    return exam;
  },

  saveExamGrades: async (id, grades) => {
    const exam = normalizeExam(await examsApi.updateExamGrades(id, grades));
    set((s) => ({ exams: replaceById(s.exams, exam) }));
  },

  issueCertificate: async (id) => {
    const cert = get().certificates.find((c) => c.id === id);
    if (!cert) return;
    const updated = normalizeCert(
      await certificatesApi.updateCertificate(id, {
        status: "issued",
        issuedAt: new Date().toISOString().slice(0, 10),
        number:
          cert.number ||
          `CERT-${new Date().getFullYear()}-${String(
            Math.floor(Math.random() * 900) + 100
          )}`,
      })
    );
    set((s) => ({
      certificates: replaceById(s.certificates, {
        ...updated,
        pdfUrl: cert.pdfUrl,
        editUrl: cert.editUrl,
      }),
    }));
  },

  createCertificate: async (data) => {
    const created = normalizeCert(
      await certificatesApi.createCertificate({
        student: data.student,
        studentId: data.studentId || null,
        course: data.course,
        number: data.number,
        issuedAt: data.issuedAt ?? new Date().toISOString().slice(0, 10),
        status: "issued",
      })
    );
    const withLocal: CertificateRecord = {
      ...created,
      pdfUrl: data.pdfUrl ?? null,
      editUrl: data.editUrl ?? null,
    };
    set((s) => ({ certificates: [withLocal, ...s.certificates] }));
    return withLocal;
  },

  updateCertificate: async (id, patch) => {
    const current = get().certificates.find((c) => c.id === id);
    const { pdfUrl, editUrl, ...apiPatch } = patch;
    let updated = current;
    if (Object.keys(apiPatch).length > 0) {
      updated = normalizeCert(
        await certificatesApi.updateCertificate(id, apiPatch)
      );
    }
    const merged: CertificateRecord = {
      ...(updated ?? current!),
      pdfUrl: pdfUrl !== undefined ? pdfUrl : (current?.pdfUrl ?? null),
      editUrl: editUrl !== undefined ? editUrl : (current?.editUrl ?? null),
    };
    set((s) => ({ certificates: replaceById(s.certificates, merged) }));
  },

  verifyCertificate: (number) => {
    const cert = get().certificates.find(
      (c) => c.number.toLowerCase() === number.trim().toLowerCase()
    );
    if (cert) {
      get().logCertVerify(
        cert.id,
        cert.status === "issued" ? "valid" : "invalid"
      );
    }
    return cert ?? null;
  },

  logCertVerify: (id, result) =>
    set((s) => ({
      certificates: s.certificates.map((c) =>
        c.id === id
          ? {
              ...c,
              verifyLog: [
                {
                  id: crypto.randomUUID(),
                  verifiedAt: new Date().toISOString().slice(0, 10),
                  result,
                },
                ...c.verifyLog,
              ],
            }
          : c
      ),
    })),

  addInventoryItem: async (data) => {
    const item = normalizeInventory(
      await inventoryApi.createInventoryItem({
        name: data.name,
        category: data.category,
        unit: data.unit,
        minStock: data.minStock,
        stock: data.stock ?? 0,
      })
    );
    set((s) => ({ inventory: [item, ...s.inventory] }));
    return item;
  },

  updateInventory: async (id, patch) => {
    const item = normalizeInventory(
      await inventoryApi.updateInventoryItem(id, {
        name: patch.name,
        category: patch.category,
        stock: patch.stock,
        unit: patch.unit,
        minStock: patch.minStock,
        lastPurchase: patch.lastPurchase,
      })
    );
    set((s) => ({ inventory: replaceById(s.inventory, item) }));
    return item;
  },

  restock: async (id, qty, unitCost = 0, note = "Purchase") => {
    const item = normalizeInventory(
      await inventoryApi.restockInventoryItem(id, {
        date: new Date().toISOString().slice(0, 10),
        qty,
        unitCost,
        note,
      })
    );
    set((s) => ({ inventory: replaceById(s.inventory, item) }));
  },

  logInventoryUsage: async (id, qty, batch, note = "") => {
    const item = normalizeInventory(
      await inventoryApi.logInventoryUsage(id, {
        date: new Date().toISOString().slice(0, 10),
        qty,
        batch,
        note,
      })
    );
    set((s) => ({ inventory: replaceById(s.inventory, item) }));
  },

  addTimetableSlot: async (slot) => {
    const conflict = findConflict(get().timetable, slot);
    if (conflict) return { ok: false, conflict };
    try {
      const created = normalizeSlot(
        await timetableApi.createTimetableSlot({
          day: slot.day,
          time: slot.time,
          course: slot.course,
          batch: slot.batch,
          batchId: slot.batchId || null,
          trainer: slot.trainer,
          trainerId: slot.trainerId || null,
          room: slot.room || "",
        })
      );
      set((s) => ({ timetable: [...s.timetable, created] }));
      return { ok: true, slot: created };
    } catch (e) {
      return { ok: false, conflict: getApiErrorMessage(e, "Could not add slot") };
    }
  },

  updateTimetableSlot: async (id, patch) => {
    const current = get().timetable.find((s) => s.id === id);
    if (!current) return { ok: false, conflict: "Not found" };
    const next = { ...current, ...patch };
    const conflict = findConflict(get().timetable, next, id);
    if (conflict) return { ok: false, conflict };
    try {
      const updated = normalizeSlot(
        await timetableApi.updateTimetableSlot(id, {
          day: next.day,
          time: next.time,
          course: next.course,
          batch: next.batch,
          batchId: next.batchId || null,
          trainer: next.trainer,
          trainerId: next.trainerId || null,
          room: next.room,
        })
      );
      set((s) => ({
        timetable: s.timetable.map((t) => (t.id === id ? updated : t)),
      }));
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        conflict: getApiErrorMessage(e, "Could not update slot"),
      };
    }
  },

  removeTimetableSlot: async (id) => {
    await timetableApi.deleteTimetableSlot(id);
    set((s) => ({ timetable: s.timetable.filter((t) => t.id !== id) }));
  },

  addLearning: async (data) => {
    const item = normalizeLearning(
      await learningApi.createLearningItem(data)
    );
    set((s) => ({ learning: [item, ...s.learning] }));
    return item;
  },

  updateLearning: async (id, patch) => {
    const item = normalizeLearning(
      await learningApi.updateLearningItem(id, patch)
    );
    set((s) => ({ learning: replaceById(s.learning, item) }));
    return item;
  },

  removeLearning: async (id) => {
    await learningApi.deleteLearningItem(id);
    set((s) => ({ learning: s.learning.filter((l) => l.id !== id) }));
  },

  addEmployer: async (data) => {
    const emp = await placementApi.createEmployer(data);
    set((s) => ({ employers: [emp, ...s.employers] }));
    return emp;
  },

  updateEmployer: async (id, patch) => {
    const emp = await placementApi.updateEmployer(id, patch);
    set((s) => ({ employers: replaceById(s.employers, emp) }));
    return emp;
  },

  addPlacement: async (data) => {
    const rec = normalizePlacement(
      await placementApi.createPlacement({
        student: data.student,
        studentId: data.studentId || null,
        employer: data.employer,
        employerId: data.employerId || null,
        role: data.role,
        interviewDate: data.interviewDate || null,
        status: data.status,
        cvName: data.cvName,
      })
    );
    set((s) => ({ placement: [rec, ...s.placement] }));
    return rec;
  },

  updatePlacement: async (id, patch) => {
    const rec = normalizePlacement(
      await placementApi.updatePlacement(id, {
        student: patch.student,
        studentId: patch.studentId,
        employer: patch.employer,
        employerId: patch.employerId,
        role: patch.role,
        interviewDate: patch.interviewDate,
        status: patch.status,
        cvName: patch.cvName,
      })
    );
    set((s) => ({ placement: replaceById(s.placement, rec) }));
    return rec;
  },

  addAnnouncement: async (data) => {
    const ann = normalizeAnnouncement(
      await communicationApi.createAnnouncement(data)
    );
    set((s) => ({ announcements: [ann, ...s.announcements] }));
  },

  markNotificationRead: async (id) => {
    const n = await notificationsApi.markNotificationRead(id);
    set((s) => ({ notifications: replaceById(s.notifications, n) }));
  },

  markAllNotificationsRead: async () => {
    const notifications = await notificationsApi.markAllNotificationsRead();
    set({ notifications });
  },

  pushNotification: async (data) => {
    const n = await notificationsApi.createNotification({
      title: data.title,
      body: data.body,
      href: data.href,
    });
    set((s) => ({ notifications: [n, ...s.notifications] }));
  },

  updateProfile: (patch) =>
    set((s) => ({ profile: { ...s.profile, ...patch } })),

  saveProfile: async () => {
    const p = get().profile;
    const res = await api.patch("/auth/profile", {
      name: p.name,
      email: p.email,
      phone: p.phone,
      role: p.role,
      institution: p.institution,
      notify_fees: p.notifyFees,
      notify_stock: p.notifyStock,
      notify_absences: p.notifyAbsences,
    });
    if (res.data?.user) {
      set({ profile: mapUserToProfile(res.data.user) });
    }
  },
}));
