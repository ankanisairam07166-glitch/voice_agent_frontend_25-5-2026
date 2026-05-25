// 'use client';
// import { useState, useEffect, useRef, useCallback } from 'react';
// import { Mic, MicOff, Video, VideoOff, MessageSquare, Maximize2, Volume2, PhoneOff } from 'lucide-react';
// import { Transcript } from './Transcript';
// import IntegrityMonitor from './IntegrityMonitor';
// import { submitAnswer } from '../../services/api';
// import type { Message, InterviewData } from '../../types/interview';

// interface Props {
//   onInterviewComplete: (elapsed: number, transcriptCount: number) => void;
// }

// const FALLBACK_QUESTIONS = [
//   "Hello! Welcome to your interview. Could you start by telling me a little about yourself?",
//   "What motivated you to apply for this position?",
//   "Describe a challenging project you've worked on and how you handled it.",
//   "How do you approach learning new technologies or skills?",
//   "Where do you see yourself professionally in the next 3 to 5 years?",
// ];

// function formatTime(secs: number) {
//   const h = String(Math.floor(secs / 3600)).padStart(2, '0');
//   const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
//   const s = String(secs % 60).padStart(2, '0');
//   return `${h}:${m}:${s}`;
// }

// function formatClock() {
//   return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
// }

// export default function InterviewSession({ onInterviewComplete }: Props) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isCameraOn, setIsCameraOn] = useState(true);
//   const [showTranscript, setShowTranscript] = useState(true);
//   const [isAISpeaking, setIsAISpeaking] = useState(false);
//   const [currentAIText, setCurrentAIText] = useState('');
//   const [elapsed, setElapsed] = useState(0);
//   const [clock, setClock] = useState(formatClock());
//   const [questionIndex, setQuestionIndex] = useState(0);
//   const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
//   const [isListening, setIsListening] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [integrityScore] = useState(0);

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const sessionId = sessionStorage.getItem('interview_session_id') ?? '';
//   const msgIdRef = useRef(0);

//   // ── Load interview data ─────────────────────────────────────────────────────
//   useEffect(() => {
//     try {
//       const raw = sessionStorage.getItem('interview_data');
//       if (raw) setInterviewData(JSON.parse(raw));
//     } catch { /* ignore */ }
//   }, []);

//   // ── Timer ───────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const t = setInterval(() => {
//       setElapsed(e => e + 1);
//       setClock(formatClock());
//     }, 1000);
//     return () => clearInterval(t);
//   }, []);

//   // ── Camera ──────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     async function startCamera() {
//       try {
//         const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         streamRef.current = s;
//         if (videoRef.current) videoRef.current.srcObject = s;
//       } catch { setIsCameraOn(false); }
//     }
//     startCamera();
//     return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
//   }, []);

//   const toggleCamera = useCallback(() => {
//     const track = streamRef.current?.getVideoTracks()[0];
//     if (track) { track.enabled = !track.enabled; setIsCameraOn(v => !v); }
//   }, []);

//   // ── Speech Synthesis (AI voice) ─────────────────────────────────────────────
//   const speak = useCallback((text: string, onEnd?: () => void) => {
//     if (!window.speechSynthesis) { onEnd?.(); return; }
//     window.speechSynthesis.cancel();
//     const u = new SpeechSynthesisUtterance(text);
//     u.rate = 0.95; u.pitch = 1; u.volume = 1;
//     const voices = window.speechSynthesis.getVoices();
//     const pref = voices.find(v => v.name.includes('Google') || v.lang.startsWith('en'));
//     if (pref) u.voice = pref;
//     u.onstart = () => { setIsAISpeaking(true); setCurrentAIText(text); };
//     u.onend = () => { setIsAISpeaking(false); setCurrentAIText(''); onEnd?.(); };
//     u.onerror = () => { setIsAISpeaking(false); setCurrentAIText(''); onEnd?.(); };
//     window.speechSynthesis.speak(u);
//   }, []);

