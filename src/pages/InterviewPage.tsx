// // /**
// //  * InterviewPage — AI voice interview using ElevenLabs Conversational AI.
// //  *
// //  * Flow:
// //  *  1. Page loads → reads job/resume context from sessionStorage
// //  *  2. "Start Interview" → backend creates KB from resume, builds agent override,
// //  *     returns signed URL → ElevenLabs session opens (voice in/out)
// //  *  3. Live transcript shown in right panel
// //  *  4. "End Interview" → session closed → completion screen
// //  */

// // import { useEffect, useRef, useState, useCallback } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { useElevenLabsAgent } from "../hooks/useElevenLabsAgent";

// // // ── Helpers ───────────────────────────────────────────────
// // function formatDuration(s: number) {
// //   const m = Math.floor(s / 60), sec = s % 60;
// //   return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
// // }

// // // ── AI avatar with ripple when speaking ──────────────────
// // function AIAvatar({ speaking, connecting }: { speaking: boolean; connecting: boolean }) {
// //   return (
// //     <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 20px" }}>
// //       {speaking && [1, 2, 3].map(i => (
// //         <div key={i} style={{
// //           position: "absolute", inset: 0, borderRadius: "50%",
// //           border: "2px solid rgba(34,197,94,0.45)",
// //           animation: `ripple ${0.8 + i * 0.28}s ease-out ${i * 0.14}s infinite`,
// //         }} />
// //       ))}
// //       <div style={{
// //         width: 160, height: 160, borderRadius: "50%",
// //         background: speaking
// //           ? "radial-gradient(circle,rgba(34,197,94,0.22) 0%,rgba(34,197,94,0.06) 70%)"
// //           : connecting
// //             ? "radial-gradient(circle,rgba(59,130,246,0.2) 0%,transparent 70%)"
// //             : "rgba(255,255,255,0.05)",
// //         border: `3px solid ${speaking ? "#22c55e" : connecting ? "#3b82f6" : "rgba(255,255,255,0.12)"}`,
// //         display: "flex", alignItems: "center", justifyContent: "center",
// //         transition: "all 0.35s ease",
// //       }}>
// //         {connecting ? (
// //           <div style={{ fontSize: 52, animation: "spin 1.2s linear infinite" }}>⏳</div>
// //         ) : (
// //           <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
// //             <circle cx="34" cy="24" r="13" fill={speaking ? "#22c55e" : "#4b5563"} />
// //             <path d="M11 58c0-12.7 10.3-23 23-23s23 10.3 23 23"
// //               stroke={speaking ? "#22c55e" : "#4b5563"} strokeWidth="3.5"
// //               strokeLinecap="round" fill="none" />
// //           </svg>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // ── Completion screen ─────────────────────────────────────
// // function CompletionScreen({ jobTitle, company, elapsed, msgCount, onNew }:
// //   { jobTitle: string; company: string; elapsed: number; msgCount: number; onNew: () => void }) {
// //   return (
// //     <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e3a5f,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "DM Sans,sans-serif" }}>
// //       <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
// //         <div style={{ width: 96, height: 96, borderRadius: "50%", background: "rgba(34,197,94,0.15)", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 48 }}>✅</div>
// //         <h1 style={{ fontSize: 30, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Interview Complete!</h1>
// //         <p style={{ color: "#93c5fd", fontSize: 15, marginBottom: 32 }}>Great job — your responses have been recorded.</p>
// //         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24, marginBottom: 20, textAlign: "left" }}>
// //           {[["💼","POSITION",jobTitle],["🏢","COMPANY",company],["⏱️","DURATION",formatDuration(elapsed)],["💬","EXCHANGES",`${msgCount} messages`]].map(([icon,lbl,val]) => (
// //             <div key={lbl} style={{ display: "flex", gap: 10, alignItems: "center" }}>
// //               <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.08)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
// //               <div>
// //                 <p style={{ color: "#6b7280", fontSize: 10, fontWeight: 600, letterSpacing: "0.5px", margin: 0 }}>{lbl}</p>
// //                 <p style={{ color: "#fff", fontSize: 13, fontWeight: 500, margin: 0 }}>{val}</p>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //         <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
// //           <p style={{ color: "#93c5fd", fontSize: 13, lineHeight: 1.6, margin: 0 }}>Your responses have been saved. The hiring team will review your performance and reach out with next steps.</p>
// //         </div>
// //         <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
// //           <button onClick={onNew} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>🔄 New Interview</button>
// //           <button onClick={() => { sessionStorage.clear(); window.location.href = "/"; }} style={{ padding: "10px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Go Home</button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ── Main ─────────────────────────────────────────────────
// // export default function InterviewPage() {
// //   const navigate = useNavigate();

// //   // Context stored by Step6Launch
// //   const jobTitle      = sessionStorage.getItem("interview_job_title")   ?? "the role";
// //   const company       = sessionStorage.getItem("interview_company")      ?? "the company";
// //   const candidateName = sessionStorage.getItem("interview_candidate")    ?? "Candidate";
// //   const resumeId      = sessionStorage.getItem("interview_resume_id")    ?? "";
// //   const resumeText    = sessionStorage.getItem("interview_resume_text")  ?? "";

// //   // ── UI state ─────────────────────────────────────────
// //   const [isVideoOn, setIsVideoOn]         = useState(true);
// //   const [isMicOn, setIsMicOn]             = useState(true);
// //   const [showTranscript, setShowTranscript] = useState(true);
// //   const [isFullscreen, setIsFullscreen]   = useState(false);
// //   const [elapsed, setElapsed]             = useState(0);
// //   const [cameraReady, setCameraReady]     = useState(false);
// //   const [cameraError, setCameraError]     = useState("");
// //   const [complete, setComplete]           = useState(false);
// //   const [showEndConfirm, setShowEndConfirm] = useState(false);
// //   const [started, setStarted]             = useState(false);

// //   const videoRef   = useRef<HTMLVideoElement>(null);
// //   const streamRef  = useRef<MediaStream | null>(null);
// //   const transcRef  = useRef<HTMLDivElement>(null);
// //   const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

// //   // ── ElevenLabs agent ─────────────────────────────────
// //   const agent = useElevenLabsAgent({
// //     resumeId,
// //     resumeText,
// //     jobTitle,
// //     company,
// //     candidateName,
// //     onSessionEnd: () => setComplete(true),
// //     onError: (msg) => console.error("[Agent]", msg),
// //   });

// //   const isConnected   = agent.status === "connected";
// //   const isConnecting  = agent.status === "connecting" || agent.preparing;

// //   // ── Webcam ────────────────────────────────────────────
// //   const startWebcam = useCallback(async () => {
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// //       streamRef.current = stream;
// //       if (videoRef.current) {
// //         videoRef.current.srcObject = stream;
// //         videoRef.current.onloadedmetadata = () => setCameraReady(true);
// //       }
// //     } catch { setCameraError("Camera access denied."); }
// //   }, []);

// //   useEffect(() => {
// //     startWebcam();
// //     return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
// //   }, [startWebcam]);

// //   // ── Timer ─────────────────────────────────────────────
// //   useEffect(() => {
// //     if (started) {
// //       timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
// //     }
// //     return () => { if (timerRef.current) clearInterval(timerRef.current); };
// //   }, [started]);

// //   // ── Auto-scroll transcript ────────────────────────────
// //   useEffect(() => {
// //     if (transcRef.current) transcRef.current.scrollTop = transcRef.current.scrollHeight;
// //   }, [agent.transcript]);

