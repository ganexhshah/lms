export type StudentStatus = "active" | "inactive" | "graduated" | "on_hold";

export type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
};

export type StudentDocument = {
  id: string;
  name: string;
  type: "id_proof" | "certificate" | "photo" | "application" | "other";
  sizeLabel: string;
  url?: string | null;
  uploadedAt: string;
};

export type HistoryEvent = {
  id: string;
  category:
    | "registration"
    | "profile"
    | "photo"
    | "emergency"
    | "id_card"
    | "document"
    | "batch"
    | "attendance"
    | "payment"
    | "other";
  title: string;
  detail: string;
  date: string;
};

export type Student = {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  address: string;
  city: string;
  course: string;
  batch: string;
  status: StudentStatus;
  enrolledAt: string;
  photoUrl: string | null;
  bloodGroup: string;
  nationality: string;
  emergencyContacts: EmergencyContact[];
  documents: StudentDocument[];
  history: HistoryEvent[];
  idCardIssued: boolean;
  idCardIssuedAt: string | null;
};

export type StudentRegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Student["gender"];
  address: string;
  city: string;
  course: string;
  batch: string;
  bloodGroup: string;
  nationality: string;
  photoUrl?: string | null;
  emergencyContacts?: Omit<EmergencyContact, "id">[];
  documents?: Omit<StudentDocument, "id" | "uploadedAt">[];
};

export type RegistrationDraftDocument = {
  id: string;
  file: File;
  name: string;
  type: StudentDocument["type"];
  sizeLabel: string;
};

export function studentFullName(student: Pick<Student, "firstName" | "lastName">) {
  return `${student.firstName} ${student.lastName}`;
}

export function studentInitials(student: Pick<Student, "firstName" | "lastName">) {
  return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
}
