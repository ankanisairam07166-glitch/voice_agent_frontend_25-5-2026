import { Loader2, RefreshCw } from 'lucide-react';

interface Props {
  position: string; company: string; hasResume: boolean;
  generatedJD: string; editedJD: string; setEditedJD: (v: string) => void;
  isGenerating: boolean; error: string; onGenerate: () => void;
  onNext: () => void; onBack: () => void; finalJD: string;
}

export default function Step2JobDescription({ generatedJD, editedJD, setEditedJD, isGenerating, error, onGenerate, onNext, onBack, finalJD }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Job Description</h2>
      <p className="text-gray-500 text-sm mb-6">Review and edit the job description for tailored questions</p>
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Generating job description…</p>
        </div>
      ) : (
        <>
          <textarea value={editedJD} onChange={e => setEditedJD(e.target.value)} rows={10} placeholder="Job description will appear here…" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2" />
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          {!generatedJD && (
            <button onClick={onGenerate} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4 font-medium">
              <RefreshCw className="w-4 h-4" /> Generate JD
            </button>
          )}
        </>
      )}
      <div className="flex gap-3 mt-2">
        <button onClick={onBack} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">← Back</button>
        <button onClick={onNext} disabled={!finalJD.trim() || isGenerating} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-all">Continue →</button>
      </div>
    </div>
  );
}
