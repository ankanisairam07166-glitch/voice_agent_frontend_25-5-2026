import { useNavigate } from "react-router-dom";
import type { Job } from "../../types";

interface Props {
  selectedJob: Job | null;
  resumeId?: string | null;
  parsedSkills?: string[];
  toast: (i: string, m: string) => void;
}

export default function Step6Launch({ selectedJob, resumeId, toast }: Props) {
  const navigate = useNavigate();

  function handleLaunch() {
    sessionStorage.setItem("interview_job_title",  selectedJob?.title   ?? "the role");
    sessionStorage.setItem("interview_company",    selectedJob?.company  ?? "the company");
    sessionStorage.setItem("interview_candidate",  "Candidate");
    sessionStorage.setItem("interview_resume_id",  resumeId ?? "");
    // resume_text is set by the upload step via a separate sessionStorage key
    toast("🚀", "Launching your interview session…");
    setTimeout(() => navigate("/interview"), 1200);
  }

  return (
    <div className="step-panel active" id="step-6">
      <div className="card">
        <div className="ready-center">
          <div className="ready-icon-wrap">🎯</div>
          <div className="step-tag" style={{ margin: "0 auto 16px" }}>All Set!</div>
          <h1 className="step-title" style={{ fontSize: 28 }}>
            You're interview-ready,<br />let's crush it!
          </h1>
          <p className="step-sub" style={{ maxWidth: 440, margin: "0 auto 24px" }}>
            Your session is personalised for the{" "}
            <strong style={{ color: "var(--text)" }}>
              {selectedJob?.title ?? "your selected role"}
            </strong>{" "}
            role at {selectedJob?.company ?? "the company"}.
            The AI interviewer has read your resume.
          </p>
        </div>

        <div className="ready-stats">
          <div className="ready-stat"><span className="ready-stat-num">10</span><span className="ready-stat-label">Questions</span></div>
          <div className="ready-stat"><span className="ready-stat-num">94%</span><span className="ready-stat-label">Resume match</span></div>
          <div className="ready-stat"><span className="ready-stat-num">~30</span><span className="ready-stat-label">Minutes est.</span></div>
        </div>

        <div className="tips-box">
          <div className="tips-title">💡 Quick tips before you start</div>
          <ul className="tips-list">
            <li>Allow microphone access when the browser asks</li>
            <li>Find a quiet space — the AI listens to your voice</li>
            <li>Use the STAR method for behavioural questions</li>
          </ul>
        </div>

        <button className="btn btn-success" onClick={handleLaunch} style={{ fontSize: 17, padding: "18px" }}>
          🚀 &nbsp; Launch My Interview Session
        </button>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Powered by <strong style={{ color: "var(--accent)" }}>ElevenLabs</strong> voice AI
          </span>
        </div>
      </div>
    </div>
  );
}
