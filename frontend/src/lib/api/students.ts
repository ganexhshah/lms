import { api } from "./client";
import { unwrapItem, unwrapList } from "./utils";
import type {
  EmergencyContact,
  Student,
  StudentDocument,
  StudentRegistrationInput,
} from "@/types/student";

export type StudentListParams = {
  search?: string;
  status?: string;
  course?: string;
  batch?: string;
};

export type UploadResult = {
  path: string;
  url: string;
  disk: string;
  size: number;
  mime: string | null;
  originalName: string;
};

export async function fetchStudents(params?: StudentListParams): Promise<Student[]> {
  const res = await api.get("/students", { params });
  return unwrapList<Student>(res.data);
}

export async function fetchStudent(id: string): Promise<Student> {
  const res = await api.get(`/students/${id}`);
  return unwrapItem<Student>(res.data);
}

export async function createStudent(
  input: StudentRegistrationInput
): Promise<Student> {
  const res = await api.post("/students", input);
  return unwrapItem<Student>(res.data);
}

export async function updateStudent(
  id: string,
  patch: Partial<Student>
): Promise<Student> {
  const res = await api.patch(`/students/${id}`, patch);
  return unwrapItem<Student>(res.data);
}

export async function uploadToCdn(
  file: File,
  folder = "uploads"
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const res = await api.post("/uploads", form);
  return (res.data as { data: UploadResult }).data;
}

export async function updateStudentPhoto(
  id: string,
  photoUrl: string | null
): Promise<Student> {
  const res = await api.patch(`/students/${id}/photo`, { photoUrl });
  return unwrapItem<Student>(res.data);
}

export async function updateStudentPhotoFile(
  id: string,
  file: File
): Promise<Student> {
  const form = new FormData();
  form.append("photo", file);
  const res = await api.patch(`/students/${id}/photo`, form);
  return unwrapItem<Student>(res.data);
}

export async function addEmergencyContact(
  studentId: string,
  contact: Omit<EmergencyContact, "id">
): Promise<Student> {
  const res = await api.post(`/students/${studentId}/emergency-contacts`, contact);
  return unwrapItem<Student>(res.data);
}

export async function updateEmergencyContact(
  studentId: string,
  contactId: string,
  patch: Partial<Omit<EmergencyContact, "id">>
): Promise<Student> {
  const res = await api.put(
    `/students/${studentId}/emergency-contacts/${contactId}`,
    patch
  );
  return unwrapItem<Student>(res.data);
}

export async function removeEmergencyContact(
  studentId: string,
  contactId: string
): Promise<Student> {
  const res = await api.delete(
    `/students/${studentId}/emergency-contacts/${contactId}`
  );
  return unwrapItem<Student>(res.data);
}

export async function addDocument(
  studentId: string,
  doc: Omit<StudentDocument, "id" | "uploadedAt">
): Promise<Student> {
  const res = await api.post(`/students/${studentId}/documents`, doc);
  return unwrapItem<Student>(res.data);
}

export async function addDocumentFile(
  studentId: string,
  input: {
    name: string;
    type: StudentDocument["type"];
    file: File;
  }
): Promise<Student> {
  const form = new FormData();
  form.append("name", input.name);
  form.append("type", input.type);
  form.append("file", input.file);
  const res = await api.post(`/students/${studentId}/documents`, form);
  return unwrapItem<Student>(res.data);
}

export async function removeDocument(
  studentId: string,
  documentId: string
): Promise<Student> {
  const res = await api.delete(`/students/${studentId}/documents/${documentId}`);
  return unwrapItem<Student>(res.data);
}

export async function issueIdCard(studentId: string): Promise<Student> {
  const res = await api.post(`/students/${studentId}/issue-id-card`);
  return unwrapItem<Student>(res.data);
}
