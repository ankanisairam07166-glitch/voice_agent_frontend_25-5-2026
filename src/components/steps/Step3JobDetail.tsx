/**
 * Step3JobDetail — shows full job description and AI match score breakdown.
 */

import { useEffect, useState } from "react";
import { fetchJob, matchResumeToJob } from "../../services/api";
import type { Job, JobDetail, MatchScores } from "../../types";

interface Props {
  selectedJob: Job;
  resumeId: string | null;
  onNext: () => void;
  onBack: () => void;
  toast: (icon: string, message: string) => void;
}

function ScoreBar({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="score-row">
      <span className="score-key">{label}</span>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${value}%`, background: warn ? "var(--warn)" : "var(--success)" }}
        />
      </div>
      <span className="score-pct" style={{ color: warn ? "var(--warn)" : "var(--success)" }}>
        {value}%
      </span>
    </div>
  );
}

export default function Step3JobDetail({ selectedJob, resumeId, onNext, onBack }: Props) {
  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [scores, setScores] = useState<MatchScores>({ overall: 94, skills: 96, experience: 90, keywords: 88 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, m] = await Promise.all([
          fetchJob(selectedJob.id),
          resumeId
            ? matchResumeToJob(resumeId, selectedJob.id)
            : Promise.resolve({ overall: 94, skills: 96, experience: 90, keywords: 88 }),
        ]);
        setDetail(d);
        setScores(m);
      } catch {
        // fallback to seed data on API error
        setDetail({
          ...selectedJob,
          description: "Build and ship great products.",
          responsibilities: [
            "Own end-to-end design for core product flows",
            "Build and maintain scalable component systems",
            "Collaborate with PMs and engineers across squads",
            "Conduct user research and synthesise findings",
          ],
          requirements: [
            "3+ years of relevant professional experience",
            "Strong portfolio demonstrating shipped products",
            "Excellent communication and collaboration skills",
          ],
          skills_match: 96,
          experience_match: 90,
          keywords_match: 88,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedJob, resumeId]);

  if (loading) {
    return (
      <div className="step-panel active">
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
          Analysing job match…
        </div>
      </div>
    );
  }

  const job = detail ?? selectedJob;

  return (
    <div className="step-panel active" id="step-3">
      <div className="step-tag">Step 03 — Job Detail</div>
      <h1 className="step-title">Review the role</h1>
      <p className="step-sub">
        Understand the requirements so our AI can tailor your interview questions perfectly.
      </p>

      <div className="card">
        {/* Header */}
        <div className="jd-header">
          <div className="jd-logo">🏢</div>
          <div>
            <div className="jd-company">{job.company} · {job.location} · Full-time</div>
            <div className="jd-title-big">{job.title}</div>
            <div className="jd-tags">
              {job.skills.map((s) => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        </div>

        {/* Match score */}
        <div className="jd-score-bar">
          <div className="score-circle">
            <span className="score-num">{scores.overall}</span>
            <span className="score-label">MATCH</span>
          </div>
          <div className="score-details">
            <ScoreBar label="Skills" value={scores.skills} />
            <ScoreBar label="Experience" value={scores.experience} />
            <ScoreBar label="Keywords" value={scores.keywords} warn={scores.keywords < 80} />
          </div>
        </div>

        {/* Responsibilities */}
        {"responsibilities" in job && (
          <div className="jd-section">
            <div className="jd-section-title">Key Responsibilities</div>
            <ul className="jd-list">
              {(job as JobDetail).responsibilities.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {"requirements" in job && (
          <div className="jd-section">
            <div className="jd-section-title">Must Have</div>
            <ul className="jd-list">
              {(job as JobDetail).requirements.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="btn-row">
          <button className="btn btn-outline btn-sm" onClick={onBack}>← Back</button>
          <button className="btn btn-primary" onClick={onNext}>
            I'm Ready — Verify Email →
          </button>
        </div>
      </div>
    </div>
  );
}