// //   // ── Controls ──────────────────────────────────────────
// //   function toggleMic() {
// //     streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
// //     setIsMicOn(p => !p);
// //   }
// //   function toggleVideo() {
// //     streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
// //     setIsVideoOn(p => !p);
// //   }
// //   function toggleFullscreen() {
// //     if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
// //     else { document.exitFullscreen(); setIsFullscreen(false); }
// //   }

// //   async function handleStart() {
// //     setStarted(true);
// //     await agent.startSession();
// //   }

// //   async function handleEnd() {
// //     if (timerRef.current) clearInterval(timerRef.current);
// //     streamRef.current?.getTracks().forEach(t => t.stop());
// //     await agent.endSession();
// //     setComplete(true);
// //     setShowEndConfirm(false);
// //   }

// //   // ── Completion screen ─────────────────────────────────
// //   if (complete) {
// //     return <CompletionScreen jobTitle={jobTitle} company={company}
// //       elapsed={elapsed} msgCount={agent.transcript.length}
// //       onNew={() => { sessionStorage.clear(); navigate("/"); }} />;
// //   }

// //   // ── Interview UI ──────────────────────────────────────
// //   return (
// //     <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#111827", color: "#fff", fontFamily: "DM Sans,sans-serif", overflow: "hidden" }}>

// //       {/* ── Top bar ──────────────────────────────────────── */}
// //       <div style={{ height: 48, background: "#1f2937", borderBottom: "1px solid #374151", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
// //         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
// //           <span style={{ fontSize: 13, fontWeight: 600 }}>AI Interview Session</span>
// //           <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: cameraReady ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.2)", border: `1px solid ${cameraReady ? "rgba(34,197,94,0.3)" : "rgba(107,114,128,0.3)"}`, color: cameraReady ? "#4ade80" : "#9ca3af" }}>
// //             {cameraReady ? "● Camera Ready" : "○ Camera…"}
// //           </span>
// //           {isConnected && agent.isSpeaking && (
// //             <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa", animation: "blink 1.4s infinite" }}>
// //               🔊 AI Speaking
// //             </span>
// //           )}
// //           {isConnecting && (
// //             <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}>
// //               ⏳ Connecting…
// //             </span>
// //           )}
// //           {isConnected && !agent.isSpeaking && (
// //             <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}>
// //               🎙️ Listening
// //             </span>
// //           )}
// //         </div>
// //         <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
// //           <span style={{ fontFamily: "monospace", fontSize: 13, color: "#9ca3af" }}>{formatDuration(elapsed)}</span>
// //           <span style={{ fontSize: 12, color: "#6b7280" }}>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
// //         </div>
// //       </div>

// //       {/* ── Main ─────────────────────────────────────────── */}
// //       <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

// //         {/* AI panel */}
// //         <div style={{ width: 280, flexShrink: 0, background: "#1a1a2e", borderRight: "1px solid #374151", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 4 }}>
// //           <AIAvatar speaking={isConnected && agent.isSpeaking} connecting={isConnecting} />
// //           <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>AI Interviewer</p>
// //           <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>{company}</p>

// //           {/* Status / latest AI message */}
// //           <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", width: "100%", minHeight: 72 }}>
// //             {!started ? (
// //               <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", margin: 0 }}>Click "Start Interview" to begin your voice session with the AI interviewer</p>
// //             ) : isConnecting ? (
// //               <p style={{ fontSize: 12, color: "#fbbf24", textAlign: "center", margin: 0 }}>Setting up your personalised AI interview based on your resume…</p>
// //             ) : agent.error ? (
// //               <p style={{ fontSize: 12, color: "#f87171", margin: 0 }}>⚠️ {agent.error}</p>
// //             ) : (
// //               <p style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.6, margin: 0 }}>
// //                 {agent.transcript.filter(t => t.speaker === "ai").slice(-1)[0]?.text ?? "Listening…"}
// //               </p>
// //             )}
// //           </div>

// //           {/* Start button (shown before session starts) */}
// //           {!started && (
// //             <button onClick={handleStart} style={{ marginTop: 16, width: "100%", padding: "11px 0", background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
// //               🎙️ Start Interview
// //             </button>
// //           )}
// //           {agent.error && started && (
// //             <button onClick={handleStart} style={{ marginTop: 10, width: "100%", padding: "9px 0", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
// //               🔄 Retry Connection
// //             </button>
// //           )}
// //         </div>

// //         {/* Webcam */}
// //         <div style={{ flex: 1, position: "relative", background: "#0f172a", overflow: "hidden" }}>
// //           <video ref={videoRef} autoPlay playsInline muted
// //             style={{ width: "100%", height: "100%", objectFit: "cover", opacity: cameraReady && isVideoOn ? 1 : 0, transition: "opacity 0.3s" }}
// //           />
// //           {(!cameraReady || !isVideoOn) && (
// //             <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: "#1f2937" }}>
// //               {cameraError
// //                 ? <><div style={{ fontSize: 52 }}>📷</div><p style={{ color: "#f87171", fontSize: 13, textAlign: "center", maxWidth: 240 }}>{cameraError}</p><button onClick={startWebcam} style={{ padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Allow Camera</button></>
// //                 : !cameraReady ? <><div style={{ fontSize: 52, animation: "pulse 1.5s infinite" }}>📷</div><p style={{ color: "#9ca3af", fontSize: 13 }}>Starting camera…</p></>
// //                 : <><div style={{ fontSize: 52 }}>📷</div><p style={{ color: "#9ca3af", fontSize: 13 }}>Camera paused</p></>
// //               }
// //             </div>
// //           )}
// //           {/* Name tag */}
// //           <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "6px 12px" }}>
// //             <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{candidateName}</p>
// //             <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{jobTitle}</p>
// //           </div>
// //           {/* Mic badge */}
// //           <div style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: "50%", background: isMicOn ? "rgba(34,197,94,0.8)" : "rgba(239,68,68,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
// //             {isMicOn ? "🎙️" : "🔇"}
// //           </div>
// //           {/* Interim voice text (user speaking) */}
// //           {isConnected && isMicOn && (
// //             <div style={{ position: "absolute", bottom: 70, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", borderRadius: 10, padding: "8px 16px", maxWidth: 480, textAlign: "center" }}>
// //               <p style={{ fontSize: 12, color: "#93c5fd", margin: 0 }}>🎙️ Speak your answer — AI is listening</p>
// //             </div>
// //           )}
// //         </div>

