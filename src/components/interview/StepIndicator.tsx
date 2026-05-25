import { Check } from 'lucide-react';
interface Props { steps: string[]; currentStep: number; }
export function StepIndicator({ steps, currentStep }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
      {steps.map((step, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, transition: 'all 0.3s', background: index < currentStep ? '#22c55e' : index === currentStep ? '#2563eb' : '#f1f5f9', color: index <= currentStep ? 'white' : '#9ca3af', border: index === currentStep ? '4px solid #bfdbfe' : 'none' }}>
              {index < currentStep ? <Check size={16} /> : index + 1}
            </div>
            <span style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: index <= currentStep ? '#374151' : '#9ca3af', whiteSpace: 'nowrap' }}>{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div style={{ width: 64, height: 2, margin: '0 8px', marginBottom: 16, background: index < currentStep ? '#4ade80' : '#e5e7eb', transition: 'all 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  );
}
