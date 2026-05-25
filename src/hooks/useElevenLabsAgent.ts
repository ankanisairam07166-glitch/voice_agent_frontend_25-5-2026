// // // // /**
// // // //  * useElevenLabsAgent
// // // //  *
// // // //  * Wraps @elevenlabs/react useConversation with:
// // // //  *  - signed-URL fetch from our FastAPI backend
// // // //  *  - knowledge-base creation from the uploaded resume
// // // //  *  - agent override (system prompt + first message)
// // // //  *  - transcript accumulation
// // // //  */

// // // // import { useCallback, useState } from "react";
// // // // import { useConversation } from "@elevenlabs/react";

// // // // const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// // // // export interface TranscriptEntry {
// // // //   id: number;
// // // //   speaker: "ai" | "you";
// // // //   text: string;
// // // //   time: string;
// // // // }

// // // // interface UseElevenLabsAgentOptions {
// // // //   resumeId: string;
// // // //   resumeText: string;
// // // //   jobTitle: string;
// // // //   company: string;
// // // //   candidateName: string;
// // // //   onTranscript?: (entry: TranscriptEntry) => void;
// // // //   onSessionEnd?: () => void;
// // // //   onError?: (msg: string) => void;
// // // // }

// // // // function nowStr() {
// // // //   return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// // // // }

// // // // export function useElevenLabsAgent(opts: UseElevenLabsAgentOptions) {
// // // //   const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
// // // //   const [kbId, setKbId]             = useState<string>("");
// // // //   const [preparing, setPreparing]   = useState(false);
// // // //   const [error, setError]           = useState("");

// // // //   function addEntry(speaker: "ai" | "you", text: string) {
// // // //     const entry: TranscriptEntry = { id: Date.now(), speaker, text, time: nowStr() };
// // // //     setTranscript(prev => [...prev, entry]);
// // // //     opts.onTranscript?.(entry);
// // // //   }

// // // //   // ── @elevenlabs/react hook ────────────────────────────
// // // //   const conv = useConversation({
// // // //     onConnect: () => {
// // // //       console.log("[EL] Connected");
// // // //     },
// // // //     onDisconnect: () => {
// // // //       console.log("[EL] Disconnected");
// // // //       opts.onSessionEnd?.();
// // // //     },
// // // //     onMessage: ({ message, source }: { message: string; source: "user" | "ai" }) => {
// // // //       addEntry(source === "user" ? "you" : "ai", message);
// // // //     },
// // // //     onError: (err: string) => {
// // // //       console.error("[EL] Error:", err);
// // // //       setError(err);
// // // //       opts.onError?.(err);
// // // //     },
// // // //   });

// // // //   // ── Step 1: create KB from resume ────────────────────
// // // //   const prepareKnowledgeBase = useCallback(async (): Promise<string> => {
// // // //     if (kbId) return kbId;
// // // //     if (!opts.resumeText) return "";

// // // //     try {
// // // //       const res = await fetch(`${API}/api/elevenlabs/knowledge-base`, {
// // // //         method: "POST",
// // // //         headers: { "Content-Type": "application/json" },
// // // //         body: JSON.stringify({
// // // //           resume_id: opts.resumeId,
// // // //           resume_text: opts.resumeText,
// // // //           candidate_name: opts.candidateName,
// // // //         }),
// // // //       });
// // // //       const data = await res.json();
// // // //       const id = data.kb_id ?? "";
// // // //       setKbId(id);
// // // //       return id;
// // // //     } catch (e) {
// // // //       console.warn("[EL] KB creation failed (non-fatal):", e);
// // // //       return "";
// // // //     }
// // // //   }, [kbId, opts.resumeId, opts.resumeText, opts.candidateName]);

// // // //   // ── Step 2: build agent override ─────────────────────
// // // //   const buildOverride = useCallback(async (resolvedKbId: string) => {
// // // //     const res = await fetch(`${API}/api/elevenlabs/agent-override`, {
// // // //       method: "POST",
// // // //       headers: { "Content-Type": "application/json" },
// // // //       body: JSON.stringify({
// // // //         resume_id: opts.resumeId,
// // // //         resume_text: opts.resumeText,
// // // //         job_title: opts.jobTitle,
// // // //         company: opts.company,
// // // //         candidate_name: opts.candidateName,
// // // //         kb_id: resolvedKbId || undefined,
// // // //       }),
// // // //     });
// // // //     const data = await res.json();
// // // //     return data.override ?? {};
// // // //   }, [opts]);