// //         {/* Transcript panel */}
// //         {showTranscript && (
// //           <div style={{ width: 300, flexShrink: 0, background: "#111827", borderLeft: "1px solid #374151", display: "flex", flexDirection: "column" }}>
// //             <div style={{ padding: "10px 14px", borderBottom: "1px solid #374151", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
// //               <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Live Transcript</span>
// //               <button onClick={agent.clearTranscript} style={{ fontSize: 11, color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}>Clear ×</button>
// //             </div>
// //             <div ref={transcRef} style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
// //               {agent.transcript.map(entry => (
// //                 <div key={entry.id} style={{ padding: "8px 11px", borderRadius: 10, background: entry.speaker === "you" ? "rgba(37,99,235,0.22)" : "rgba(34,197,94,0.14)", marginLeft: entry.speaker === "you" ? 14 : 0, marginRight: entry.speaker === "you" ? 0 : 14 }}>
// //                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
// //                     <span style={{ fontSize: 10, fontWeight: 700, color: entry.speaker === "you" ? "#60a5fa" : "#4ade80" }}>
// //                       {entry.speaker === "you" ? "You" : "AI Interviewer"}
// //                     </span>
// //                     <span style={{ fontSize: 10, color: "#6b7280" }}>{entry.time}</span>
// //                   </div>
// //                   <p style={{ fontSize: 12, color: "#e5e7eb", lineHeight: 1.5, margin: 0 }}>{entry.text}</p>
// //                 </div>
// //               ))}
// //               {agent.transcript.length === 0 && (
// //                 <p style={{ color: "#4b5563", fontSize: 12, textAlign: "center", marginTop: 40 }}>
// //                   {started ? "Waiting for conversation…" : "Start the interview to see transcript"}
// //                 </p>
// //               )}
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       {/* ── Control bar ────────────────────────────────────── */}
// //       <div style={{ height: 64, background: "#1f2937", borderTop: "1px solid #374151", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
// //         <div style={{ display: "flex", gap: 8 }}>
// //           {[
// //             { icon: isMicOn ? "🎙️" : "🔇",    label: "Mic",        active: !isMicOn,       fn: toggleMic },
// //             { icon: isVideoOn ? "📹" : "📷",  label: "Camera",     active: !isVideoOn,     fn: toggleVideo },
// //             { icon: "💬",                      label: "Transcript", active: showTranscript, fn: () => setShowTranscript(p => !p) },
// //             { icon: isFullscreen ? "⬛" : "⛶", label: "Fullscreen", active: isFullscreen,   fn: toggleFullscreen },
// //           ].map(b => (
// //             <button key={b.label} onClick={b.fn} title={b.label}
// //               style={{ width: 44, height: 44, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 18, background: b.active ? "#2563eb" : "rgba(255,255,255,0.1)", transition: "background 0.2s" }}
// //             >{b.icon}</button>
// //           ))}
// //         </div>
// //         <button onClick={() => setShowEndConfirm(true)}
// //           style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
// //           🚫 End Interview
// //         </button>
// //       </div>

// //       {/* ── End confirm ──────────────────────────────────────── */}
// //       {showEndConfirm && (
// //         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
// //           <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 16, padding: 32, maxWidth: 340, width: "90%", textAlign: "center" }}>
// //             <p style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>End the interview?</p>
// //             <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>Your responses so far will be saved.</p>
// //             <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
// //               <button onClick={() => setShowEndConfirm(false)} style={{ padding: "10px 22px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
// //               <button onClick={handleEnd} style={{ padding: "10px 22px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>OK</button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       <style>{`
// //         @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
// //         @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.25} }
// //         @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
// //         @keyframes spin   { to{transform:rotate(360deg)} }
// //         ::-webkit-scrollbar{width:4px}
// //         ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
// //       `}</style>
// //     </div>
// //   );
// // }
// /**
//  * InterviewPage — Zoom-style AI interview session.
//  * Layout: Two large video tiles side-by-side, bottom control bar,
//  * floating transcript panel, speaking indicators.
//  */

// import { useEffect, useRef, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useElevenLabsAgent } from "../hooks/useElevenLabsAgent";

// function formatTime(s: number) {
//   const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
//   return h > 0
//     ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
//     : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
// }
// function nowStr() {
//   return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// }

// /* ── AI Avatar tile ───────────────────────────────────── */
// function AITile({ speaking, connecting, company }: { speaking: boolean; connecting: boolean; company: string }) {
//   return (
//     <div style={{
//       flex: 1, position: "relative", background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",
//       borderRadius: 16, overflow: "hidden", minHeight: 0,
//       border: speaking ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.08)",
//       transition: "border-color 0.3s",
//       boxShadow: speaking ? "0 0 24px rgba(34,197,94,0.2)" : "none",
//     }}>
//       {/* Speaking ripples */}
//       {speaking && (
//         <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
//           {[1,2,3].map(i=>(
//             <div key={i} style={{
//               position:"absolute", width:200+i*60, height:200+i*60, borderRadius:"50%",
//               border:"1.5px solid rgba(34,197,94,0.3)",
//               animation:`ripple ${0.9+i*0.3}s ease-out ${i*0.15}s infinite`,
//             }}/>
//           ))}
//         </div>
//       )}
//       {/* Avatar */}
//       <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
//         <div style={{
//           width:120, height:120, borderRadius:"50%",
//           background: speaking ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
//           border: `3px solid ${speaking ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
//           display:"flex", alignItems:"center", justifyContent:"center",
//           transition:"all 0.3s",
//         }}>
//           {connecting
//             ? <div style={{ fontSize:48, animation:"spin 1.2s linear infinite" }}>⏳</div>
//             : <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
//                 <circle cx="30" cy="21" r="11" fill={speaking?"#22c55e":"#4b5563"}/>
//                 <path d="M9 52c0-11.6 9.4-21 21-21s21 9.4 21 21" stroke={speaking?"#22c55e":"#4b5563"} strokeWidth="3" strokeLinecap="round" fill="none"/>
//               </svg>
//           }
//         </div>
//         <div style={{ textAlign:"center" }}>
//           <p style={{ fontSize:18, fontWeight:700, color:"#fff", margin:0 }}>AI Interviewer</p>
//           <p style={{ fontSize:13, color:"#6b7280", margin:"4px 0 0" }}>{company}</p>
//           {speaking && <p style={{ fontSize:12, color:"#22c55e", marginTop:6, animation:"blink 1.2s infinite" }}>🔊 Speaking…</p>}
//           {connecting && <p style={{ fontSize:12, color:"#fbbf24", marginTop:6 }}>Connecting…</p>}
//         </div>
//       </div>
//       {/* Name badge */}
//       <div style={{ position:"absolute", bottom:14, left:14, display:"flex", alignItems:"center", gap:8 }}>
//         <div style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", borderRadius:8, padding:"5px 12px" }}>
//           <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:0 }}>AI Interviewer</p>
//         </div>
//         {speaking && <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", animation:"blink 1s infinite" }}/>}
//       </div>
//       {/* Top label */}
//       <div style={{ position:"absolute", top:14, right:14, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", borderRadius:6, padding:"3px 10px", fontSize:11, color:"#9ca3af" }}>
//         AI Powered
//       </div>
//     </div>
//   );
// }

// /* ── Candidate webcam tile ────────────────────────────── */
// function CandidateTile({
//   videoRef, cameraReady, isVideoOn, isMicOn, candidateName, jobTitle, cameraError, onAllowCamera,
// }: {
//   videoRef: React.RefObject<HTMLVideoElement>;
//   cameraReady: boolean; isVideoOn: boolean; isMicOn: boolean;
//   candidateName: string; jobTitle: string; cameraError: string;
//   onAllowCamera: () => void;
// }) {
//   return (
//     <div style={{
//       flex: 1, position:"relative", background:"#111827",
//       borderRadius:16, overflow:"hidden", minHeight:0,
//       border: isMicOn ? "2px solid rgba(59,130,246,0.4)" : "2px solid rgba(255,255,255,0.08)",
//       transition:"border-color 0.3s",
//     }}>
//       <video ref={videoRef} autoPlay playsInline muted
//         style={{ width:"100%", height:"100%", objectFit:"cover", opacity: cameraReady&&isVideoOn ? 1:0, transition:"opacity 0.3s" }}
//       />
//       {(!cameraReady || !isVideoOn) && (
//         <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, background:"#1f2937" }}>
//           {cameraError
//             ? <><div style={{ fontSize:56 }}>📷</div>
//                 <p style={{ color:"#f87171", fontSize:14, textAlign:"center", maxWidth:240, margin:0 }}>{cameraError}</p>
//                 <button onClick={onAllowCamera} style={{ padding:"9px 20px", background:"#2563eb", color:"#fff", border:"none", borderRadius:9, fontSize:13, cursor:"pointer", fontWeight:600 }}>Allow Camera</button>
//               </>
//             : !cameraReady
//               ? <><div style={{ fontSize:56, animation:"pulse 1.5s infinite" }}>📷</div><p style={{ color:"#9ca3af", fontSize:14, margin:0 }}>Starting camera…</p></>
//               : <><div style={{ fontSize:56 }}>📷</div><p style={{ color:"#9ca3af", fontSize:14, margin:0 }}>Camera paused</p></>
//           }
//         </div>
//       )}
//       {/* Name badge */}
//       <div style={{ position:"absolute", bottom:14, left:14, display:"flex", alignItems:"center", gap:8 }}>
//         <div style={{ background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)", borderRadius:8, padding:"5px 12px" }}>
//           <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:0 }}>{candidateName}</p>
//           <p style={{ fontSize:11, color:"#9ca3af", margin:0 }}>{jobTitle}</p>
//         </div>
//         {!isMicOn && <div style={{ background:"rgba(239,68,68,0.85)", borderRadius:6, padding:"3px 8px", fontSize:11, color:"#fff" }}>🔇 Muted</div>}
//       </div>
//       {/* Mic badge top-right */}
//       <div style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", background: isMicOn?"rgba(34,197,94,0.8)":"rgba(239,68,68,0.8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
//         {isMicOn ? "🎙️" : "🔇"}
//       </div>
//     </div>
//   );
// }