//   const addMsg = useCallback((text: string, isUser: boolean) => {
//     const id = String(++msgIdRef.current);
//     const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
//     setMessages(m => [...m, { id, text, isUser, type: isUser ? 'user' : 'ai', timestamp }]);
//     return id;
//   }, []);

//   // ── Speech Recognition ──────────────────────────────────────────────────────
//   const startListening = useCallback(() => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert('Speech recognition not supported. Use Chrome or Edge.'); return; }
//     const r = new SR();
//     r.lang = 'en-IN'; r.continuous = false; r.interimResults = true;
//     r.onstart = () => setIsListening(true);
//     r.onresult = (e: SpeechRecognitionEvent) => {
//       const t = Array.from(e.results).map(r => r[0].transcript).join('');
//       setTranscript(t);
//     };
//     r.onend = async () => {
//       setIsListening(false);
//       setIsRecording(false);
//       const answer = transcript;
//       setTranscript('');
//       if (!answer.trim()) return;

//       addMsg(answer, true);

//       // Get AI response
//       let aiText = '';
//       try {
//         if (sessionId) {
//           const res = await submitAnswer(sessionId, answer);
//           aiText = res.feedback + (res.complete ? '' : ('\n\n' + (res.question ?? '')));
//           if (res.complete) {
//             speak(res.feedback ?? 'Thank you for completing the interview!', () => {
//               onInterviewComplete(elapsed, messages.length + 2);
//             });
//             addMsg(res.feedback ?? 'Interview complete!', false);
//             return;
//           }
//         } else {
//           const next = questionIndex + 1;
//           aiText = `Thanks for sharing that. ${FALLBACK_QUESTIONS[next] ?? 'That concludes our interview. Thank you!'}`;
//           if (next >= FALLBACK_QUESTIONS.length) {
//             speak(aiText, () => onInterviewComplete(elapsed, messages.length + 2));
//             addMsg(aiText, false);
//             return;
//           }
//           setQuestionIndex(next);
//         }
//       } catch {
//         aiText = FALLBACK_QUESTIONS[Math.min(questionIndex + 1, FALLBACK_QUESTIONS.length - 1)];
//         setQuestionIndex(q => Math.min(q + 1, FALLBACK_QUESTIONS.length - 1));
//       }

//       addMsg(aiText, false);
//       speak(aiText);
//     };
//     r.onerror = () => { setIsListening(false); setIsRecording(false); };
//     recognitionRef.current = r;
//     r.start();
//     setIsRecording(true);
//   }, [transcript, sessionId, questionIndex, elapsed, messages.length, addMsg, speak, onInterviewComplete]);

//   const stopListening = useCallback(() => {
//     recognitionRef.current?.stop();
//     setIsRecording(false);
//     setIsListening(false);
//   }, []);

//   const toggleMic = useCallback(() => {
//     if (isRecording) stopListening();
//     else startListening();
//   }, [isRecording, startListening, stopListening]);

//   // ── First question on mount ─────────────────────────────────────────────────
//   useEffect(() => {
//     const q = FALLBACK_QUESTIONS[0];
//     const timer = setTimeout(() => {
//       addMsg(q, false);
//       speak(q);
//     }, 800);
//     return () => clearTimeout(timer);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ── End interview ───────────────────────────────────────────────────────────
//   const handleEnd = useCallback(() => {
//     if (window.confirm('End the interview?')) {
//       window.speechSynthesis?.cancel();
//       recognitionRef.current?.stop();
//       streamRef.current?.getTracks().forEach(t => t.stop());
//       onInterviewComplete(elapsed, messages.length);
//     }
//   }, [elapsed, messages.length, onInterviewComplete]);

//   const candidateName = interviewData?.candidateName || sessionStorage.getItem('interview_job_title') || 'Candidate';
//   const position = interviewData?.position || sessionStorage.getItem('interview_job_title') || 'AI/ML';
//   const company = interviewData?.company || 'the company';

