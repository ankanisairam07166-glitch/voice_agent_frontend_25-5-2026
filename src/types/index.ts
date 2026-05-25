// // ── Domain types ──────────────────────────────────────────

// export interface Job {
//   id: number;
//   title: string;
//   company: string;
//   location: string;
//   salary_range: string;
//   experience: string;
//   skills: string[];
//   applicants: number;
//   posted_days_ago: number;
//   filter_tags: string[];
//   avatar_color: string;
//   avatar_initials: string;
//   match_percent?: number;
// }

// export interface JobDetail extends Job {
//   description: string;
//   responsibilities: string[];
//   requirements: string[];
//   skills_match: number;
//   experience_match: number;
//   keywords_match: number;
// }

// export interface MatchScores {
//   overall: number;
//   skills: number;
//   experience: number;
//   keywords: number;
// }

// export interface ResumeUploadResponse {
//   resume_id: string;
//   filename: string;
//   size_kb: number;
//   parsed_skills: string[];
//   message: string;
// }

// export interface OTPSendResponse {
//   message: string;
//   expires_in: number;
//   dev_otp?: string;   // Only present when APP_ENV=development
// }

// export interface OTPVerifyResponse {
//   verified: boolean;
//   session_token: string;
//   message: string;
// }

// export interface InterviewStartResponse {
//   session_id: string;
//   total_questions: number;
//   current_index: number;
//   question: string;
// }

// export interface InterviewAnswerResponse {
//   feedback: string;
//   complete: boolean;
//   current_index?: number;
//   question?: string;
//   total_questions?: number;
//   summary?: string;
// }

// // ── UI / wizard state ─────────────────────────────────────

// export type FilterTab = "all" | "remote" | "fresher" | "senior" | "mnc";

// export interface WizardState {
//   currentStep: number;
//   resumeId: string | null;
//   resumeFilename: string | null;
//   parsedSkills: string[];
//   selectedJob: Job | null;
//   email: string;
//   devOtp: string | undefined;   // only set in development mode
//   sessionToken: string;
// }

// // ── API helpers ───────────────────────────────────────────

// export interface ApiError {
//   detail: string;
// }
// ── Domain types ──────────────────────────────────────────

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary_range: string;
  experience: string;
  skills: string[];
  applicants: number;
  posted_days_ago: number;
  filter_tags: string[];
  avatar_color: string;
  avatar_initials: string;
  match_percent?: number;
}

export interface JobDetail extends Job {
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills_match: number;
  experience_match: number;
  keywords_match: number;
}

export interface MatchScores {
  overall: number;
  skills: number;
  experience: number;
  keywords: number;
}

export interface ResumeUploadResponse {
  resume_id: string;
  filename: string;
  size_kb: number;
  parsed_skills: string[];
  resume_text: string;
  message: string;
}

export interface OTPSendResponse {
  message: string;
  expires_in: number;
  dev_otp?: string;   // Only present when APP_ENV=development
}

export interface OTPVerifyResponse {
  verified: boolean;
  session_token: string;
  message: string;
}

export interface InterviewStartResponse {
  session_id: string;
  total_questions: number;
  current_index: number;
  question: string;
}

export interface InterviewAnswerResponse {
  feedback: string;
  complete: boolean;
  current_index?: number;
  question?: string;
  total_questions?: number;
  summary?: string;
}

// ── UI / wizard state ─────────────────────────────────────

export type FilterTab = "all" | "remote" | "fresher" | "senior" | "mnc";

export interface WizardState {
  currentStep: number;
  resumeId: string | null;
  resumeFilename: string | null;
  parsedSkills: string[];
  selectedJob: Job | null;
  email: string;
  devOtp: string | undefined;   // only set in development mode
  sessionToken: string;
}

// ── API helpers ───────────────────────────────────────────

export interface ApiError {
  detail: string;
}