// /* ── Completion screen ───────────────────────────────── */
// function CompletionScreen({ jobTitle, company, elapsed, msgCount, onNew }:
//   { jobTitle:string; company:string; elapsed:number; msgCount:number; onNew:()=>void }) {
//   return (
//     <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f172a,#1e3a5f,#0f172a)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"DM Sans,sans-serif" }}>
//       <div style={{ width:"100%", maxWidth:500, textAlign:"center" }}>
//         <div style={{ width:96, height:96, borderRadius:"50%", background:"rgba(34,197,94,0.15)", border:"2px solid #22c55e", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:48 }}>🏆</div>
//         <h1 style={{ fontSize:32, fontWeight:800, color:"#fff", marginBottom:8 }}>Interview Complete!</h1>
//         <p style={{ color:"#93c5fd", fontSize:15, marginBottom:32 }}>Your responses have been recorded. Great job!</p>
//         <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:24, marginBottom:20, textAlign:"left" }}>
//           {[["💼","POSITION",jobTitle],["🏢","COMPANY",company],["⏱️","DURATION",formatTime(elapsed)],["💬","EXCHANGES",`${msgCount} messages`]].map(([icon,lbl,val])=>(
//             <div key={lbl} style={{ display:"flex", gap:10, alignItems:"center" }}>
//               <div style={{ width:38, height:38, background:"rgba(255,255,255,0.07)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
//               <div><p style={{ color:"#6b7280", fontSize:10, fontWeight:700, letterSpacing:"0.5px", margin:0 }}>{lbl}</p><p style={{ color:"#fff", fontSize:13, fontWeight:600, margin:0 }}>{val}</p></div>
//             </div>
//           ))}
//         </div>
//         <div style={{ background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.18)", borderRadius:12, padding:"14px 18px", marginBottom:28 }}>
//           <p style={{ color:"#93c5fd", fontSize:13, lineHeight:1.6, margin:0 }}>The hiring team will review your performance and reach out with next steps.</p>
//         </div>
//         <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
//           <button onClick={onNew} style={{ padding:"11px 22px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", borderRadius:10, fontSize:13, cursor:"pointer" }}>🔄 New Interview</button>
//           <button onClick={()=>{ sessionStorage.clear(); window.location.href="/"; }} style={{ padding:"11px 26px", background:"#2563eb", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>Go Home</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── Main ────────────────────────────────────────────── */
// export default function InterviewPage() {
//   const navigate = useNavigate();

//   const jobTitle      = sessionStorage.getItem("interview_job_title")  ?? "the role";
//   const company       = sessionStorage.getItem("interview_company")    ?? "the company";
//   const candidateName = sessionStorage.getItem("interview_candidate")  ?? "Candidate";
//   const resumeId      = sessionStorage.getItem("interview_resume_id")  ?? "";
//   const resumeText    = sessionStorage.getItem("interview_resume_text") ?? "";

//   const [isVideoOn, setIsVideoOn]           = useState(true);
//   const [isMicOn, setIsMicOn]               = useState(true);
//   const [showTranscript, setShowTranscript] = useState(false);
//   const [isFullscreen, setIsFullscreen]     = useState(false);
//   const [elapsed, setElapsed]               = useState(0);
//   const [cameraReady, setCameraReady]       = useState(false);
//   const [cameraError, setCameraError]       = useState("");
//   const [complete, setComplete]             = useState(false);
//   const [showEndConfirm, setShowEndConfirm] = useState(false);
//   const [started, setStarted]               = useState(false);
//   const [recBlink, setRecBlink]             = useState(true);

//   const videoRef  = useRef<HTMLVideoElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const transRef  = useRef<HTMLDivElement>(null);
//   const timerRef  = useRef<ReturnType<typeof setInterval>|null>(null);

//   const agent = useElevenLabsAgent({
//     resumeId, resumeText, jobTitle, company, candidateName,
//     onSessionEnd: () => setComplete(true),
//     onError: (msg) => console.error("[Agent]", msg),
//   });

//   const isConnected  = agent.status === "connected";
//   const isConnecting = agent.status === "connecting" || agent.preparing;

//   /* webcam */
//   const startWebcam = useCallback(async () => {
//     try {
//       const s = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
//       streamRef.current = s;
//       if (videoRef.current) { videoRef.current.srcObject=s; videoRef.current.onloadedmetadata=()=>setCameraReady(true); }
//     } catch { setCameraError("Camera access denied."); }
//   }, []);
//   useEffect(()=>{ startWebcam(); return ()=>{ streamRef.current?.getTracks().forEach(t=>t.stop()); }; },[startWebcam]);

//   /* timer */
//   useEffect(()=>{
//     if (started){ timerRef.current=setInterval(()=>setElapsed(e=>e+1),1000); }
//     return()=>{ if(timerRef.current) clearInterval(timerRef.current); };
//   },[started]);

//   /* rec blink */
//   useEffect(()=>{ const id=setInterval(()=>setRecBlink(b=>!b),800); return()=>clearInterval(id); },[]);

//   /* scroll transcript */
//   useEffect(()=>{ if(transRef.current) transRef.current.scrollTop=transRef.current.scrollHeight; },[agent.transcript]);

//   function toggleMic(){ streamRef.current?.getAudioTracks().forEach(t=>{t.enabled=!t.enabled;}); setIsMicOn(p=>!p); }
//   function toggleVideo(){ streamRef.current?.getVideoTracks().forEach(t=>{t.enabled=!t.enabled;}); setIsVideoOn(p=>!p); }
//   function toggleFS(){ if(!document.fullscreenElement){ document.documentElement.requestFullscreen(); setIsFullscreen(true); } else { document.exitFullscreen(); setIsFullscreen(false); } }

//   async function handleStart(){ setStarted(true); await agent.startSession(); }
//   async function handleEnd(){
//     if(timerRef.current) clearInterval(timerRef.current);
//     streamRef.current?.getTracks().forEach(t=>t.stop());
//     await agent.endSession();
//     setComplete(true); setShowEndConfirm(false);
//   }

//   if(complete) return <CompletionScreen jobTitle={jobTitle} company={company} elapsed={elapsed} msgCount={agent.transcript.length} onNew={()=>{ sessionStorage.clear(); navigate("/"); }}/>;

//   return (
//     <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#0d1117", color:"#fff", fontFamily:"DM Sans,sans-serif", overflow:"hidden" }}>

