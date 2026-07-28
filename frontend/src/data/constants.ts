/** Small UI option lists — not demo domain data */

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const RELATIONSHIPS = [
  "Parent",
  "Spouse",
  "Sibling",
  "Guardian",
  "Friend",
  "Other",
] as const;

export const DOCUMENT_TYPES = [
  { value: "id_proof", label: "ID proof" },
  { value: "certificate", label: "Certificate" },
  { value: "photo", label: "Photo" },
  { value: "application", label: "Application" },
  { value: "other", label: "Other" },
] as const;

export const ADMISSION_SOURCES = [
  { value: "website", label: "Website" },
  { value: "walk-in", label: "Walk-in" },
  { value: "referral", label: "Referral" },
  { value: "social", label: "Social media" },
  { value: "phone", label: "Phone" },
] as const;