// // // //   // ── Step 3: get signed URL ────────────────────────────
// // // //   const getSignedUrl = useCallback(async (): Promise<string> => {
// // // //     const res = await fetch(
// // // //       `${API}/api/elevenlabs/signed-url?resume_id=${opts.resumeId}`
// // // //     );
// // // //     const data = await res.json();
// // // //     if (!data.signed_url) throw new Error(data.detail ?? "No signed URL");
// // // //     return data.signed_url;
// // // //   }, [opts.resumeId]);

// // // //   // ── Start session (orchestrates all 3 steps) ─────────
// // // //   const startSession = useCallback(async () => {
// // // //     setPreparing(true);
// // // //     setError("");
// // // //     try {
// // // //       const [resolvedKbId, signedUrl] = await Promise.all([
// // // //         prepareKnowledgeBase(),
// // // //         getSignedUrl(),
// // // //       ]);
// // // //       const override = await buildOverride(resolvedKbId);

// // // //       await conv.startSession({
// // // //         signedUrl,
// // // //         overrides: override,
// // // //       });
// // // //     } catch (e: unknown) {
// // // //       const msg = e instanceof Error ? e.message : String(e);
// // // //       setError(msg);
// // // //       opts.onError?.(msg);
// // // //     } finally {
// // // //       setPreparing(false);
// // // //     }
// // // //   }, [prepareKnowledgeBase, getSignedUrl, buildOverride, conv, opts]);

// // // //   const endSession = useCallback(async () => {
// // // //     await conv.endSession();
// // // //   }, [conv]);

// // // //   return {
// // // //     // session controls
// // // //     startSession,
// // // //     endSession,
// // // //     // state
// // // //     status:     conv.status,           // "connected" | "connecting" | "disconnected"
// // // //     isSpeaking: conv.isSpeaking,
// // // //     isMuted:    false,
// // // //     preparing,
// // // //     error,
// // // //     // transcript
// // // //     transcript,
// // // //     clearTranscript: () => setTranscript([]),
// // // //   };
// // // // }
// // // /**
// // //  * useElevenLabsAgent — ElevenLabs Conversational AI hook.
// // //  *
// // //  * Key fix: onDisconnect only triggers onSessionEnd if the session
// // //  * was genuinely connected (not a failed/aborted connection attempt).
// // //  * A 3-second grace period also prevents false "complete" on brief drops.
// // //  */

// // // import { useCallback, useRef, useState } from "react";
// // // import { useConversation } from "@elevenlabs/react";

// // // const API      = import.meta.env.VITE_API_URL           ?? "http://localhost:8000";
// // // const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? "";

// // // export interface TranscriptEntry {
// // //   id: number;
// // //   speaker: "ai" | "you";
// // //   text: string;
// // //   time: string;
// // // }

// // // interface Options {
// // //   resumeId: string;
// // //   resumeText: string;
// // //   jobTitle: string;
// // //   company: string;
// // //   candidateName: string;
// // //   onTranscript?: (e: TranscriptEntry) => void;
// // //   onSessionEnd?: () => void;
// // //   onError?: (msg: string) => void;
// // // }

// // // function nowStr() {
// // //   return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// // // }

// // // function extractMsg(err: unknown): string {
// // //   if (typeof err === "string")   return err;
// // //   if (err instanceof Error)      return err.message;
// // //   if (err && typeof err === "object") {
// // //     const e = err as Record<string, unknown>;
// // //     if (typeof e.message === "string") return e.message;
// // //     if (typeof e.detail  === "string") return e.detail;
// // //   }
// // //   return "Unknown error";
// // // }

// // // export function useElevenLabsAgent(opts: Options) {
// // //   const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
// // //   const [kbId,       setKbId]       = useState("");
// // //   const [preparing,  setPreparing]  = useState(false);
// // //   const [error,      setError]      = useState("");

// // //   // ── Guards to prevent premature session-end ───────────
// // //   const hasConnectedRef   = useRef(false);   // was the session ever fully connected?
// // //   const intentionalEndRef = useRef(false);   // did WE call endSession()?
// // //   const disconnectTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

// // //   function addEntry(speaker: "ai" | "you", text: string) {
// // //     const entry: TranscriptEntry = { id: Date.now(), speaker, text, time: nowStr() };
// // //     setTranscript(prev => [...prev, entry]);
// // //     opts.onTranscript?.(entry);
// // //   }

// // //   // ── ElevenLabs SDK ────────────────────────────────────
// // //   const conv = useConversation({
// // //     onConnect: () => {
// // //       console.log("[EL] Connected ✓");
// // //       hasConnectedRef.current = true;
// // //       // Cancel any pending disconnect timer
// // //       if (disconnectTimer.current) { clearTimeout(disconnectTimer.current); disconnectTimer.current = null; }
// // //     },

// // //     onDisconnect: () => {
// // //       console.log("[EL] Disconnected (intentional:", intentionalEndRef.current, ")");

