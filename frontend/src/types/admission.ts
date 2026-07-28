export type AdmissionStatus =
  | "lead"
  | "pending"
  | "waiting"
  | "approved"
  | "rejected"
  | "enrolled";

export type AdmissionSource =
  | "website"
  | "walk-in"
  | "referral"
  | "social"
  | "phone";

export type AdmissionHistoryEvent = {
  id: string;
  title: string;
  detail: string;
  date: string;
};

export type AdmissionApplication = {
  id: string;
  applicationCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  address: string;
  city: string;
  course: string;
  preferredBatch: string;
  status: AdmissionStatus;
  source: AdmissionSource;
  leadNotes: string;
  nextFollowUp: string | null;
  assignedBatch: string | null;
  waitingPosition: number | null;
  rejectionReason: string | null;
  createdAt: string;
  history: AdmissionHistoryEvent[];
};

export type AdmissionApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: AdmissionApplication["gender"];
  address: string;
  city: string;
  course: string;
  preferredBatch: string;
  source: AdmissionSource;
  leadNotes?: string;
};

export function admissionFullName(
  app: Pick<AdmissionApplication, "firstName" | "lastName">
) {
  return `${app.firstName} ${app.lastName}`;
}

export function admissionInitials(
  app: Pick<AdmissionApplication, "firstName" | "lastName">
) {
  return `${app.firstName.charAt(0)}${app.lastName.charAt(0)}`.toUpperCase();
}
