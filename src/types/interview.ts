// Interview domain types

export interface InterviewData {
  candidateName: string;
  position: string;
  company: string;
  token: string;
  sessionId?: string;
  resumeText?: string;
  jobDescription?: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  type: 'ai' | 'user' | 'system';
  timestamp: string;
}

export interface IntegritySettings {
  maxViolations: number;
  checkFacePresence: boolean;
  checkMultipleFaces: boolean;
}

export interface IntegrityViolation {
  type: string;
  timestamp: number;
}

export type LaunchStage = 'kb' | 'upload' | 'avatar';

export interface SetupForm {
  candidateName: string;
  position: string;
  company: string;
}