// // //       // If WE ended it → complete immediately
// // //       if (intentionalEndRef.current) {
// // //         opts.onSessionEnd?.();
// // //         return;
// // //       }

// // //       // If never connected → ignore (failed init, not a real session end)
// // //       if (!hasConnectedRef.current) {
// // //         console.log("[EL] Disconnect before connect — ignoring (likely init failure)");
// // //         return;
// // //       }

// // //       // Real mid-session disconnect → wait 3s for auto-reconnect before ending
// // //       disconnectTimer.current = setTimeout(() => {
// // //         console.log("[EL] Disconnect confirmed after grace period → ending session");
// // //         opts.onSessionEnd?.();
// // //       }, 3000);
// // //     },

// // //     onMessage: ({ message, source }: { message: string; source: string }) => {
// // //       addEntry(source === "user" ? "you" : "ai", message);
// // //     },

// // //     onError: (err: unknown) => {
// // //       const msg = extractMsg(err);
// // //       console.error("[EL] Error:", msg);
// // //       // Don't immediately end on error — show the message and let user retry
// // //       setError(msg);
// // //       opts.onError?.(msg);
// // //     },
// // //   });

// // //   // ── Knowledge base ────────────────────────────────────
// // //   const prepareKB = useCallback(async (): Promise<string> => {
// // //     if (kbId || !opts.resumeText.trim()) return kbId;
// // //     try {
// // //       const res  = await fetch(`${API}/api/elevenlabs/knowledge-base`, {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({
// // //           resume_id: opts.resumeId, resume_text: opts.resumeText,
// // //           candidate_name: opts.candidateName,
// // //         }),
// // //       });
// // //       const data = await res.json();
// // //       const id = (data.kb_id as string) ?? "";
// // //       setKbId(id);
// // //       return id;
// // //     } catch (e) { console.warn("[EL] KB skipped:", extractMsg(e)); return ""; }
// // //   }, [kbId, opts]);

// // //   // ── Agent override ────────────────────────────────────
// // //   const buildOverride = useCallback(async (resolvedKbId: string) => {
// // //     try {
// // //       const res = await fetch(`${API}/api/elevenlabs/agent-override`, {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({
// // //           resume_id: opts.resumeId, resume_text: opts.resumeText,
// // //           job_title: opts.jobTitle, company: opts.company,
// // //           candidate_name: opts.candidateName,
// // //           kb_id: resolvedKbId || undefined,
// // //         }),
// // //       });
// // //       const data = await res.json();
// // //       return data.override ?? {};
// // //     } catch (e) { console.warn("[EL] Override skipped:", extractMsg(e)); return {}; }
// // //   }, [opts]);

// // //   // ── Signed URL ────────────────────────────────────────
// // //   const getSignedUrl = useCallback(async (): Promise<string | null> => {
// // //     try {
// // //       const res  = await fetch(`${API}/api/elevenlabs/signed-url?resume_id=${opts.resumeId}`);
// // //       if (!res.ok) { console.warn("[EL] Signed-URL failed:", res.status); return null; }
// // //       const data = await res.json();
// // //       return (data.signed_url as string) || null;
// // //     } catch (e) { console.warn("[EL] Signed-URL fetch failed:", extractMsg(e)); return null; }
// // //   }, [opts.resumeId]);

// // //   // ── Start session ─────────────────────────────────────
// // //   const startSession = useCallback(async () => {
// // //     // Reset guards for new session
// // //     hasConnectedRef.current   = false;
// // //     intentionalEndRef.current = false;
// // //     if (disconnectTimer.current) { clearTimeout(disconnectTimer.current); disconnectTimer.current = null; }

// // //     setPreparing(true);
// // //     setError("");
// // //     try {
// // //       const [resolvedKbId, signedUrl] = await Promise.all([prepareKB(), getSignedUrl()]);
// // //       const override = await buildOverride(resolvedKbId);

// // //       if (signedUrl) {
// // //         console.log("[EL] Starting via signed URL");
// // //         await conv.startSession({ signedUrl, overrides: override });
// // //       } else if (AGENT_ID) {
// // //         console.log("[EL] Starting via direct agentId");
// // //         await conv.startSession({ signedUrl: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`, overrides: override });
// // //       } else {
// // //         throw new Error("ElevenLabs not configured. Add ELEVENLABS_AGENT_ID to backend/.env");
// // //       }
// // //     } catch (e: unknown) {
// // //       const msg = extractMsg(e);
// // //       setError(msg);
// // //       opts.onError?.(msg);
// // //     } finally {
// // //       setPreparing(false);
// // //     }
// // //   }, [prepareKB, getSignedUrl, buildOverride, conv, opts]);

