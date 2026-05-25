import type { Message } from '../../types/interview';
interface Props { messages: Message[]; }
export function Transcript({ messages }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, overflowY: 'auto', height: '100%' }}>
      {messages.map(m => (
        <div key={m.id} style={{ display: 'flex', justifyContent: m.isUser ? 'flex-end' : 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 2, textAlign: m.isUser ? 'right' : 'left' }}>{m.isUser ? 'You' : 'AI Interviewer'} · {m.timestamp}</div>
            <div style={{ maxWidth: 220, borderRadius: 16, padding: '8px 14px', fontSize: 13, lineHeight: 1.4, background: m.type === 'system' ? 'rgba(100,116,139,0.3)' : m.isUser ? '#2563eb' : '#334155', color: m.type === 'system' ? '#94a3b8' : 'white', fontStyle: m.type === 'system' ? 'italic' : 'normal' }}>
              {m.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
