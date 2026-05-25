/**
 * api.ts — Centralised HTTP client for the HireReady backend.
 *
 * All functions return typed promises and throw ApiError on non-2xx responses.
 */

import type {
  ResumeUploadResponse,
  Job,
  JobDetail,
  MatchScores,
  OTPSendResponse,
  OTPVerifyResponse,
  InterviewStartResponse,
  InterviewAnswerResponse,
} from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ── Generic fetch wrapper ─────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore JSON parse failures
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

// ── Resume ────────────────────────────────────────────────

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/api/resume/upload`, {
    method: "POST",
    body: form,
    // Do NOT set Content-Type header — browser sets it with boundary
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Upload failed (${res.status})`);
  }

  return res.json();
}

// ── Jobs ──────────────────────────────────────────────────

export async function fetchJobs(
  filter?: string,
  q?: string
): Promise<{ total: number; jobs: Job[] }> {
  const params = new URLSearchParams();
  if (filter && filter !== "all") params.set("filter", filter);
  if (q) params.set("q", q);
  const qs = params.toString() ? `?${params}` : "";
  return request(`/api/jobs${qs}`);
}

export async function fetchJob(jobId: number): Promise<JobDetail> {
  return request(`/api/jobs/${jobId}`);
}

export async function matchResumeToJob(
  resumeId: string,
  jobId: number
): Promise<MatchScores> {
  return request("/api/jobs/match", {
    method: "POST",
    body: JSON.stringify({ resume_id: resumeId, job_id: jobId }),
  });
}

// ── Auth / OTP ────────────────────────────────────────────

export async function sendOTP(email: string): Promise<OTPSendResponse> {
  return request("/api/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOTP(
  email: string,
  otp: string
): Promise<OTPVerifyResponse> {
  return request("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

// ── Interview ─────────────────────────────────────────────

export async function startInterview(
  jobId: number,
  jobTitle: string,
  resumeId: string,
  sessionToken: string
): Promise<InterviewStartResponse> {
  return request("/api/interview/start", {
    method: "POST",
    body: JSON.stringify({
      job_id: jobId,
      job_title: jobTitle,
      resume_id: resumeId,
      session_token: sessionToken,
    }),
  });
}

export async function submitAnswer(
  sessionId: string,
  answer: string
): Promise<InterviewAnswerResponse> {
  return request("/api/interview/answer", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, answer }),
  });
}