// // //   // ── End session (intentional) ─────────────────────────
// // //   const endSession = useCallback(async () => {
// // //     intentionalEndRef.current = true;
// // //     if (disconnectTimer.current) { clearTimeout(disconnectTimer.current); disconnectTimer.current = null; }
// // //     try { await conv.endSession(); } catch {}
// // //   }, [conv]);

// // //   return {
// // //     startSession,
// // //     endSession,
// // //     status:          conv.status,
// // //     isSpeaking:      conv.isSpeaking,
// // //     preparing,
// // //     error,
// // //     transcript,
// // //     clearTranscript: () => setTranscript([]),
// // //   };
// // // }
// // /**
// //  * useElevenLabsAgent
// //  * KEY FIX: onDisconnect never auto-completes the session.
// //  * Only endSession() (user clicking End Interview) triggers completion.
// //  * Unexpected disconnects show a "dropped" state so user can reconnect.
// //  */

// // import { useCallback, useRef, useState } from "react";
// // import { useConversation } from "@elevenlabs/react";

// // const API      = import.meta.env.VITE_API_URL            ?? "http://localhost:8000";
// // const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? "";

// // export interface TranscriptEntry {
// //   id: number; speaker: "ai" | "you"; text: string; time: string;
// // }

// // interface Options {
// //   resumeId: string; resumeText: string;
// //   jobTitle: string; company: string; candidateName: string;
// //   onTranscript?: (e: TranscriptEntry) => void;
// //   onSessionEnd?: () => void;   // called ONLY on intentional end
// //   onDropped?: () => void;      // called on unexpected disconnect
// //   onError?: (msg: string) => void;
// // }

// // function nowStr() {
// //   return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// // }
// // function extractMsg(err: unknown): string {
// //   if (typeof err === "string") return err;
// //   if (err instanceof Error)   return err.message;
// //   if (err && typeof err === "object") {
// //     const e = err as Record<string, unknown>;
// //     return String(e.message ?? e.detail ?? "Unknown error");
// //   }
// //   return "Unknown error";
// // }

// // export function useElevenLabsAgent(opts: Options) {
// //   const [transcript,  setTranscript]  = useState<TranscriptEntry[]>([]);
// //   const [kbId,        setKbId]        = useState("");
// //   const [preparing,   setPreparing]   = useState(false);
// //   const [error,       setError]       = useState("");
// //   const [dropped,     setDropped]     = useState(false); // unexpected disconnect

// //   const intentionalRef = useRef(false); // true only when user clicks End
// //   const connectedRef   = useRef(false); // true after onConnect fires

// //   function addEntry(speaker: "ai" | "you", text: string) {
// //     const e: TranscriptEntry = { id: Date.now(), speaker, text, time: nowStr() };
// //     setTranscript(prev => [...prev, e]);
// //     opts.onTranscript?.(e);
// //   }

// //   const conv = useConversation({
// //     onConnect: () => {
// //       console.log("[EL] ✓ Connected");
// //       connectedRef.current = true;
// //       setDropped(false);
// //       setError("");
// //     },
// //     onDisconnect: () => {
// //       console.log("[EL] Disconnected — intentional:", intentionalRef.current);
// //       if (intentionalRef.current) {
// //         // User clicked End Interview → go to completion
// //         opts.onSessionEnd?.();
// //       } else {
// //         // Unexpected drop — DO NOT complete. Show reconnect UI instead.
// //         setDropped(true);
// //         opts.onDropped?.();
// //       }
// //       connectedRef.current = false;
// //     },
// //     onMessage: ({ message, source }: { message: string; source: string }) => {
// //       addEntry(source === "user" ? "you" : "ai", message);
// //     },
// //     onError: (err: unknown) => {
// //       const msg = extractMsg(err);
// //       console.error("[EL] Error:", msg);
// //       setError(msg);
// //       opts.onError?.(msg);
// //       // Do NOT end session on error
// //     },
// //   });

// //   // ── Knowledge base ───────────────────────────────────
// //   const prepareKB = useCallback(async (): Promise<string> => {
// //     if (kbId || !opts.resumeText.trim()) return kbId;
// //     try {
// //       const res  = await fetch(`${API}/api/elevenlabs/knowledge-base`, {
// //         method: "POST", headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ resume_id: opts.resumeId, resume_text: opts.resumeText, candidate_name: opts.candidateName }),
// //       });
// //       const data = await res.json();
// //       const id   = String(data.kb_id ?? "");
// //       setKbId(id); return id;
// //     } catch (e) { console.warn("[EL] KB skipped:", extractMsg(e)); return ""; }
// //   }, [kbId, opts]);

