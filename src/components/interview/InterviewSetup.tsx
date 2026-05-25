import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { StepIndicator } from './StepIndicator';
import { LaunchScreen } from './LaunchScreen';
import Step0BasicInfo from './setup/Step0BasicInfo';
import Step1ResumeUpload from './setup/Step1ResumeUpload';
import Step2JobDescription from './setup/Step2JobDescription';
import Step3Ready from './setup/Step3Ready';
import { useInterviewSetup } from '../../hooks/useInterviewSetup';
import type { InterviewData } from '../../types/interview';

const STEPS = ['Basic Info', 'Resume Upload', 'Job Description', 'Ready'] as const;

interface Props { onSetupComplete: (data: InterviewData) => void; }

export default function InterviewSetup({ onSetupComplete }: Props) {
  const [step, setStep] = useState(0);
  const [step0Error, setStep0Error] = useState('');

  const {
    form, updateForm,
    resumeFile, isParsingResume, handleResumeFile, removeResume, resumeError,
    generatedJD, editedJD, setEditedJD, isGeneratingJD, jdError, generateJD, finalJD,
    isLaunching, launchStage, launchError, handleStartInterview,
  } = useInterviewSetup(onSetupComplete);

  useEffect(() => {
    if (step === 2 && !generatedJD && !isGeneratingJD && form.position.trim()) {
      generateJD();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const goBack = () => setStep(s => Math.max(s - 1, 0));

  const handleStep0Next = () => {
    if (!form.position.trim()) { setStep0Error('Please enter the job position.'); return; }
    setStep0Error(''); setStep(1);
  };

  if (isLaunching) return <LaunchScreen stage={launchStage} />;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e3a5f, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: '#2563eb', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Sparkles size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 4 }}>AI Interview Setup</h1>
          <p style={{ color: '#93c5fd', fontSize: 14 }}>Configure your session in minutes</p>
        </div>

        <StepIndicator steps={[...STEPS]} currentStep={step} />

        <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
          <div style={{ padding: 32 }}>
            {step === 0 && <Step0BasicInfo form={form} onChange={updateForm} onNext={handleStep0Next} error={step0Error} />}
            {step === 1 && <Step1ResumeUpload resumeFile={resumeFile} candidateName={form.candidateName} isParsingResume={isParsingResume} error={resumeError} onFile={handleResumeFile} onRemove={removeResume} onNext={() => setStep(2)} onSkip={() => setStep(2)} onBack={goBack} />}
            {step === 2 && <Step2JobDescription position={form.position} company={form.company} hasResume={!!resumeFile} generatedJD={generatedJD} editedJD={editedJD} setEditedJD={setEditedJD} isGenerating={isGeneratingJD} error={jdError} onGenerate={generateJD} onNext={() => { if (!isGeneratingJD && finalJD.trim()) setStep(3); }} onBack={goBack} finalJD={finalJD} />}
            {step === 3 && <Step3Ready form={form} resumeFileName={resumeFile?.name ?? ''} hasJD={!!finalJD.trim()} launchError={launchError} onStart={async () => { await handleStartInterview(); }} onBack={goBack} />}
          </div>
          <div style={{ height: 4, background: '#f1f5f9' }}>
            <div style={{ height: '100%', background: '#2563eb', width: `${((step + 1) / STEPS.length) * 100}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