//       {/* ── TOP BAR ─────────────────────────────────────── */}
//       <div style={{ height:52, background:"rgba(13,17,23,0.95)", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0, backdropFilter:"blur(12px)" }}>
//         {/* Left */}
//         <div style={{ display:"flex", alignItems:"center", gap:12 }}>
//           <div style={{ display:"flex", alignItems:"center", gap:7 }}>
//             <div style={{ width:8, height:8, borderRadius:"50%", background: recBlink&&started?"#ef4444":"#374151", transition:"background 0.3s" }}/>
//             <span style={{ fontSize:12, color: started?"#f87171":"#6b7280", fontWeight:600, letterSpacing:"0.5px" }}>{started?"REC":"READY"}</span>
//           </div>
//           <div style={{ width:1, height:18, background:"rgba(255,255,255,0.1)" }}/>
//           <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>HireReady Interview</span>
//           <span style={{ fontSize:11, padding:"3px 10px", borderRadius:99, background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)", color:"#60a5fa" }}>{jobTitle} · {company}</span>
//         </div>
//         {/* Center — status */}
//         <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//           {isConnecting && <span style={{ fontSize:12, padding:"4px 12px", borderRadius:99, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.3)", color:"#fbbf24" }}>⏳ Connecting AI…</span>}
//           {isConnected && agent.isSpeaking && <span style={{ fontSize:12, padding:"4px 12px", borderRadius:99, background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.3)", color:"#4ade80", animation:"blink 1.4s infinite" }}>🔊 AI Speaking</span>}
//           {isConnected && !agent.isSpeaking && <span style={{ fontSize:12, padding:"4px 12px", borderRadius:99, background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.3)", color:"#60a5fa" }}>🎙️ Listening</span>}
//         </div>
//         {/* Right */}
//         <div style={{ display:"flex", alignItems:"center", gap:16 }}>
//           <span style={{ fontFamily:"monospace", fontSize:14, fontWeight:700, color: elapsed>0?"#fff":"#6b7280" }}>{formatTime(elapsed)}</span>
//           <span style={{ fontSize:12, color:"#6b7280" }}>{new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
//         </div>
//       </div>

//       {/* ── VIDEO AREA ──────────────────────────────────── */}
//       <div style={{ flex:1, display:"flex", gap:12, padding:"14px 16px", overflow:"hidden", minHeight:0, position:"relative" }}>

//         {/* AI tile */}
//         <AITile speaking={isConnected && agent.isSpeaking} connecting={isConnecting} company={company}/>

//         {/* Candidate tile */}
//         <CandidateTile
//           videoRef={videoRef} cameraReady={cameraReady} isVideoOn={isVideoOn} isMicOn={isMicOn}
//           candidateName={candidateName} jobTitle={jobTitle} cameraError={cameraError} onAllowCamera={startWebcam}
//         />

//         {/* Start Interview overlay (before session starts) */}
//         {!started && (
//           <div style={{ position:"absolute", inset:"14px 16px", background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20 }}>
//             <div style={{ textAlign:"center" }}>
//               <p style={{ fontSize:22, fontWeight:800, color:"#fff", margin:"0 0 8px" }}>Ready for your interview?</p>
//               <p style={{ fontSize:14, color:"#9ca3af", margin:0 }}>Your AI interviewer will ask questions based on your resume</p>
//             </div>
//             <button onClick={handleStart} style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 36px", background:"linear-gradient(135deg,#059669,#10b981)", color:"#fff", border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 20px rgba(16,185,129,0.4)" }}>
//               🎙️ Start Interview
//             </button>
//             {agent.error && (
//               <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"10px 18px", maxWidth:360, textAlign:"center" }}>
//                 <p style={{ color:"#f87171", fontSize:13, margin:0 }}>⚠️ {agent.error}</p>
//                 <button onClick={handleStart} style={{ marginTop:10, padding:"7px 18px", background:"#2563eb", color:"#fff", border:"none", borderRadius:7, fontSize:12, cursor:"pointer" }}>🔄 Retry</button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Transcript floating panel */}
//         {showTranscript && (
//           <div style={{ position:"absolute", top:14, right:16, width:300, height:"calc(100% - 28px)", background:"rgba(17,24,39,0.96)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, display:"flex", flexDirection:"column", backdropFilter:"blur(12px)", zIndex:20 }}>
//             <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
//               <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>💬 Live Transcript</span>
//               <div style={{ display:"flex", gap:8 }}>
//                 <button onClick={agent.clearTranscript} style={{ fontSize:11, color:"#6b7280", background:"none", border:"none", cursor:"pointer" }}>Clear</button>
//                 <button onClick={()=>setShowTranscript(false)} style={{ fontSize:16, color:"#6b7280", background:"none", border:"none", cursor:"pointer", lineHeight:1 }}>×</button>
//               </div>
//             </div>
//             <div ref={transRef} style={{ flex:1, overflowY:"auto", padding:10, display:"flex", flexDirection:"column", gap:8 }}>
//               {agent.transcript.map(e=>(
//                 <div key={e.id} style={{ padding:"8px 11px", borderRadius:10, background: e.speaker==="you" ? "rgba(37,99,235,0.2)" : "rgba(34,197,94,0.12)", marginLeft: e.speaker==="you"?14:0, marginRight: e.speaker==="you"?0:14 }}>
//                   <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
//                     <span style={{ fontSize:10, fontWeight:700, color: e.speaker==="you"?"#60a5fa":"#4ade80" }}>{e.speaker==="you"?"You":"AI Interviewer"}</span>
//                     <span style={{ fontSize:10, color:"#6b7280" }}>{e.time}</span>
//                   </div>
//                   <p style={{ fontSize:12, color:"#e5e7eb", lineHeight:1.5, margin:0 }}>{e.text}</p>
//                 </div>
//               ))}
//               {agent.transcript.length===0 && <p style={{ color:"#4b5563", fontSize:12, textAlign:"center", marginTop:40 }}>Transcript appears here…</p>}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── ZOOM-STYLE CONTROL BAR ──────────────────────── */}
//       <div style={{ height:72, background:"rgba(13,17,23,0.98)", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>

//         {/* Left — session info */}
//         <div style={{ width:160 }}>
//           <p style={{ fontSize:12, color:"#6b7280", margin:0 }}>{company}</p>
//           <p style={{ fontSize:13, fontWeight:600, color:"#9ca3af", margin:0 }}>{jobTitle}</p>
//         </div>

//         {/* Center — controls */}
//         <div style={{ display:"flex", alignItems:"center", gap:6 }}>
//           {/* Mic */}
//           <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
//             <button onClick={toggleMic} style={{ width:48, height:48, borderRadius:12, border:"none", cursor:"pointer", fontSize:20, background: isMicOn?"rgba(255,255,255,0.1)":"#ef4444", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
//               {isMicOn ? "🎙️" : "🔇"}
//             </button>
//             <span style={{ fontSize:10, color:"#6b7280" }}>{isMicOn?"Mute":"Unmute"}</span>
//           </div>
//           {/* Camera */}
//           <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
//             <button onClick={toggleVideo} style={{ width:48, height:48, borderRadius:12, border:"none", cursor:"pointer", fontSize:20, background: isVideoOn?"rgba(255,255,255,0.1)":"#ef4444", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
//               {isVideoOn ? "📹" : "📷"}
//             </button>
//             <span style={{ fontSize:10, color:"#6b7280" }}>{isVideoOn?"Stop Video":"Start Video"}</span>
//           </div>
//           {/* Transcript */}
//           <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
//             <button onClick={()=>setShowTranscript(p=>!p)} style={{ width:48, height:48, borderRadius:12, border:"none", cursor:"pointer", fontSize:20, background: showTranscript?"#2563eb":"rgba(255,255,255,0.1)", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
//               💬
//             </button>
//             <span style={{ fontSize:10, color:"#6b7280" }}>Transcript</span>
//           </div>
//           {/* Fullscreen */}
//           <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
//             <button onClick={toggleFS} style={{ width:48, height:48, borderRadius:12, border:"none", cursor:"pointer", fontSize:20, background:"rgba(255,255,255,0.1)", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
//               {isFullscreen ? "⬛" : "⛶"}
//             </button>
//             <span style={{ fontSize:10, color:"#6b7280" }}>View</span>
//           </div>
//         </div>

