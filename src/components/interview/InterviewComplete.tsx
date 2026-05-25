import { CheckCircle, RotateCcw } from 'lucide-react';
import type { InterviewData } from '../../types/interview';

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}m ${s}s`;
}

interface Props {
  interviewData: InterviewData | null;
  elapsedTime: number;
  transcriptCount: number;
  onStartNew: () => void;
}

export function InterviewComplete({ interviewData, elapsedTime, transcriptCount, onStartNew }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e3a5f, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={48} color="#4ade80" />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 8 }}>Interview Complete!</h1>
        <p style={{ color: '#93c5fd', fontSize: 16, marginBottom: 32 }}>Thank you, {interviewData?.candidateName || 'Candidate'}!</p>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, textAlign: 'left' }}>
          {[
            { icon: '💼', label: 'POSITION', value: interviewData?.position || '-' },
            { icon: '🏢', label: 'COMPANY',  value: interviewData?.company || 'the company' },
            { icon: '⏱️', label: 'DURATION', value: formatDuration(elapsedTime) },
            { icon: '💬', label: 'EXCHANGES', value: `${transcriptCount} messages` },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.icon}</div>
              <div>
                <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>{s.label}</p>
                <p style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 32 }}>
          <p style={{ color: '#93c5fd', fontSize: 13, lineHeight: 1.6 }}>Your interview responses have been recorded. The hiring team will review your performance and reach out with next steps.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onStartNew} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <RotateCcw size={16} /> New Interview
          </button>
          <button onClick={() => { sessionStorage.clear(); window.location.href = '/'; }} style={{ padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