// //   // ── Agent override ───────────────────────────────────
// //   const buildOverride = useCallback(async (resolvedKbId: string) => {
// //     try {
// //       const res = await fetch(`${API}/api/elevenlabs/agent-override`, {
// //         method: "POST", headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ resume_id: opts.resumeId, resume_text: opts.resumeText, job_title: opts.jobTitle, company: opts.company, candidate_name: opts.candidateName, kb_id: resolvedKbId || undefined }),
// //       });
// //       return (await res.json()).override ?? {};
// //     } catch (e) { console.warn("[EL] Override skipped:", extractMsg(e)); return {}; }
// //   }, [opts]);

// //   // ── Signed URL ───────────────────────────────────────
// //   const getSignedUrl = useCallback(async (): Promise<string | null> => {
// //     try {
// //       const res  = await fetch(`${API}/api/elevenlabs/signed-url?resume_id=${opts.resumeId}`);
// //       if (!res.ok) { console.warn("[EL] Signed-URL HTTP", res.status); return null; }
// //       return String((await res.json()).signed_url ?? "") || null;
// //     } catch (e) { console.warn("[EL] Signed-URL failed:", extractMsg(e)); return null; }
// //   }, [opts.resumeId]);

// //   // ── Start session ────────────────────────────────────
// //   const startSession = useCallback(async () => {
// //     intentionalRef.current = false;
// //     connectedRef.current   = false;
// //     setDropped(false);
// //     setPreparing(true);
// //     setError("");

// //     try {
// //       // KB creation runs in background (for dashboard reference) — no overrides sent
// //       // because malformed overrides cause instant server-side disconnect.
// //       // Configure the agent system prompt in the ElevenLabs dashboard instead.
// //       prepareKB().catch(e => console.warn("[EL] KB background:", e));
// //       const signedUrl = await getSignedUrl();

// //       if (signedUrl) {
// //         await conv.startSession({ signedUrl });
// //       } else if (AGENT_ID) {
// //         const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`;
// //         await conv.startSession({ signedUrl: wsUrl });
// //       } else {
// //         throw new Error("ElevenLabs not configured — add ELEVENLABS_AGENT_ID to backend/.env");
// //       }
// //     } catch (e: unknown) {
// //       const msg = extractMsg(e);
// //       setError(msg);
// //       opts.onError?.(msg);
// //     } finally {
// //       setPreparing(false);
// //     }
// //   }, [prepareKB, getSignedUrl, conv, opts]);

// //   // ── End session (intentional only) ───────────────────
// //   const endSession = useCallback(async () => {
// //     intentionalRef.current = true;
// //     try { await conv.endSession(); } catch { opts.onSessionEnd?.(); }
// //   }, [conv, opts]);

// //   return {
// //     startSession, endSession,
// //     status: conv.status, isSpeaking: conv.isSpeaking,
// //     preparing, error, dropped,
// //     transcript, clearTranscript: () => setTranscript([]),
// //   };
// // }
// /**
//  * useElevenLabsAgent
//  * KEY FIX: onDisconnect never auto-completes the session.
//  * Only endSession() (user clicking End Interview) triggers completion.
//  * Unexpected disconnects show a "dropped" state so user can reconnect.
//  */

// import { useCallback, useRef, useState } from "react";
// import { useConversation } from "@elevenlabs/react";

// const API      = import.meta.env.VITE_API_URL            ?? "http://localhost:8000";
// const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? "";

// export interface TranscriptEntry {
//   id: number; speaker: "ai" | "you"; text: string; time: string;
// }

// interface Options {
//   resumeId: string; resumeText: string;
//   jobTitle: string; company: string; candidateName: string;
//   onTranscript?: (e: TranscriptEntry) => void;
//   onSessionEnd?: () => void;   // called ONLY on intentional end
//   onDropped?: () => void;      // called on unexpected disconnect
//   onError?: (msg: string) => void;
// }

// function nowStr() {
//   return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// }
// function extractMsg(err: unknown): string {
//   if (typeof err === "string") return err;
//   if (err instanceof Error)   return err.message;
//   if (err && typeof err === "object") {
//     const e = err as Record<string, unknown>;
//     return String(e.message ?? e.detail ?? "Unknown error");
//   }
//   return "Unknown error";
// }


// // ── Detect fresher vs experienced from resume text ───────
// function detectLevel(resumeText: string): "fresher" | "experienced" {
//   const text = resumeText.toLowerCase();
//   const expPatterns = [/\d+\s*(?:year|yr)s?\s*(?:of\s*)?(?:experience|exp)/i, /senior|lead|manager|architect|principal/i];
//   const freshPatterns = [/fresher|fresh graduate|no experience|0 year|entry.?level/i];
//   if (freshPatterns.some(p => p.test(text))) return "fresher";
//   if (expPatterns.some(p => p.test(text))) return "experienced";
//   // Count job entries as a heuristic
//   const jobCount = (text.match(/(?:worked at|working at|employed at|company|organisation|organization)/gi) || []).length;
//   return jobCount >= 2 ? "experienced" : "fresher";
// }

