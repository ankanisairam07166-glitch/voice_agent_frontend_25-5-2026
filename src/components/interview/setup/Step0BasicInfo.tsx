import type { SetupForm } from '../../../types/interview';

interface Props {
  form: SetupForm;
  onChange: (u: Partial<SetupForm>) => void;
  onNext: () => void;
  error: string;
}

export default function Step0BasicInfo({ form, onChange, onNext, error }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Basic Information</h2>
      <p className="text-gray-500 text-sm mb-6">Tell us about the role and candidate</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
          <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Sairam" value={form.candidateName} onChange={e => onChange({ candidateName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Position / Role <span className="text-red-500">*</span></label>
          <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Frontend Developer" value={form.position} onChange={e => onChange({ position: e.target.value })} onKeyDown={e => e.key === 'Enter' && onNext()} />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. TCS iON" value={form.company} onChange={e => onChange({ company: e.target.value })} />
        </div>
      </div>
      <button onClick={onNext} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all">Continue →</button>
    </div>
  );
}
