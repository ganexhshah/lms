/** Shared LMS ops domain types (API-backed) */

export type BatchTransfer = {
  id: string;
  studentId: string;
  studentName: string;
  fromBatchId: string;
  toBatchId: string;
  toBatchName: string;
  date: string;
  note: string;
};

export type BatchRecord = {
  id: string;
  name: string;
  course: string;
  courseId: string;
  shift: "morning" | "evening";
  capacity: number;
  enrolled: number;
  startDate: string;
  endDate: string;
  progress: number;
  trainer: string;
  trainerId: string;
  room: string;
  status: "upcoming" | "active" | "completed";
  studentIds: string[];
  transfers: BatchTransfer[];
};

export type AttendanceMark = {
  studentId: string;
  studentName: string;
  status: "present" | "absent" | "late";
};

export type AttendanceSession = {
  id: string;
  date: string;
  batch: string;
  batchId: string;
  course: string;
  present: number;
  absent: number;
  method: "manual" | "qr" | "fingerprint";
  records: AttendanceMark[];
  notifiedAt?: string;
};

export type SalaryEntry = {
  id: string;
  date: string;
  amount: number;
  note: string;
};

export type RatingEvent = {
  id: string;
  date: string;
  score: number;
  note: string;
};

export type TrainerScheduleSlot = {
  id: string;
  day: string;
  time: string;
  batch: string;
  room: string;
};

export type TrainerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  status: "active" | "on_leave" | "inactive";
  salary: number;
  rating: number;
  schedule: string;
  scheduleSlots: TrainerScheduleSlot[];
  salaryHistory: SalaryEntry[];
  ratingHistory: RatingEvent[];
};

export type PaymentReminder = {
  id: string;
  sentAt: string;
  channel: "sms" | "email" | "whatsapp";
  note: string;
};

export type ReceiptLog = {
  id: string;
  downloadedAt: string;
  amount: number;
};

export type PaymentInvoice = {
  id: string;
  number: string;
  student: string;
  studentId: string;
  course: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: "paid" | "partial" | "overdue" | "refunded";
  discount: number;
  reminders: PaymentReminder[];
  receipts: ReceiptLog[];
};

export type ExamGrade = {
  studentId: string;
  studentName: string;
  score: number;
  passed: boolean;
  comment: string;
};

export type ExamRecord = {
  id: string;
  title: string;
  course: string;
  batch: string;
  batchId: string;
  type: "practical" | "written" | "final";
  date: string;
  passMark: number;
  status: "scheduled" | "graded" | "cancelled";
  grades: ExamGrade[];
};

export type CertVerifyLog = {
  id: string;
  verifiedAt: string;
  result: "valid" | "invalid";
};

export type CertificateRecord = {
  id: string;
  number: string;
  student: string;
  studentId: string;
  course: string;
  issuedAt: string;
  status: "issued" | "revoked" | "pending";
  verifyLog: CertVerifyLog[];
  /** Public PDF URL from Canva export / R2 CDN */
  pdfUrl?: string | null;
  editUrl?: string | null;
};

export type InventoryPurchase = {
  id: string;
  date: string;
  qty: number;
  unitCost: number;
  note: string;
};

export type InventoryUsage = {
  id: string;
  date: string;
  qty: number;
  batch: string;
  note: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: "beans" | "milk" | "syrups" | "cups" | "machines" | "other";
  stock: number;
  unit: string;
  minStock: number;
  lastPurchase: string;
  purchases: InventoryPurchase[];
  usage: InventoryUsage[];
};

export type TimetableSlot = {
  id: string;
  day: string;
  time: string;
  course: string;
  batch: string;
  batchId: string;
  trainer: string;
  trainerId: string;
  room: string;
};

export type LearningItem = {
  id: string;
  title: string;
  type: "video" | "pdf" | "assignment" | "quiz";
  course: string;
  progress: number;
  status: "published" | "draft";
  url: string;
  description: string;
};

export type EmployerRecord = {
  id: string;
  name: string;
  contact: string;
  email: string;
  city: string;
};

export type PlacementRecord = {
  id: string;
  student: string;
  studentId: string;
  employer: string;
  employerId: string;
  role: string;
  interviewDate: string;
  status: "applied" | "interview" | "offered" | "placed" | "rejected";
  cvName: string | null;
};

export type Announcement = {
  id: string;
  channel: "sms" | "email" | "whatsapp" | "board";
  title: string;
  body: string;
  sentAt: string;
  audience: "all" | "batch" | "student";
  audienceId: string | null;
  audienceLabel: string;
  deliveryLog: { id: string; at: string; status: string }[];
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
};

export type AdminProfile = {
  name: string;
  email: string;
  phone: string;
  role: string;
  institution: string;
  notifyFees: boolean;
  notifyStock: boolean;
  notifyAbsences: boolean;
};
