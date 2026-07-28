import axios from "axios";
import { unwrapItem, unwrapList } from "./utils";
import type { Course } from "@/types/course";
import type { LandingContent } from "@/types/landing";

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    Accept: "application/json",
  },
});

export async function fetchPublicLanding(): Promise<LandingContent> {
  const res = await publicApi.get("/public/landing");
  return unwrapItem<LandingContent>(res.data);
}

export async function fetchPublicCourses(): Promise<Course[]> {
  const res = await publicApi.get("/public/courses");
  return unwrapList<Course>(res.data);
}

export async function fetchPublicCourse(id: string): Promise<Course> {
  const res = await publicApi.get(`/public/courses/${id}`);
  return unwrapItem<Course>(res.data);
}