//   return (
//     <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>

//       {/* ── Top status bar ─────────────────────────────────────────────────── */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 20px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: '#94a3b8', flexShrink: 0 }}>
//         <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>🎯 AI Interview Session</span>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//           <span style={{ width: 8, height: 8, borderRadius: '50%', background: isCameraOn ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
//           <span>Camera {isCameraOn ? 'Ready' : 'Off'}</span>
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//           <span style={{ width: 8, height: 8, borderRadius: '50%', background: isAISpeaking ? '#22c55e' : '#475569', display: 'inline-block', animation: isAISpeaking ? 'pulse 1s infinite' : 'none' }} />
//           <span style={{ color: isAISpeaking ? '#4ade80' : '#94a3b8' }}>AI {isAISpeaking ? 'Speaking' : 'Idle'}</span>
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//           <span style={{ fontSize: 11 }}>Integrity</span>
//           <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
//             <div style={{ width: `${(integrityScore / 10) * 100}%`, height: '100%', background: '#22c55e', borderRadius: 99 }} />
//           </div>
//           <span style={{ fontSize: 11 }}>{integrityScore}/10</span>
//         </div>
//         <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
//           <span style={{ color: '#f59e0b', fontWeight: 600 }}>{formatTime(elapsed)}</span>
//           <span>{clock}</span>
//         </div>
//       </div>

//       {/* ── Main area ──────────────────────────────────────────────────────── */}
//       <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

//         {/* Left — AI panel */}
//         <div style={{ width: 280, background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, flexShrink: 0 }}>
//           {/* Animated audio circle */}
//           <div style={{ position: 'relative', width: 140, height: 140 }}>
//             {isAISpeaking && <>
//               {[0,1,2].map(i => (
//                 <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.3)', animation: `ripple 1.5s ease-out ${i * 0.4}s infinite` }} />
//               ))}
//             </>}
//             <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: isAISpeaking ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.1)', border: `3px solid ${isAISpeaking ? '#22c55e' : '#3b82f6'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
//               🔊
//             </div>
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>AI Interviewer</div>
//             <div style={{ color: '#94a3b8', fontSize: 13 }}>{company}</div>
//             {isAISpeaking && <div style={{ color: '#4ade80', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>🔊 Speaking...</div>}
//             {isListening && <div style={{ color: '#60a5fa', fontSize: 13, marginTop: 4 }}>🎤 Listening...</div>}
//           </div>
//           {/* Current AI speech text */}
//           {currentAIText && (
//             <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, maxHeight: 120, overflow: 'hidden', width: '100%' }}>
//               {currentAIText.slice(0, 200)}{currentAIText.length > 200 ? '…' : ''}
//             </div>
//           )}
//           {/* Live transcript bubble */}
//           {transcript && (
//             <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#93c5fd', lineHeight: 1.5, width: '100%' }}>
//               🎤 {transcript}
//             </div>
//           )}
//         </div>

//         {/* Center — Webcam */}
//         <div style={{ flex: 1, position: 'relative', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           {isCameraOn ? (
//             <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
//               <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👤</div>
//               <span style={{ color: '#94a3b8', fontSize: 14 }}>Camera off</span>
//             </div>
//           )}
//           {/* Name tag */}
//           <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '6px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//             <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{candidateName}</span>
//             <span style={{ color: '#94a3b8', fontSize: 11 }}>{position}</span>
//           </div>
//           {/* Integrity monitor (hidden) */}
//           <IntegrityMonitor videoRef={videoRef} token="" enabled={false} settings={{ maxViolations: 10, checkFacePresence: true, checkMultipleFaces: true }} onViolation={() => {}} onTerminate={() => {}} />
//         </div>