// function resumeSummary(text: string): string {
//   // Extract first 400 chars of meaningful content
//   return text.replace(/\s+/g, " ").trim().slice(0, 400);
// }

// export function useElevenLabsAgent(opts: Options) {
//   const [transcript,  setTranscript]  = useState<TranscriptEntry[]>([]);
//   const [kbId,        setKbId]        = useState("");
//   const [preparing,   setPreparing]   = useState(false);
//   const [error,       setError]       = useState("");
//   const [dropped,     setDropped]     = useState(false); // unexpected disconnect

//   const intentionalRef = useRef(false); // true only when user clicks End
//   const connectedRef   = useRef(false); // true after onConnect fires

//   function addEntry(speaker: "ai" | "you", text: string) {
//     const e: TranscriptEntry = { id: Date.now(), speaker, text, time: nowStr() };
//     setTranscript(prev => [...prev, e]);
//     opts.onTranscript?.(e);
//   }

//   const conv = useConversation({
//     onConnect: () => {
//       console.log("[EL] ✓ Connected");
//       connectedRef.current = true;
//       setDropped(false);
//       setError("");
//     },
//     onDisconnect: () => {
//       console.log("[EL] Disconnected — intentional:", intentionalRef.current);
//       if (intentionalRef.current) {
//         // User clicked End Interview → go to completion
//         opts.onSessionEnd?.();
//       } else {
//         // Unexpected drop — DO NOT complete. Show reconnect UI instead.
//         setDropped(true);
//         opts.onDropped?.();
//       }
//       connectedRef.current = false;
//     },
//     onMessage: ({ message, source }: { message: string; source: string }) => {
//       addEntry(source === "user" ? "you" : "ai", message);
//     },
//     onError: (err: unknown) => {
//       const msg = extractMsg(err);
//       console.error("[EL] Error:", msg);
//       setError(msg);
//       opts.onError?.(msg);
//       // Do NOT end session on error
//     },
//   });

//   // ── Knowledge base ───────────────────────────────────
//   const prepareKB = useCallback(async (): Promise<string> => {
//     if (kbId || !opts.resumeText.trim()) return kbId;
//     try {
//       const res  = await fetch(`${API}/api/elevenlabs/knowledge-base`, {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ resume_id: opts.resumeId, resume_text: opts.resumeText, candidate_name: opts.candidateName }),
//       });
//       const data = await res.json();
//       const id   = String(data.kb_id ?? "");
//       setKbId(id); return id;
//     } catch (e) { console.warn("[EL] KB skipped:", extractMsg(e)); return ""; }
//   }, [kbId, opts]);

//   // ── Agent override ───────────────────────────────────
//   const buildOverride = useCallback(async (resolvedKbId: string) => {
//     try {
//       const res = await fetch(`${API}/api/elevenlabs/agent-override`, {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ resume_id: opts.resumeId, resume_text: opts.resumeText, job_title: opts.jobTitle, company: opts.company, candidate_name: opts.candidateName, kb_id: resolvedKbId || undefined }),
//       });
//       return (await res.json()).override ?? {};
//     } catch (e) { console.warn("[EL] Override skipped:", extractMsg(e)); return {}; }
//   }, [opts]);

//   // ── Signed URL ───────────────────────────────────────
//   const getSignedUrl = useCallback(async (): Promise<string | null> => {
//     try {
//       const res  = await fetch(`${API}/api/elevenlabs/signed-url?resume_id=${opts.resumeId}`);
//       if (!res.ok) { console.warn("[EL] Signed-URL HTTP", res.status); return null; }
//       return String((await res.json()).signed_url ?? "") || null;
//     } catch (e) { console.warn("[EL] Signed-URL failed:", extractMsg(e)); return null; }
//   }, [opts.resumeId]);

//   // ── Start session ────────────────────────────────────
//   const startSession = useCallback(async () => {
//     intentionalRef.current = false;
//     connectedRef.current   = false;
//     setDropped(false);
//     setPreparing(true);
//     setError("");

//     try {
//       // KB creation runs in background (for dashboard reference) — no overrides sent
//       // because malformed overrides cause instant server-side disconnect.
//       // Configure the agent system prompt in the ElevenLabs dashboard instead.
//       prepareKB().catch(e => console.warn("[EL] KB background:", e));
//       const signedUrl = await getSignedUrl();

