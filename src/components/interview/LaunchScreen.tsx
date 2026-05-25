import { Database, FileText, Sparkles, Check, Loader2 } from 'lucide-react';
import type { LaunchStage } from '../../types/interview';

const STAGES = [
  { key: 'kb' as LaunchStage, icon: <Database size={20} />, label: 'Creating knowledge base...', color: '#2563eb' },
  { key: 'upload' as LaunchStage, icon: <FileText size={20} />, label: 'Uploading resume & JD content...', color: '#7c3aed' },
  { key: 'avatar' as LaunchStage, icon: <Sparkles size={20} />, label: 'Launching AI interviewer...', color: '#059669' },
];

interface Props { stage: LaunchStage; }

export function LaunchScreen({ stage }: Props) {
  const activeIndex = STAGES.findIndex(s => s.key === stage);
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e3a5f, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: '#2563eb', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Sparkles size={40} color="white" style={{ animation: 'pulse 1s infinite' }} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>Setting Up Your Interview</h2>
        <p style={{ color: '#93c5fd', fontSize: 14, marginBottom: 40 }}>Please wait while we configure everything for you</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {STAGES.map((s, i) => {
            const isDone = i < activeIndex, isActive = s.key === stage;
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, background: isActive ? 'rgba(255,255,255,0.15)' : isDone ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)', border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', opacity: !isActive && !isDone ? 0.4 : 1, transition: 'all 0.3s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? 'rgba(34,197,94,0.2)' : isActive ? `${s.color}33` : 'rgba(255,255,255,0.1)', color: isDone ? '#4ade80' : isActive ? s.color : 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                  {isDone ? <Check size={20} /> : isActive ? <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} /> : s.icon}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: isActive ? 'white' : isDone ? '#4ade80' : 'rgba(255,255,255,0.4)' }}>{isDone ? s.label.replace('...', ' ✓') : s.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa', animation: `bounce 1s ease ${i * 0.15}s infinite` }} />)}
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}
