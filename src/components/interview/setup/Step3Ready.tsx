import { Sparkles, User, Briefcase, Building2, FileText } from 'lucide-react';
import type { SetupForm } from '../../../types/interview';

interface Props {
  form: SetupForm; resumeFileName: string; hasJD: boolean;
  launchError: string; onStart: () => void; onBack: () => void;
}

export default function Step3Ready({ form, resumeFileName, hasJD, launchError, onStart, onBack }: Props) {
  const items = [
    { icon: <User className="w-4 h-4" />, label: 'Candidate', value: form.candidateName || 'Not set' },
    { icon: <Briefcase className="w-4 h-4" />, label: 'Position', value: form.position },
    { icon: <Building2 className="w-4 h-4" />, label: 'Company', value: form.company || 'Not set' },
    { icon: <FileText className="w-4 h-4" />, label: 'Resume', value: resumeFileName || 'No resume' },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Ready to Start</h2>
      <p className="text-gray-500 text-sm mb-6">Review your session details before launching</p>
      <div className="space-y-3 mb-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">{item.icon}</div>
            <div><p className="text-xs text-gray-400 font-medium">{item.label}</p><p className="text-sm text-gray-800 font-medium">{item.value}</p></div>
          </div>
        ))}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${hasJD ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{hasJD ? '✓' : '—'}</div>
          <div><p className="text-xs text-gray-400 font-medium">Job Description</p><p className="text-sm text-gray-800 font-medium">{hasJD ? 'Ready' : 'Not provided'}</p></div>
        </div>
      </div>
      {launchError && <p className="text-red-500 text-xs mb-4 p-3 bg-red-50 rounded-xl">{launchError}</p>}
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <p className="text-xs text-blue-600 font-medium mb-1">💡 Quick tips</p>
        <ul className="text-xs text-blue-500 space-y-1"><li>• Allow microphone and camera access when prompted</li><li>• Find a quiet, well-lit space</li><li>• Use Chrome or Edge for best speech recognition</li></ul>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">← Back</button>
        <button onClick={onStart} className="flex-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 justify-center">
          <Sparkles className="w-4 h-4" /> Launch Interview
        </button>
      </div>
    </div>
  );
}
