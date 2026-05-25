import { useState, useEffect } from 'react';
import InterviewSession from './InterviewSession';
import InterviewSetup from './InterviewSetup';
import { InterviewComplete } from './InterviewComplete';
import type { InterviewData } from '../../types/interview';

type AppState = 'checking' | 'setup' | 'interview' | 'complete';

export default function InteractiveAvatarWrapper() {
  const [appState, setAppState] = useState<AppState>('checking');
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcriptCount, setTranscriptCount] = useState(0);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('interview_data');
      if (raw) { setInterviewData(JSON.parse(raw)); setAppState('interview'); }
      else setAppState('setup');
    } catch { setAppState('setup'); }
  }, []);

  if (appState === 'checking') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (appState === 'setup') {
    return <InterviewSetup onSetupComplete={(data) => { setInterviewData(data); setAppState('interview'); }} />;
  }

  if (appState === 'complete') {
    return <InterviewComplete interviewData={interviewData} elapsedTime={elapsedTime} transcriptCount={transcriptCount} onStartNew={() => { sessionStorage.removeItem('interview_data'); sessionStorage.removeItem('interview_session_id'); setInterviewData(null); setElapsedTime(0); setTranscriptCount(0); setAppState('setup'); }} />;
  }

  return (
    <InterviewSession
      onInterviewComplete={(elapsed, count) => { setElapsedTime(elapsed); setTranscriptCount(count); setAppState('complete'); }}
    />
  );
}