//         {/* Right — Transcript */}
//         {showTranscript && (
//           <div style={{ width: 300, background: '#1e293b', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
//             <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//               <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Live Transcript</span>
//               <button onClick={() => setMessages([])} style={{ color: '#94a3b8', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>Clear ×</button>
//             </div>
//             <div style={{ flex: 1, overflowY: 'auto' }}>
//               <Transcript messages={messages} />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Bottom controls ─────────────────────────────────────────────────── */}
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 24px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
//         {/* Mic */}
//         <button onClick={toggleMic} title={isRecording ? 'Stop recording' : 'Start recording'} style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)', color: isRecording ? '#ef4444' : '#94a3b8', transition: 'all 0.2s' }}>
//           {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
//         </button>
//         {/* Camera */}
//         <button onClick={toggleCamera} title={isCameraOn ? 'Turn camera off' : 'Turn camera on'} style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: !isCameraOn ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)', color: !isCameraOn ? '#ef4444' : '#94a3b8', transition: 'all 0.2s' }}>
//           {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
//         </button>
//         {/* Transcript toggle */}
//         <button onClick={() => setShowTranscript(v => !v)} title="Toggle transcript" style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: showTranscript ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)', color: showTranscript ? '#60a5fa' : '#94a3b8', transition: 'all 0.2s' }}>
//           <MessageSquare size={20} />
//         </button>
//         {/* Fullscreen */}
//         <button onClick={() => document.documentElement.requestFullscreen?.()} title="Fullscreen" style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', transition: 'all 0.2s' }}>
//           <Maximize2 size={20} />
//         </button>
//         {/* Volume */}
//         <button title="Volume" style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
//           <Volume2 size={20} />
//         </button>
//         {/* End interview */}
//         <button onClick={handleEnd} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#ef4444', hover: '#dc2626', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginLeft: 12 }}>
//           <PhoneOff size={18} /> End Interview
//         </button>
//       </div>

//       <style>{`
//         @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
//         @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
//       `}</style>
//     </div>
//   );
// }
'use client';