//       const level   = detectLevel(opts.resumeText);
//       const summary = resumeSummary(opts.resumeText);
//       const dynVars = {
//         candidate_name:   opts.candidateName || "the candidate",
//         job_title:        opts.jobTitle,
//         company:          opts.company,
//         experience_level: level,                  // "fresher" | "experienced"
//         resume_summary:   summary,
//       };

//       if (signedUrl) {
//         await conv.startSession({ signedUrl, dynamicVariables: dynVars });
//       } else if (AGENT_ID) {
//         const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`;
//         await conv.startSession({ signedUrl: wsUrl, dynamicVariables: dynVars });
//       } else {
//         throw new Error("ElevenLabs not configured — add ELEVENLABS_AGENT_ID to backend/.env");
//       }
//     } catch (e: unknown) {
//       const msg = extractMsg(e);
//       setError(msg);
//       opts.onError?.(msg);
//     } finally {
//       setPreparing(false);
//     }
//   }, [prepareKB, getSignedUrl, conv, opts]);

//   // ── End session (intentional only) ───────────────────
//   const endSession = useCallback(async () => {
//     intentionalRef.current = true;
//     try { await conv.endSession(); } catch { opts.onSessionEnd?.(); }
//   }, [conv, opts]);

//   return {
//     startSession, endSession,
//     status: conv.status, isSpeaking: conv.isSpeaking,
//     preparing, error, dropped,
//     transcript, clearTranscript: () => setTranscript([]),
//   };
// }
/**
 * useElevenLabsAgent
 * KEY FIX: onDisconnect never auto-completes the session.
 * Only endSession() (user clicking End Interview) triggers completion.
 * Unexpected disconnects show a "dropped" state so user can reconnect.
 */

import { useCallback, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";

const API      = import.meta.env.VITE_API_URL            ?? "http://localhost:8000";
const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID ?? "";

export interface TranscriptEntry {
  id: number; speaker: "ai" | "you"; text: string; time: string;
}

interface Options {
  resumeId: string; resumeText: string;
  jobTitle: string; company: string; candidateName: string;
  onTranscript?: (e: TranscriptEntry) => void;
  onSessionEnd?: () => void;   // called ONLY on intentional end
  onDropped?: () => void;      // called on unexpected disconnect
  onError?: (msg: string) => void;
}

function nowStr() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function extractMsg(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error)   return err.message;
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    return String(e.message ?? e.detail ?? "Unknown error");
  }
  return "Unknown error";
}


// ── Detect fresher vs experienced from resume text ───────
function detectLevel(resumeText: string): "fresher" | "experienced" {
  const text = resumeText.toLowerCase();
  const expPatterns = [/\d+\s*(?:year|yr)s?\s*(?:of\s*)?(?:experience|exp)/i, /senior|lead|manager|architect|principal/i];
  const freshPatterns = [/fresher|fresh graduate|no experience|0 year|entry.?level/i];
  if (freshPatterns.some(p => p.test(text))) return "fresher";
  if (expPatterns.some(p => p.test(text))) return "experienced";
  // Count job entries as a heuristic
  const jobCount = (text.match(/(?:worked at|working at|employed at|company|organisation|organization)/gi) || []).length;
  return jobCount >= 2 ? "experienced" : "fresher";
}

function resumeSummary(text: string): string {
  // Send full resume content — ElevenLabs supports up to 4000 chars in dynamic vars
  const cleaned = text.replace(/\s+/g, " ").trim();
  console.log("[EL] Resume text length:", cleaned.length, "chars");
  if (cleaned.length < 50) {
    console.warn("[EL] Resume text too short — agent may not have enough context");
  }
  return cleaned.slice(0, 4000);
}

