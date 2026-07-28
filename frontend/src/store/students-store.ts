"use client";

import { create } from "zustand";

import * as studentsApi from "@/lib/api/students";
import { getApiErrorMessage } from "@/lib/api/utils";
import type {
  EmergencyContact,
  Student,
  StudentDocument,
  StudentRegistrationInput,
  StudentStatus,
} from "@/types/student";

type StudentsState = {
  students: Student[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  registerStudent: (input: StudentRegistrationInput) => Promise<Student>;
  updateStudent: (id: string, patch: Partial<Student>) => Promise<Student>;
  setStudentPhoto: (id: string, photoUrl: string | null) => Promise<Student>;
  setEmergencyContacts: (
    id: string,
    contacts: EmergencyContact[]
  ) => Promise<Student>;
  addEmergencyContact: (
    id: string,
    contact: Omit<EmergencyContact, "id">
  ) => Promise<Student>;
  removeEmergencyContact: (
    studentId: string,
    contactId: string
  ) => Promise<Student>;
  issueIdCard: (id: string) => Promise<Student>;
  addDocument: (
    id: string,
    doc: Omit<StudentDocument, "id" | "uploadedAt">
  ) => Promise<Student>;
  removeDocument: (
    studentId: string,
    documentId: string
  ) => Promise<Student>;
  setStatus: (id: string, status: StudentStatus) => Promise<Student>;
  getStudent: (id: string) => Student | undefined;
};

function replaceStudent(students: Student[], student: Student) {
  const idx = students.findIndex((s) => s.id === student.id);
  if (idx === -1) return [student, ...students];
  const next = students.slice();
  next[idx] = student;
  return next;
}

export const useStudentsStore = create<StudentsState>((set, get) => ({
  students: [],
  loading: false,
  loaded: false,
  error: null,

  getStudent: (id) => get().students.find((s) => s.id === id),

  load: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const students = await studentsApi.fetchStudents();
      set({ students, loading: false, loaded: true });
    } catch (e) {
      set({
        loading: false,
        loaded: true,
        error: getApiErrorMessage(e, "Failed to load students"),
      });
    }
  },

  registerStudent: async (input) => {
    const student = await studentsApi.createStudent(input);
    set((s) => ({ students: [student, ...s.students] }));
    return student;
  },

  updateStudent: async (id, patch) => {
    const student = await studentsApi.updateStudent(id, patch);
    set((s) => ({ students: replaceStudent(s.students, student) }));
    return student;
  },

  setStudentPhoto: async (id, photoUrl) => {
    const student = await studentsApi.updateStudentPhoto(id, photoUrl);
    set((s) => ({ students: replaceStudent(s.students, student) }));
    return student;
  },

  setEmergencyContacts: async (id, contacts) => {
    const student = await studentsApi.updateStudent(id, {
      emergencyContacts: contacts,
    } as Partial<Student>);
    set((s) => ({ students: replaceStudent(s.students, student) }));
    return student;
  },

  addEmergencyContact: async (id, contact) => {
    const student = await studentsApi.addEmergencyContact(id, contact);
    set((s) => ({ students: replaceStudent(s.students, student) }));
    return student;
  },

  removeEmergencyContact: async (studentId, contactId) => {
    const student = await studentsApi.removeEmergencyContact(
      studentId,
      contactId
    );
    set((s) => ({ students: replaceStudent(s.students, student) }));
    return student;
  },

  issueIdCard: async (id) => {
    const student = await studentsApi.issueIdCard(id);
    set((s) => ({ students: replaceStudent(s.students, student) }));
    return student;
  },

  addDocument: async (id, doc) => {
    const student = await studentsApi.addDocument(id, doc);
    set((s) => ({ students: replaceStudent(s.students, student) }));
    return student;
  },

  removeDocument: async (studentId, documentId) => {
    const student = await studentsApi.removeDocument(studentId, documentId);
    set((s) => ({ students: replaceStudent(s.students, student) }));
    return student;
  },

  setStatus: async (id, status) => get().updateStudent(id, { status }),
}));
