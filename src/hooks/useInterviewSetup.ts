import { useState, useCallback } from 'react';
import type { SetupForm, InterviewData, LaunchStage } from '../types/interview';
import { uploadResume, startInterview } from '../services/api';

const INITIAL_FORM: SetupForm = { candidateName: '', position: '', company: '' };

export function useInterviewSetup(onSetupComplete: (data: InterviewData) => void) {
  const [form, setForm] = useState<SetupForm>(INITIAL_FORM);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');

  const [generatedJD, setGeneratedJD] = useState('');
  const [editedJD, setEditedJD] = useState('');
  const [isGeneratingJD, setIsGeneratingJD] = useState(false);
  const [jdError, setJdError] = useState('');

  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStage, setLaunchStage] = useState<LaunchStage>('kb');
  const [launchError, setLaunchError] = useState('');

  const updateForm = useCallback((updates: Partial<SetupForm>) => {
    setForm(f => ({ ...f, ...updates }));
  }, []);

  const handleResumeFile = useCallback(async (file: File) => {
    setResumeFile(file);
    setResumeError('');
    setIsParsingResume(true);
    try {
      const res = await uploadResume(file);
      setResumeText(res.parsed_skills.join(', '));
      if (!form.candidateName && res.filename) {
        const name = res.filename.replace(/\.(pdf|doc|docx)$/i, '').replace(/[_-]/g, ' ');
        updateForm({ candidateName: name });
      }
    } catch {
      setResumeError('Could not parse resume. You can continue without it.');
    } finally {
      setIsParsingResume(false);
    }
  }, [form.candidateName, updateForm]);

  const removeResume = useCallback(() => {
    setResumeFile(null);
    setResumeText('');
    setResumeError('');
  }, []);

  const generateJD = useCallback(async () => {
    if (!form.position.trim()) return;
    setIsGeneratingJD(true);
    setJdError('');
    try {
      // Generate a sensible JD template (swap for LLM call if needed)
      await new Promise(r => setTimeout(r, 1200));
      const jd = `Position: ${form.position}\nCompany: ${form.company || 'the company'}\n\nWe are looking for a talented ${form.position} to join our team.\n\nResponsibilities:\n• Design and implement solutions for core product challenges\n• Collaborate with cross-functional teams\n• Contribute to architecture and technical decisions\n• Mentor junior team members\n\nRequirements:\n• Proven experience as a ${form.position}\n• Strong problem-solving skills\n• Excellent communication and collaboration abilities\n• Passion for continuous learning`;
      setGeneratedJD(jd);
      setEditedJD(jd);
    } catch {
      setJdError('Failed to generate job description. Please write one manually.');
    } finally {
      setIsGeneratingJD(false);
    }
  }, [form.position, form.company]);

  const finalJD = editedJD || generatedJD;

  const handleStartInterview = useCallback(async () => {
    setIsLaunching(true);
    setLaunchError('');
    try {
      setLaunchStage('kb');
      await new Promise(r => setTimeout(r, 800));

      setLaunchStage('upload');
      await new Promise(r => setTimeout(r, 900));

      setLaunchStage('avatar');
      const sessionToken = sessionStorage.getItem('session_token') ?? 'demo-token';
      const res = await startInterview(1, form.position, 'resume-id', sessionToken).catch(() => null);

      const sessionId = res?.session_id ?? `local-${Date.now()}`;
      sessionStorage.setItem('interview_session_id', sessionId);
      sessionStorage.setItem('interview_job_title', form.position);

      await new Promise(r => setTimeout(r, 600));

      const data: InterviewData = {
        candidateName: form.candidateName || 'Candidate',
        position: form.position,
        company: form.company || 'the company',
        token: sessionToken,
        sessionId,
        resumeText,
        jobDescription: finalJD,
      };

      // Persist so InteractiveAvatarWrapper can reload it
      sessionStorage.setItem('interview_data', JSON.stringify(data));
      onSetupComplete(data);
    } catch (err) {
      setLaunchError('Failed to start interview. Please try again.');
      setIsLaunching(false);
    }
  }, [form, resumeText, finalJD, onSetupComplete]);

  return {
    form, updateForm,
    resumeFile, isParsingResume, handleResumeFile, removeResume, resumeError,
    generatedJD, editedJD, setEditedJD, isGeneratingJD, jdError, generateJD, finalJD,
    isLaunching, launchStage, launchError, handleStartInterview,
  };
}
