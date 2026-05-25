/**
 * Step2JobListings — Job card grid with filter tabs and match scores.
 */

import { useEffect, useState } from "react";
import { fetchJobs } from "../../services/api";
import type { Job, FilterTab } from "../../types";

interface Props {
  resumeId: string | null;
  onNext: (job: Job) => void;
  onBack: () => void;
  toast: (icon: string, message: string) => void;
}

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "remote", label: "Remote" },
  { id: "fresher", label: "Fresher" },
  { id: "senior", label: "Senior" },
  { id: "mnc", label: "MNC" },
];

const AVATAR_COLORS: Record<string, string> = {
  blue: "av-blue", amber: "av-amber", rose: "av-rose",
  teal: "av-teal", violet: "av-violet", orange: "av-orange",
};

function matchClass(pct?: number) {
  if (!pct) return "match-lo";
  if (pct >= 75) return "match-hi";
  if (pct >= 55) return "match-mid";
  return "match-lo";
}

export default function Step2JobListings({ onNext, onBack, toast }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then((res) => {
        // Assign demo match percentages
        const withMatch = res.jobs.map((j, i) => ({
          ...j,
          match_percent: [87, 73, 38, 65, 79, 33][i] ?? 60,
        }));
        setJobs(withMatch);
        setFiltered(withMatch);
        setSelectedId(withMatch[0]?.id ?? 1);
      })
      .catch(() => toast("❌", "Could not load jobs"))
      .finally(() => setLoading(false));
  }, [toast]);

  function applyFilter(tab: FilterTab) {
    setActiveFilter(tab);
    setFiltered(
      tab === "all" ? jobs : jobs.filter((j) => j.filter_tags.includes(tab))
    );
  }

  function handleSelect(job: Job) {
    setSelectedId(job.id);
  }

  function handleNext() {
    const job = filtered.find((j) => j.id === selectedId) ?? filtered[0];
    if (!job) return;
    onNext(job);
  }

  return (
    <div className="step-panel active" id="step-2" style={{ maxWidth: "100%" }}>
      {/* Hero */}
      <div className="jl-hero">
        <div className="jl-hero-badge">AI-Powered Screening — Get Hired Faster</div>
        <h1 className="step-title" style={{ fontSize: 36, textAlign: "center" }}>
          Your Dream Job,<br />Screened by AI
        </h1>
        <p className="step-sub" style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
          Apply, get screened, receive an offer — all in under 30 minutes.
        </p>
        <div className="jl-stats-row">
          <div className="jl-stat-item"><span className="jl-stat-num">1,240+</span><div className="jl-stat-lbl">Live Jobs</div></div>
          <div className="jl-stat-item"><span className="jl-stat-num">94%</span><div className="jl-stat-lbl">Placement Rate</div></div>
          <div className="jl-stat-item"><span className="jl-stat-num">28 min</span><div className="jl-stat-lbl">Avg Hire Time</div></div>
        </div>
      </div>

      {/* Filters + count */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div className="filter-tabs">
          {FILTER_TABS.map((tab) => (
            <div
              key={tab.id}
              className={`ftab ${activeFilter === tab.id ? "active" : ""}`}
              onClick={() => applyFilter(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>Loading jobs…</div>
      ) : (
        <div className="job-grid">
          {filtered.map((job) => (
            <div
              key={job.id}
              className={`job-card ${selectedId === job.id ? "selected" : ""}`}
              onClick={() => handleSelect(job)}
            >
              <div className="jc-top">
                <div className={`jc-avatar ${AVATAR_COLORS[job.avatar_color] ?? ""}`}>
                  {job.avatar_initials}
                </div>
                <div className={`jc-match-pill ${matchClass(job.match_percent)}`}>
                  {job.match_percent}% Match
                </div>
              </div>
              <div className="jc-title">{job.title}</div>
              <div className="jc-company">{job.company}</div>
              <div className="jc-meta">
                <span className="jc-meta-item"><span className="jc-meta-icon">📍</span>{job.location}</span>
                <span className="jc-meta-item"><span className="jc-meta-icon">💰</span>{job.salary_range}</span>
                <span className="jc-meta-item"><span className="jc-meta-icon">🕐</span>{job.experience}</span>
              </div>
              <div className="jc-tags">
                {job.skills.map((s) => <span key={s} className="jc-tag">{s}</span>)}
              </div>
              <div className="jc-bottom">
                <span className="jc-applicants">
                  {job.applicants} applicants · {job.posted_days_ago}d ago
                </span>
                <button
                  className="jc-apply-btn"
                  onClick={(e) => { e.stopPropagation(); handleSelect(job); }}
                >
                  {selectedId === job.id ? "Selected ✓" : "Apply Now →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nav */}
      <div className="btn-row" style={{ maxWidth: 480, margin: "0 auto" }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={handleNext} disabled={filtered.length === 0}>
          View Job Details →
        </button>
      </div>
    </div>
  );
}
