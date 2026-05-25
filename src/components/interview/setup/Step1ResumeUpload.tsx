import { useRef } from 'react';
import { FileText, X, Upload, Loader2 } from 'lucide-react';

interface Props {
  resumeFile: File | null;
  candidateName: string;
  isParsingResume: boolean;
  error: string;
  onFile: (f: File) => void;
  onRemove: () => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function Step1ResumeUpload({ resumeFile, isParsingResume, error, onFile, onRemove, onNext, onSkip, onBack }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Resume Upload</h2>
      <p className="text-gray-500 text-sm mb-6">Upload the candidate's resume to personalise questions</p>
      {resumeFile ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-green-600" /></div>
          <div className="flex-1"><p className="text-sm font-medium text-gray-800">{resumeFile.name}</p><p className="text-xs text-gray-500">{(resumeFile.size / 1024).toFixed(0)} KB</p></div>
          {isParsingResume ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <button onClick={onRemove} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all"><X className="w-4 h-4" /></button>}
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all mb-4">
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Drop resume here or click to browse</p>
          <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
        </div>
      )}
      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">← Back</button>
        <button onClick={onSkip} className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">Skip</button>
        <button onClick={onNext} disabled={!resumeFile || isParsingResume} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-all">Continue →</button>
      </div>
    </div>
  );
}