//         {/* Right — End button */}
//         <div style={{ width:160, display:"flex", justifyContent:"flex-end" }}>
//           <button onClick={()=>setShowEndConfirm(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 22px", background:"#dc2626", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 12px rgba(220,38,38,0.4)" }}>
//             🚫 End Interview
//           </button>
//         </div>
//       </div>

//       {/* ── END CONFIRM DIALOG ──────────────────────────── */}
//       {showEndConfirm && (
//         <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
//           <div style={{ background:"#1f2937", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding:36, maxWidth:360, width:"90%", textAlign:"center", boxShadow:"0 24px 60px rgba(0,0,0,0.6)" }}>
//             <div style={{ fontSize:48, marginBottom:16 }}>🚫</div>
//             <p style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:8 }}>End the interview?</p>
//             <p style={{ fontSize:14, color:"#9ca3af", marginBottom:28 }}>Your responses so far will be saved.</p>
//             <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
//               <button onClick={()=>setShowEndConfirm(false)} style={{ padding:"11px 26px", background:"rgba(255,255,255,0.08)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", borderRadius:9, cursor:"pointer", fontSize:14 }}>Cancel</button>
//               <button onClick={handleEnd} style={{ padding:"11px 26px", background:"#dc2626", color:"#fff", border:"none", borderRadius:9, cursor:"pointer", fontSize:14, fontWeight:700 }}>End Interview</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes ripple { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.6);opacity:0} }
//         @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
//         @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
//         @keyframes spin   { to{transform:rotate(360deg)} }
//         ::-webkit-scrollbar{width:4px}
//         ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
//       `}</style>
//     </div>
//   );
// }
/**
 * InterviewPage — Zoom-style AI interview session.
 * Layout: Two large video tiles side-by-side, bottom control bar,
 * floating transcript panel, speaking indicators.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useElevenLabsAgent } from "../hooks/useElevenLabsAgent";

function formatTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
    : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}
function nowStr() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── AI Avatar tile ───────────────────────────────────── */
function AITile({ speaking, connecting, company }: { speaking: boolean; connecting: boolean; company: string }) {
  return (
    <div style={{
      flex: 1, position: "relative", background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",
      borderRadius: 16, overflow: "hidden", minHeight: 0,
      border: speaking ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.08)",
      transition: "border-color 0.3s",
      boxShadow: speaking ? "0 0 24px rgba(34,197,94,0.2)" : "none",
    }}>
      {/* Speaking ripples */}
      {speaking && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
          {[1,2,3].map(i=>(
            <div key={i} style={{
              position:"absolute", width:200+i*60, height:200+i*60, borderRadius:"50%",
              border:"1.5px solid rgba(34,197,94,0.3)",
              animation:`ripple ${0.9+i*0.3}s ease-out ${i*0.15}s infinite`,
            }}/>
          ))}
        </div>
      )}
      {/* Avatar */}
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{
          width:120, height:120, borderRadius:"50%",
          background: speaking ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
          border: `3px solid ${speaking ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all 0.3s",
        }}>
          {connecting
            ? <div style={{ fontSize:48, animation:"spin 1.2s linear infinite" }}>⏳</div>
            : <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="21" r="11" fill={speaking?"#22c55e":"#4b5563"}/>
                <path d="M9 52c0-11.6 9.4-21 21-21s21 9.4 21 21" stroke={speaking?"#22c55e":"#4b5563"} strokeWidth="3" strokeLinecap="round" fill="none"/>
              </svg>
          }
        </div>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontSize:18, fontWeight:700, color:"#fff", margin:0 }}>AI Interviewer</p>
          <p style={{ fontSize:13, color:"#6b7280", margin:"4px 0 0" }}>{company}</p>
          {speaking && <p style={{ fontSize:12, color:"#22c55e", marginTop:6, animation:"blink 1.2s infinite" }}>🔊 Speaking…</p>}
          {connecting && <p style={{ fontSize:12, color:"#fbbf24", marginTop:6 }}>Connecting…</p>}
        </div>
      </div>
      {/* Name badge */}
      <div style={{ position:"absolute", bottom:14, left:14, display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", borderRadius:8, padding:"5px 12px" }}>
          <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:0 }}>AI Interviewer</p>
        </div>
        {speaking && <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", animation:"blink 1s infinite" }}/>}
      </div>
      {/* Top label */}
      <div style={{ position:"absolute", top:14, right:14, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", borderRadius:6, padding:"3px 10px", fontSize:11, color:"#9ca3af" }}>
        AI Powered
      </div>
    </div>
  );
}

/* ── Candidate webcam tile ────────────────────────────── */
function CandidateTile({
  videoRef, cameraReady, isVideoOn, isMicOn, candidateName, jobTitle, cameraError, onAllowCamera,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraReady: boolean; isVideoOn: boolean; isMicOn: boolean;
  candidateName: string; jobTitle: string; cameraError: string;
  onAllowCamera: () => void;
}) {
  return (
    <div style={{
      flex: 1, position:"relative", background:"#111827",
      borderRadius:16, overflow:"hidden", minHeight:0,
      border: isMicOn ? "2px solid rgba(59,130,246,0.4)" : "2px solid rgba(255,255,255,0.08)",
      transition:"border-color 0.3s",
    }}>
      <video ref={videoRef} autoPlay playsInline muted
        style={{ width:"100%", height:"100%", objectFit:"cover", opacity: cameraReady&&isVideoOn ? 1:0, transition:"opacity 0.3s" }}
      />
      {(!cameraReady || !isVideoOn) && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, background:"#1f2937" }}>
          {cameraError
            ? <><div style={{ fontSize:56 }}>📷</div>
                <p style={{ color:"#f87171", fontSize:14, textAlign:"center", maxWidth:240, margin:0 }}>{cameraError}</p>
                <button onClick={onAllowCamera} style={{ padding:"9px 20px", background:"#2563eb", color:"#fff", border:"none", borderRadius:9, fontSize:13, cursor:"pointer", fontWeight:600 }}>Allow Camera</button>
              </>
            : !cameraReady
              ? <><div style={{ fontSize:56, animation:"pulse 1.5s infinite" }}>📷</div><p style={{ color:"#9ca3af", fontSize:14, margin:0 }}>Starting camera…</p></>
              : <><div style={{ fontSize:56 }}>📷</div><p style={{ color:"#9ca3af", fontSize:14, margin:0 }}>Camera paused</p></>
          }
        </div>
      )}
      {/* Name badge */}
      <div style={{ position:"absolute", bottom:14, left:14, display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)", borderRadius:8, padding:"5px 12px" }}>
          <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:0 }}>{candidateName}</p>
          <p style={{ fontSize:11, color:"#9ca3af", margin:0 }}>{jobTitle}</p>
        </div>
        {!isMicOn && <div style={{ background:"rgba(239,68,68,0.85)", borderRadius:6, padding:"3px 8px", fontSize:11, color:"#fff" }}>🔇 Muted</div>}
      </div>
      {/* Mic badge top-right */}
      <div style={{ position:"absolute", top:14, right:14, width:34, height:34, borderRadius:"50%", background: isMicOn?"rgba(34,197,94,0.8)":"rgba(239,68,68,0.8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
        {isMicOn ? "🎙️" : "🔇"}
      </div>
    </div>
  );
}

/* ── Completion screen ───────────────────────────────── */
function CompletionScreen({ jobTitle, company, elapsed, msgCount, onNew }:
  { jobTitle:string; company:string; elapsed:number; msgCount:number; onNew:()=>void }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f172a,#1e3a5f,#0f172a)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"DM Sans,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:500, textAlign:"center" }}>
        <div style={{ width:96, height:96, borderRadius:"50%", background:"rgba(34,197,94,0.15)", border:"2px solid #22c55e", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:48 }}>🏆</div>
        <h1 style={{ fontSize:32, fontWeight:800, color:"#fff", marginBottom:8 }}>Interview Complete!</h1>
        <p style={{ color:"#93c5fd", fontSize:15, marginBottom:32 }}>Your responses have been recorded. Great job!</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:24, marginBottom:20, textAlign:"left" }}>
          {[["💼","POSITION",jobTitle],["🏢","COMPANY",company],["⏱️","DURATION",formatTime(elapsed)],["💬","EXCHANGES",`${msgCount} messages`]].map(([icon,lbl,val])=>(
            <div key={lbl} style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:38, height:38, background:"rgba(255,255,255,0.07)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{icon}</div>
              <div><p style={{ color:"#6b7280", fontSize:10, fontWeight:700, letterSpacing:"0.5px", margin:0 }}>{lbl}</p><p style={{ color:"#fff", fontSize:13, fontWeight:600, margin:0 }}>{val}</p></div>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.18)", borderRadius:12, padding:"14px 18px", marginBottom:28 }}>
          <p style={{ color:"#93c5fd", fontSize:13, lineHeight:1.6, margin:0 }}>The hiring team will review your performance and reach out with next steps.</p>
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={onNew} style={{ padding:"11px 22px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", borderRadius:10, fontSize:13, cursor:"pointer" }}>🔄 New Interview</button>
          <button onClick={()=>{ sessionStorage.clear(); window.location.href="/"; }} style={{ padding:"11px 26px", background:"#2563eb", color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>Go Home</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────── */
export default function InterviewPage() {
  const navigate = useNavigate();

  const jobTitle      = sessionStorage.getItem("interview_job_title")  ?? "the role";
  const company       = sessionStorage.getItem("interview_company")    ?? "the company";
  const candidateName = sessionStorage.getItem("interview_candidate")  ?? "Candidate";
  const resumeId      = sessionStorage.getItem("interview_resume_id")  ?? "";
  const resumeText    = sessionStorage.getItem("interview_resume_text") ?? "";

  const [isVideoOn, setIsVideoOn]           = useState(true);
  const [isMicOn, setIsMicOn]               = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isFullscreen, setIsFullscreen]     = useState(false);
  const [elapsed, setElapsed]               = useState(0);
  const [cameraReady, setCameraReady]       = useState(false);
  const [cameraError, setCameraError]       = useState("");
  const [complete, setComplete]             = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [started, setStarted]               = useState(false);
  const [recBlink, setRecBlink]             = useState(true);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transRef  = useRef<HTMLDivElement>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval>|null>(null);

  const agent = useElevenLabsAgent({
    resumeId, resumeText, jobTitle, company, candidateName,
    onSessionEnd: () => setComplete(true),
    onDropped: () => console.warn("[Agent] Unexpected disconnect — showing reconnect UI"),
    onError: (msg) => console.error("[Agent]", msg),
  });

  const isConnected  = agent.status === "connected";
  const isConnecting = agent.status === "connecting" || agent.preparing;
  const isDropped    = agent.dropped && !isConnected && !isConnecting;

  /* webcam */
  const startWebcam = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject=s; videoRef.current.onloadedmetadata=()=>setCameraReady(true); }
    } catch { setCameraError("Camera access denied."); }
  }, []);
  useEffect(()=>{ startWebcam(); return ()=>{ streamRef.current?.getTracks().forEach(t=>t.stop()); }; },[startWebcam]);

  /* timer */
  useEffect(()=>{
    if (started){ timerRef.current=setInterval(()=>setElapsed(e=>e+1),1000); }
    return()=>{ if(timerRef.current) clearInterval(timerRef.current); };
  },[started]);

  /* rec blink */
  useEffect(()=>{ const id=setInterval(()=>setRecBlink(b=>!b),800); return()=>clearInterval(id); },[]);

  /* scroll transcript */
  useEffect(()=>{ if(transRef.current) transRef.current.scrollTop=transRef.current.scrollHeight; },[agent.transcript]);

  function toggleMic(){ streamRef.current?.getAudioTracks().forEach(t=>{t.enabled=!t.enabled;}); setIsMicOn(p=>!p); }
  function toggleVideo(){ streamRef.current?.getVideoTracks().forEach(t=>{t.enabled=!t.enabled;}); setIsVideoOn(p=>!p); }
  function toggleFS(){ if(!document.fullscreenElement){ document.documentElement.requestFullscreen(); setIsFullscreen(true); } else { document.exitFullscreen(); setIsFullscreen(false); } }

  async function handleStart(){ setStarted(true); await agent.startSession(); }
  async function handleEnd(){
    if(timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t=>t.stop());
    await agent.endSession();
    setComplete(true); setShowEndConfirm(false);
  }

  if(complete) return <CompletionScreen jobTitle={jobTitle} company={company} elapsed={elapsed} msgCount={agent.transcript.length} onNew={()=>{ sessionStorage.clear(); navigate("/"); }}/>;

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#0d1117", color:"#fff", fontFamily:"DM Sans,sans-serif", overflow:"hidden" }}>

      {/* ── TOP BAR ─────────────────────────────────────── */}
      <div style={{ height:52, background:"rgba(13,17,23,0.95)", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0, backdropFilter:"blur(12px)" }}>
        {/* Left */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background: recBlink&&started?"#ef4444":"#374151", transition:"background 0.3s" }}/>
            <span style={{ fontSize:12, color: started?"#f87171":"#6b7280", fontWeight:600, letterSpacing:"0.5px" }}>{started?"REC":"READY"}</span>
          </div>
          <div style={{ width:1, height:18, background:"rgba(255,255,255,0.1)" }}/>
          <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>HireReady Interview</span>
          <span style={{ fontSize:11, padding:"3px 10px", borderRadius:99, background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)", color:"#60a5fa" }}>{jobTitle} · {company}</span>
        </div>
        {/* Center — status */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {isConnecting && <span style={{ fontSize:12, padding:"4px 12px", borderRadius:99, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.3)", color:"#fbbf24" }}>⏳ Connecting AI…</span>}
          {isConnected && agent.isSpeaking && <span style={{ fontSize:12, padding:"4px 12px", borderRadius:99, background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.3)", color:"#4ade80", animation:"blink 1.4s infinite" }}>🔊 AI Speaking</span>}
          {isConnected && !agent.isSpeaking && <span style={{ fontSize:12, padding:"4px 12px", borderRadius:99, background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.3)", color:"#60a5fa" }}>🎙️ Listening</span>}
        </div>
        {/* Right */}
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontFamily:"monospace", fontSize:14, fontWeight:700, color: elapsed>0?"#fff":"#6b7280" }}>{formatTime(elapsed)}</span>
          <span style={{ fontSize:12, color:"#6b7280" }}>{new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
        </div>
      </div>

      {/* ── VIDEO AREA ──────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", gap:12, padding:"14px 16px", overflow:"hidden", minHeight:0, position:"relative" }}>

        {/* AI tile */}
        <AITile speaking={isConnected && agent.isSpeaking} connecting={isConnecting} company={company}/>

        {/* Candidate tile */}
        <CandidateTile
          videoRef={videoRef} cameraReady={cameraReady} isVideoOn={isVideoOn} isMicOn={isMicOn}
          candidateName={candidateName} jobTitle={jobTitle} cameraError={cameraError} onAllowCamera={startWebcam}
        />

        {/* Start Interview overlay (before session starts) */}
        {!started && (
          <div style={{ position:"absolute", inset:"14px 16px", background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20 }}>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:22, fontWeight:800, color:"#fff", margin:"0 0 8px" }}>Ready for your interview?</p>
              <p style={{ fontSize:14, color:"#9ca3af", margin:0 }}>Your AI interviewer will ask questions based on your resume</p>
            </div>
            <button onClick={handleStart} style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 36px", background:"linear-gradient(135deg,#059669,#10b981)", color:"#fff", border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 20px rgba(16,185,129,0.4)" }}>
              🎙️ Start Interview
            </button>
            {agent.error && (
              <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"10px 18px", maxWidth:360, textAlign:"center" }}>
                <p style={{ color:"#f87171", fontSize:13, margin:0 }}>⚠️ {agent.error}</p>
                <button onClick={handleStart} style={{ marginTop:10, padding:"7px 18px", background:"#2563eb", color:"#fff", border:"none", borderRadius:7, fontSize:12, cursor:"pointer" }}>🔄 Retry</button>
              </div>
            )}
          </div>
        )}


        {/* Dropped / reconnect banner */}
        {isDropped && (
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:"rgba(0,0,0,0.88)", backdropFilter:"blur(10px)", borderRadius:16, padding:"28px 36px", textAlign:"center", zIndex:30, border:"1px solid rgba(245,158,11,0.3)" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📡</div>
            <p style={{ fontSize:18, fontWeight:700, color:"#fff", marginBottom:6 }}>Connection dropped</p>
            <p style={{ fontSize:13, color:"#9ca3af", marginBottom:20 }}>The AI interviewer disconnected — your progress is saved.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={handleStart} style={{ padding:"10px 22px", background:"#2563eb", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}>🔄 Reconnect</button>
              <button onClick={()=>setShowEndConfirm(true)} style={{ padding:"10px 22px", background:"rgba(255,255,255,0.08)", color:"#fff", border:"1px solid rgba(255,255,255,0.2)", borderRadius:9, fontSize:13, cursor:"pointer" }}>End Interview</button>
            </div>
          </div>
        )}

        {/* Transcript floating panel */}
        {showTranscript && (
          <div style={{ position:"absolute", top:14, right:16, width:300, height:"calc(100% - 28px)", background:"rgba(17,24,39,0.96)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, display:"flex", flexDirection:"column", backdropFilter:"blur(12px)", zIndex:20 }}>
            <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>💬 Live Transcript</span>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={agent.clearTranscript} style={{ fontSize:11, color:"#6b7280", background:"none", border:"none", cursor:"pointer" }}>Clear</button>
                <button onClick={()=>setShowTranscript(false)} style={{ fontSize:16, color:"#6b7280", background:"none", border:"none", cursor:"pointer", lineHeight:1 }}>×</button>
              </div>
            </div>
            <div ref={transRef} style={{ flex:1, overflowY:"auto", padding:10, display:"flex", flexDirection:"column", gap:8 }}>
              {agent.transcript.map(e=>(
                <div key={e.id} style={{ padding:"8px 11px", borderRadius:10, background: e.speaker==="you" ? "rgba(37,99,235,0.2)" : "rgba(34,197,94,0.12)", marginLeft: e.speaker==="you"?14:0, marginRight: e.speaker==="you"?0:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:10, fontWeight:700, color: e.speaker==="you"?"#60a5fa":"#4ade80" }}>{e.speaker==="you"?"You":"AI Interviewer"}</span>
                    <span style={{ fontSize:10, color:"#6b7280" }}>{e.time}</span>
                  </div>
                  <p style={{ fontSize:12, color:"#e5e7eb", lineHeight:1.5, margin:0 }}>{e.text}</p>
                </div>
              ))}
              {agent.transcript.length===0 && <p style={{ color:"#4b5563", fontSize:12, textAlign:"center", marginTop:40 }}>Transcript appears here…</p>}
            </div>
          </div>
        )}
      </div>

      {/* ── ZOOM-STYLE CONTROL BAR ──────────────────────── */}
      <div style={{ height:72, background:"rgba(13,17,23,0.98)", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>

        {/* Left — session info */}
        <div style={{ width:160 }}>
          <p style={{ fontSize:12, color:"#6b7280", margin:0 }}>{company}</p>
          <p style={{ fontSize:13, fontWeight:600, color:"#9ca3af", margin:0 }}>{jobTitle}</p>
        </div>

        {/* Center — controls */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {/* Mic */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <button onClick={toggleMic} style={{ width:48, height:48, borderRadius:12, border:"none", cursor:"pointer", fontSize:20, background: isMicOn?"rgba(255,255,255,0.1)":"#ef4444", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {isMicOn ? "🎙️" : "🔇"}
            </button>
            <span style={{ fontSize:10, color:"#6b7280" }}>{isMicOn?"Mute":"Unmute"}</span>
          </div>
          {/* Camera */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <button onClick={toggleVideo} style={{ width:48, height:48, borderRadius:12, border:"none", cursor:"pointer", fontSize:20, background: isVideoOn?"rgba(255,255,255,0.1)":"#ef4444", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {isVideoOn ? "📹" : "📷"}
            </button>
            <span style={{ fontSize:10, color:"#6b7280" }}>{isVideoOn?"Stop Video":"Start Video"}</span>
          </div>
          {/* Transcript */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <button onClick={()=>setShowTranscript(p=>!p)} style={{ width:48, height:48, borderRadius:12, border:"none", cursor:"pointer", fontSize:20, background: showTranscript?"#2563eb":"rgba(255,255,255,0.1)", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
              💬
            </button>
            <span style={{ fontSize:10, color:"#6b7280" }}>Transcript</span>
          </div>
          {/* Fullscreen */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <button onClick={toggleFS} style={{ width:48, height:48, borderRadius:12, border:"none", cursor:"pointer", fontSize:20, background:"rgba(255,255,255,0.1)", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {isFullscreen ? "⬛" : "⛶"}
            </button>
            <span style={{ fontSize:10, color:"#6b7280" }}>View</span>
          </div>
        </div>

        {/* Right — End button */}
        <div style={{ width:160, display:"flex", justifyContent:"flex-end" }}>
          <button onClick={()=>setShowEndConfirm(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 22px", background:"#dc2626", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 12px rgba(220,38,38,0.4)" }}>
            🚫 End Interview
          </button>
        </div>
      </div>

      {/* ── END CONFIRM DIALOG ──────────────────────────── */}
      {showEndConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div style={{ background:"#1f2937", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding:36, maxWidth:360, width:"90%", textAlign:"center", boxShadow:"0 24px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🚫</div>
            <p style={{ fontSize:20, fontWeight:700, color:"#fff", marginBottom:8 }}>End the interview?</p>
            <p style={{ fontSize:14, color:"#9ca3af", marginBottom:28 }}>Your responses so far will be saved.</p>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button onClick={()=>setShowEndConfirm(false)} style={{ padding:"11px 26px", background:"rgba(255,255,255,0.08)", color:"#fff", border:"1px solid rgba(255,255,255,0.15)", borderRadius:9, cursor:"pointer", fontSize:14 }}>Cancel</button>
              <button onClick={handleEnd} style={{ padding:"11px 26px", background:"#dc2626", color:"#fff", border:"none", borderRadius:9, cursor:"pointer", fontSize:14, fontWeight:700 }}>End Interview</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ripple { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.6);opacity:0} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}
      `}</style>
    </div>
  );
}