// ── Browser Speech Recognition types (not in all TS lib versions) ──────────
interface SpeechRecognition extends EventTarget {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void; abort(): void;
  onstart: ((e: Event) => void) | null;
  onend: ((e: Event) => void) | null;
  onerror: ((e: Event) => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
declare var SpeechRecognition: { new(): SpeechRecognition };
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, MessageSquare, Maximize2, Volume2, PhoneOff } from 'lucide-react';
import { Transcript } from './Transcript';
import IntegrityMonitor from './IntegrityMonitor';
import { submitAnswer } from '../../services/api';
import type { Message, InterviewData } from '../../types/interview';

interface Props {
  onInterviewComplete: (elapsed: number, transcriptCount: number) => void;
}

const FALLBACK_QUESTIONS = [
  "Hello! Welcome to your interview. Could you start by telling me a little about yourself?",
  "What motivated you to apply for this position?",
  "Describe a challenging project you've worked on and how you handled it.",
  "How do you approach learning new technologies or skills?",
  "Where do you see yourself professionally in the next 3 to 5 years?",
];

function formatTime(secs: number) {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatClock() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function InterviewSession({ onInterviewComplete }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showTranscript, setShowTranscript] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentAIText, setCurrentAIText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [clock, setClock] = useState(formatClock());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [integrityScore] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sessionId = sessionStorage.getItem('interview_session_id') ?? '';
  const msgIdRef = useRef(0);

  // ── Load interview data ─────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('interview_data');
      if (raw) setInterviewData(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(e => e + 1);
      setClock(formatClock());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Camera ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch { setIsCameraOn(false); }
    }
    startCamera();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  const toggleCamera = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsCameraOn(v => !v); }
  }, []);

  // ── Speech Synthesis (AI voice) ─────────────────────────────────────────────
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1; u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const pref = voices.find(v => v.name.includes('Google') || v.lang.startsWith('en'));
    if (pref) u.voice = pref;
    u.onstart = () => { setIsAISpeaking(true); setCurrentAIText(text); };
    u.onend = () => { setIsAISpeaking(false); setCurrentAIText(''); onEnd?.(); };
    u.onerror = () => { setIsAISpeaking(false); setCurrentAIText(''); onEnd?.(); };
    window.speechSynthesis.speak(u);
  }, []);

  const addMsg = useCallback((text: string, isUser: boolean) => {
    const id = String(++msgIdRef.current);
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { id, text, isUser, type: isUser ? 'user' : 'ai', timestamp }]);
    return id;
  }, []);

  // ── Speech Recognition ──────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Use Chrome or Edge.'); return; }
    const r = new SR();
    r.lang = 'en-IN'; r.continuous = false; r.interimResults = true;
    r.onstart = () => setIsListening(true);
    r.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results).map((res: SpeechRecognitionResult) => res[0].transcript).join('');
      setTranscript(t);
    };
    r.onend = async () => {
      setIsListening(false);
      setIsRecording(false);
      const answer = transcript;
      setTranscript('');
      if (!answer.trim()) return;

      addMsg(answer, true);

      // Get AI response
      let aiText = '';
      try {
        if (sessionId) {
          const res = await submitAnswer(sessionId, answer);
          aiText = res.feedback + (res.complete ? '' : ('\n\n' + (res.question ?? '')));
          if (res.complete) {
            speak(res.feedback ?? 'Thank you for completing the interview!', () => {
              onInterviewComplete(elapsed, messages.length + 2);
            });
            addMsg(res.feedback ?? 'Interview complete!', false);
            return;
          }
        } else {
          const next = questionIndex + 1;
          aiText = `Thanks for sharing that. ${FALLBACK_QUESTIONS[next] ?? 'That concludes our interview. Thank you!'}`;
          if (next >= FALLBACK_QUESTIONS.length) {
            speak(aiText, () => onInterviewComplete(elapsed, messages.length + 2));
            addMsg(aiText, false);
            return;
          }
          setQuestionIndex(next);
        }
      } catch {
        aiText = FALLBACK_QUESTIONS[Math.min(questionIndex + 1, FALLBACK_QUESTIONS.length - 1)];
        setQuestionIndex(q => Math.min(q + 1, FALLBACK_QUESTIONS.length - 1));
      }

      addMsg(aiText, false);
      speak(aiText);
    };
    r.onerror = () => { setIsListening(false); setIsRecording(false); };
    recognitionRef.current = r;
    r.start();
    setIsRecording(true);
  }, [transcript, sessionId, questionIndex, elapsed, messages.length, addMsg, speak, onInterviewComplete]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setIsListening(false);
  }, []);

  const toggleMic = useCallback(() => {
    if (isRecording) stopListening();
    else startListening();
  }, [isRecording, startListening, stopListening]);

  // ── First question on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const q = FALLBACK_QUESTIONS[0];
    const timer = setTimeout(() => {
      addMsg(q, false);
      speak(q);
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── End interview ───────────────────────────────────────────────────────────
  const handleEnd = useCallback(() => {
    if (window.confirm('End the interview?')) {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
      onInterviewComplete(elapsed, messages.length);
    }
  }, [elapsed, messages.length, onInterviewComplete]);

  const candidateName = interviewData?.candidateName || sessionStorage.getItem('interview_job_title') || 'Candidate';
  const position = interviewData?.position || sessionStorage.getItem('interview_job_title') || 'AI/ML';
  const company = interviewData?.company || 'the company';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>

      {/* ── Top status bar ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 20px', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: '#94a3b8', flexShrink: 0 }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>🎯 AI Interview Session</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isCameraOn ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
          <span>Camera {isCameraOn ? 'Ready' : 'Off'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isAISpeaking ? '#22c55e' : '#475569', display: 'inline-block', animation: isAISpeaking ? 'pulse 1s infinite' : 'none' }} />
          <span style={{ color: isAISpeaking ? '#4ade80' : '#94a3b8' }}>AI {isAISpeaking ? 'Speaking' : 'Idle'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11 }}>Integrity</span>
          <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
            <div style={{ width: `${(integrityScore / 10) * 100}%`, height: '100%', background: '#22c55e', borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 11 }}>{integrityScore}/10</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
          <span style={{ color: '#f59e0b', fontWeight: 600 }}>{formatTime(elapsed)}</span>
          <span>{clock}</span>
        </div>
      </div>

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left — AI panel */}
        <div style={{ width: 280, background: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, flexShrink: 0 }}>
          {/* Animated audio circle */}
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            {isAISpeaking && <>
              {[0,1,2].map(i => (
                <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(34,197,94,0.3)', animation: `ripple 1.5s ease-out ${i * 0.4}s infinite` }} />
              ))}
            </>}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: isAISpeaking ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.1)', border: `3px solid ${isAISpeaking ? '#22c55e' : '#3b82f6'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
              🔊
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>AI Interviewer</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>{company}</div>
            {isAISpeaking && <div style={{ color: '#4ade80', fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>🔊 Speaking...</div>}
            {isListening && <div style={{ color: '#60a5fa', fontSize: 13, marginTop: 4 }}>🎤 Listening...</div>}
          </div>
          {/* Current AI speech text */}
          {currentAIText && (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, maxHeight: 120, overflow: 'hidden', width: '100%' }}>
              {currentAIText.slice(0, 200)}{currentAIText.length > 200 ? '…' : ''}
            </div>
          )}
          {/* Live transcript bubble */}
          {transcript && (
            <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#93c5fd', lineHeight: 1.5, width: '100%' }}>
              🎤 {transcript}
            </div>
          )}
        </div>

        {/* Center — Webcam */}
        <div style={{ flex: 1, position: 'relative', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isCameraOn ? (
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👤</div>
              <span style={{ color: '#94a3b8', fontSize: 14 }}>Camera off</span>
            </div>
          )}
          {/* Name tag */}
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '6px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{candidateName}</span>
            <span style={{ color: '#94a3b8', fontSize: 11 }}>{position}</span>
          </div>
          {/* Integrity monitor (hidden) */}
          <IntegrityMonitor videoRef={videoRef} token="" enabled={false} settings={{ maxViolations: 10, checkFacePresence: true, checkMultipleFaces: true }} onViolation={() => {}} onTerminate={() => {}} />
        </div>

        {/* Right — Transcript */}
        {showTranscript && (
          <div style={{ width: 300, background: '#1e293b', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Live Transcript</span>
              <button onClick={() => setMessages([])} style={{ color: '#94a3b8', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>Clear ×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <Transcript messages={messages} />
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom controls ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 24px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        {/* Mic */}
        <button onClick={toggleMic} title={isRecording ? 'Stop recording' : 'Start recording'} style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)', color: isRecording ? '#ef4444' : '#94a3b8', transition: 'all 0.2s' }}>
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        {/* Camera */}
        <button onClick={toggleCamera} title={isCameraOn ? 'Turn camera off' : 'Turn camera on'} style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: !isCameraOn ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)', color: !isCameraOn ? '#ef4444' : '#94a3b8', transition: 'all 0.2s' }}>
          {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        {/* Transcript toggle */}
        <button onClick={() => setShowTranscript(v => !v)} title="Toggle transcript" style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: showTranscript ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)', color: showTranscript ? '#60a5fa' : '#94a3b8', transition: 'all 0.2s' }}>
          <MessageSquare size={20} />
        </button>
        {/* Fullscreen */}
        <button onClick={() => document.documentElement.requestFullscreen?.()} title="Fullscreen" style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', color: '#94a3b8', transition: 'all 0.2s' }}>
          <Maximize2 size={20} />
        </button>
        {/* Volume */}
        <button title="Volume" style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
          <Volume2 size={20} />
        </button>
        {/* End interview */}
        <button onClick={handleEnd} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginLeft: 12 }}>
          <PhoneOff size={18} /> End Interview
        </button>
      </div>

      <style>{`
        @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}