export function useElevenLabsAgent(opts: Options) {
  const [transcript,  setTranscript]  = useState<TranscriptEntry[]>([]);
  const [kbId,        setKbId]        = useState("");
  const [preparing,   setPreparing]   = useState(false);
  const [error,       setError]       = useState("");
  const [dropped,     setDropped]     = useState(false); // unexpected disconnect

  const intentionalRef = useRef(false); // true only when user clicks End
  const connectedRef   = useRef(false); // true after onConnect fires

  function addEntry(speaker: "ai" | "you", text: string) {
    const e: TranscriptEntry = { id: Date.now(), speaker, text, time: nowStr() };
    setTranscript(prev => [...prev, e]);
    opts.onTranscript?.(e);
  }

  const conv = useConversation({
    onConnect: () => {
      console.log("[EL] ✓ Connected");
      connectedRef.current = true;
      setDropped(false);
      setError("");
    },
    onDisconnect: () => {
      console.log("[EL] Disconnected — intentional:", intentionalRef.current);
      if (intentionalRef.current) {
        // User clicked End Interview → go to completion
        opts.onSessionEnd?.();
      } else {
        // Unexpected drop — DO NOT complete. Show reconnect UI instead.
        setDropped(true);
        opts.onDropped?.();
      }
      connectedRef.current = false;
    },
    onMessage: ({ message, source }: { message: string; source: string }) => {
      addEntry(source === "user" ? "you" : "ai", message);
    },
    onError: (err: unknown) => {
      const msg = extractMsg(err);
      console.error("[EL] Error:", msg);
      setError(msg);
      opts.onError?.(msg);
      // Do NOT end session on error
    },
  });

  // ── Knowledge base ───────────────────────────────────
  const prepareKB = useCallback(async (): Promise<string> => {
    if (kbId || !opts.resumeText.trim()) return kbId;
    try {
      const res  = await fetch(`${API}/api/elevenlabs/knowledge-base`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_id: opts.resumeId, resume_text: opts.resumeText, candidate_name: opts.candidateName }),
      });
      const data = await res.json();
      const id   = String(data.kb_id ?? "");
      setKbId(id); return id;
    } catch (e) { console.warn("[EL] KB skipped:", extractMsg(e)); return ""; }
  }, [kbId, opts]);

  // ── Agent override ───────────────────────────────────
  const buildOverride = useCallback(async (resolvedKbId: string) => {
    try {
      const res = await fetch(`${API}/api/elevenlabs/agent-override`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_id: opts.resumeId, resume_text: opts.resumeText, job_title: opts.jobTitle, company: opts.company, candidate_name: opts.candidateName, kb_id: resolvedKbId || undefined }),
      });
      return (await res.json()).override ?? {};
    } catch (e) { console.warn("[EL] Override skipped:", extractMsg(e)); return {}; }
  }, [opts]);

  // ── Signed URL ───────────────────────────────────────
  const getSignedUrl = useCallback(async (): Promise<string | null> => {
    try {
      const res  = await fetch(`${API}/api/elevenlabs/signed-url?resume_id=${opts.resumeId}`);
      if (!res.ok) { console.warn("[EL] Signed-URL HTTP", res.status); return null; }
      return String((await res.json()).signed_url ?? "") || null;
    } catch (e) { console.warn("[EL] Signed-URL failed:", extractMsg(e)); return null; }
  }, [opts.resumeId]);

  // ── Start session ────────────────────────────────────
  const startSession = useCallback(async () => {
    intentionalRef.current = false;
    connectedRef.current   = false;
    setDropped(false);
    setPreparing(true);
    setError("");

    try {
      // KB creation runs in background (for dashboard reference) — no overrides sent
      // because malformed overrides cause instant server-side disconnect.
      // Configure the agent system prompt in the ElevenLabs dashboard instead.
      prepareKB().catch(e => console.warn("[EL] KB background:", e));
      const signedUrl = await getSignedUrl();

      // ── Debug: log what the agent will receive ──────────
      const level   = detectLevel(opts.resumeText);
      const summary = resumeSummary(opts.resumeText);
      const dynVars = {
        candidate_name:   opts.candidateName || "the candidate",
        job_title:        opts.jobTitle,
        company:          opts.company,
        experience_level: level,                  // "fresher" | "experienced"
        resume_summary:   summary,
      };

      console.log("[EL] Dynamic vars being sent to agent:", {
        candidate_name: opts.candidateName,
        job_title: opts.jobTitle,
        experience_level: level,
        resume_chars: summary.length,
        resume_preview: summary.slice(0, 100) + "...",
      });

      if (signedUrl) {
        await conv.startSession({ signedUrl, dynamicVariables: dynVars });
      } else if (AGENT_ID) {
        const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`;
        await conv.startSession({ signedUrl: wsUrl, dynamicVariables: dynVars });
      } else {
        throw new Error("ElevenLabs not configured — add ELEVENLABS_AGENT_ID to backend/.env");
      }
    } catch (e: unknown) {
      const msg = extractMsg(e);
      setError(msg);
      opts.onError?.(msg);
    } finally {
      setPreparing(false);
    }
  }, [prepareKB, getSignedUrl, conv, opts]);

  // ── End session (intentional only) ───────────────────
  const endSession = useCallback(async () => {
    intentionalRef.current = true;
    try { await conv.endSession(); } catch { opts.onSessionEnd?.(); }
  }, [conv, opts]);

  return {
    startSession, endSession,
    status: conv.status, isSpeaking: conv.isSpeaking,
    preparing, error, dropped,
    transcript, clearTranscript: () => setTranscript([]),
  };
}