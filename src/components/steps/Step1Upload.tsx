// /**
//  * Step1Upload — Drag-and-drop resume upload panel.
//  * On successful upload, calls onNext with the resume_id.
//  */

// import { useState, useRef, DragEvent, ChangeEvent } from "react";
// import { uploadResume } from "../../services/api";
// import { formatBytes } from "../../utils/validators";

// interface Props {
//   onNext: (resumeId: string, filename: string, skills: string[]) => void;
//   toast: (icon: string, message: string) => void;
// }

// export default function Step1Upload({ onNext, toast }: Props) {
//   const [dragging, setDragging] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const ACCEPTED = [".pdf", ".doc", ".docx"];

//   function handleDragOver(e: DragEvent) {
//     e.preventDefault();
//     setDragging(true);
//   }
//   function handleDragLeave() {
//     setDragging(false);
//   }
//   function handleDrop(e: DragEvent) {
//     e.preventDefault();
//     setDragging(false);
//     const dropped = e.dataTransfer.files[0];
//     if (dropped) selectFile(dropped);
//   }
//   function handleChange(e: ChangeEvent<HTMLInputElement>) {
//     const picked = e.target.files?.[0];
//     if (picked) selectFile(picked);
//   }

//   function selectFile(f: File) {
//     const ext = "." + f.name.split(".").pop()?.toLowerCase();
//     if (!ACCEPTED.includes(ext)) {
//       toast("❌", `Unsupported file type. Use PDF, DOC, or DOCX.`);
//       return;
//     }
//     setFile(f);
//     toast("✅", "Resume selected — click Analyse to continue.");
//   }

//   async function handleAnalyse() {
//     if (!file) return;
//     setLoading(true);
//     try {
//       const res = await uploadResume(file);
//       toast("✅", "Resume uploaded and analysed!");
//       sessionStorage.setItem("interview_resume_id", res.resume_id);
//       sessionStorage.setItem("interview_resume_text", res.parsed_skills.join(", "));
//       onNext(res.resume_id, res.filename, res.parsed_skills);
//     } catch (err: unknown) {
//       const msg = err instanceof Error ? err.message : "Upload failed";
//       toast("❌", msg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="step-panel active" id="step-1">
//       <div className="step-tag">Step 01 — Resume</div>
//       <h1 className="step-title">
//         Upload your resume<br />& let AI do the work
//       </h1>
//       <p className="step-sub">
//         Our AI analyses your skills, experience, and keywords to match you with
//         roles where you have the highest chance of success.
//       </p>

//       <div className="card">
//         {/* Drop zone */}
//         <div
//           className={`upload-zone ${dragging ? "drag" : ""}`}
//           onDragOver={handleDragOver}
//           onDragLeave={handleDragLeave}
//           onDrop={handleDrop}
//           onClick={() => inputRef.current?.click()}
//         >
//           <input
//             ref={inputRef}
//             type="file"
//             accept=".pdf,.doc,.docx"
//             onChange={handleChange}
//             style={{ display: "none" }}
//           />
//           <span className="upload-icon">📄</span>
//           <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
//             Drop your resume here
//           </div>
//           <div className="upload-hint">or click to browse your files</div>
//           <div className="upload-types">
//             {["PDF", "DOC", "DOCX"].map((t) => (
//               <span key={t} className="file-tag">{t}</span>
//             ))}
//           </div>
//         </div>

//         {/* File preview */}
//         {file && (
//           <div className="file-preview show">
//             <div className="file-icon-box">📑</div>
//             <div className="file-info">
//               <div className="file-name">{file.name}</div>
//               <div className="file-size">{formatBytes(file.size)} · Ready to analyse</div>
//             </div>
//             <div className="file-check">✅</div>
//           </div>
//         )}

//         <div className="btn-row">
//           <button
//             className="btn btn-primary"
//             onClick={handleAnalyse}
//             disabled={!file || loading}
//             style={{ opacity: !file || loading ? 0.4 : 1, cursor: !file || loading ? "not-allowed" : "pointer" }}
//           >
//             {loading ? "Analysing…" : "Analyse Resume →"}
//           </button>
//         </div>

//         {/* Privacy notice */}
//         <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
//           <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
//           <p style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.6 }}>
//             Your resume is encrypted and never shared with employers without your consent.
//             We use it only for job matching.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
/**
 * Step1Upload — Drag-and-drop resume upload panel.
 * On successful upload, calls onNext with the resume_id.
 */

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { uploadResume } from "../../services/api";
import { formatBytes } from "../../utils/validators";

interface Props {
  onNext: (resumeId: string, filename: string, skills: string[]) => void;
  toast: (icon: string, message: string) => void;
}

export default function Step1Upload({ onNext, toast }: Props) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED = [".pdf", ".doc", ".docx"];

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function handleDragLeave() {
    setDragging(false);
  }
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) selectFile(dropped);
  }
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) selectFile(picked);
  }

  function selectFile(f: File) {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      toast("❌", `Unsupported file type. Use PDF, DOC, or DOCX.`);
      return;
    }
    setFile(f);
    toast("✅", "Resume selected — click Analyse to continue.");
  }

  async function handleAnalyse() {
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadResume(file);
      toast("✅", "Resume uploaded and analysed!");
      sessionStorage.setItem("interview_resume_id", res.resume_id);
      sessionStorage.setItem("interview_resume_text", res.resume_text || res.parsed_skills.join(", "));
      onNext(res.resume_id, res.filename, res.parsed_skills);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast("❌", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="step-panel active" id="step-1">
      <div className="step-tag">Step 01 — Resume</div>
      <h1 className="step-title">
        Upload your resume<br />& let AI do the work
      </h1>
      <p className="step-sub">
        Our AI analyses your skills, experience, and keywords to match you with
        roles where you have the highest chance of success.
      </p>

      <div className="card">
        {/* Drop zone */}
        <div
          className={`upload-zone ${dragging ? "drag" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            style={{ display: "none" }}
          />
          <span className="upload-icon">📄</span>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
            Drop your resume here
          </div>
          <div className="upload-hint">or click to browse your files</div>
          <div className="upload-types">
            {["PDF", "DOC", "DOCX"].map((t) => (
              <span key={t} className="file-tag">{t}</span>
            ))}
          </div>
        </div>

        {/* File preview */}
        {file && (
          <div className="file-preview show">
            <div className="file-icon-box">📑</div>
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-size">{formatBytes(file.size)} · Ready to analyse</div>
            </div>
            <div className="file-check">✅</div>
          </div>
        )}

        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={handleAnalyse}
            disabled={!file || loading}
            style={{ opacity: !file || loading ? 0.4 : 1, cursor: !file || loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Analysing…" : "Analyse Resume →"}
          </button>
        </div>

        {/* Privacy notice */}
        <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>🔒</span>
          <p style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.6 }}>
            Your resume is encrypted and never shared with employers without your consent.
            We use it only for job matching.
          </p>
        </div>
      </div>
    </div>
  );
}