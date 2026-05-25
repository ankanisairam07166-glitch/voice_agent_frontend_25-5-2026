/**
 * Step4Verify — collect email address and dispatch OTP.
 * In development mode the backend returns dev_otp; we display it
 * in a banner and auto-forward the user to Step 5.
 */

import { useState } from "react";
import { sendOTP } from "../../services/api";
import { isValidEmail } from "../../utils/validators";

type Provider = "gmail" | "outlook" | "other";

interface Props {
  onNext: (email: string, devOtp?: string) => void;
  onBack: () => void;
  toast: (icon: string, message: string) => void;
}

export default function Step4Verify({ onNext, onBack, toast }: Props) {
  const [provider, setProvider] = useState<Provider>("gmail");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = isValidEmail(email);

  async function handleSend() {
    if (!valid) return;
    setLoading(true);
    try {
      const res = await sendOTP(email);

      if (res.dev_otp) {
        // Dev mode — OTP returned in response, show it and auto-advance
        toast("🔑", `DEV MODE — Your OTP is: ${res.dev_otp}`);
        // Small delay so the user can read the toast
        setTimeout(() => onNext(email, res.dev_otp), 800);
      } else {
        toast("📨", `OTP sent to ${email}`);
        onNext(email);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP";
      toast("❌", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="step-panel active" id="step-4">
      <div className="step-tag">Step 04 — Verify</div>
      <h1 className="step-title">Verify your email</h1>
      <p className="step-sub">
        We'll send a one-time code to confirm your identity before launching
        your personalised interview session.
      </p>

      <div className="card">
        {/* Provider badges */}
        <div className="email-badges">
          {(["gmail", "outlook", "other"] as Provider[]).map((p) => (
            <div
              key={p}
              className={`email-badge ${provider === p ? "picked" : ""}`}
              onClick={() => setProvider(p)}
            >
              <span className="email-badge-icon">
                {p === "gmail" ? "📧" : p === "outlook" ? "📮" : "✉️"}
              </span>
              <span className="email-badge-name">
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Email input */}
        <div className="form-field">
          <label className="form-label">Email Address</label>
          <input
            className="form-input"
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && valid && handleSend()}
          />
        </div>

        {/* Dev mode notice */}
        <div style={{ padding: "12px 16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 12, color: "var(--text-sub)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--warn)" }}>Dev mode:</strong> SMTP is not configured.
            Your OTP will appear on screen automatically.
            To enable real email delivery, add <code style={{ color: "var(--accent)" }}>SMTP_USER</code> and{" "}
            <code style={{ color: "var(--accent)" }}>SMTP_PASSWORD</code> to <code style={{ color: "var(--accent)" }}>backend/.env</code>.
          </p>
        </div>

        <div className="btn-row">
          <button className="btn btn-outline btn-sm" onClick={onBack}>← Back</button>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!valid || loading}
            style={{ opacity: !valid || loading ? 0.4 : 1, cursor: !valid || loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Sending…" : "Send Code →"}
          </button>
        </div>
      </div>
    </div>
  );
}
