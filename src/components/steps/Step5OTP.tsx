/**
 * Step5OTP — 6-box OTP entry with auto-focus and countdown resend timer.
 * Accepts an optional `prefillOtp` (from dev_otp) to auto-fill and verify.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { verifyOTP, sendOTP } from "../../services/api";

interface Props {
  email: string;
  prefillOtp?: string;   // set in dev mode from Step4
  onNext: (sessionToken: string) => void;
  onBack: () => void;
  toast: (icon: string, message: string) => void;
}

const OTP_LEN = 6;

export default function Step5OTP({ email, prefillOtp, onNext, onBack, toast }: Props) {
  const [digits, setDigits] = useState<string[]>(
    prefillOtp ? prefillOtp.split("") : Array(OTP_LEN).fill("")
  );
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-verify if prefill was provided (dev mode)
  useEffect(() => {
    if (prefillOtp && prefillOtp.length === OTP_LEN) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startTimer() {
    setCountdown(30);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    try {
      const res = await sendOTP(email);
      if (res.dev_otp) {
        toast("🔑", `New OTP: ${res.dev_otp}`);
        const newDigits = res.dev_otp.split("");
        setDigits(newDigits);
      } else {
        toast("📨", "New OTP sent!");
        setDigits(Array(OTP_LEN).fill(""));
      }
      setStatus("idle");
      setStatusMsg("");
      startTimer();
      refs.current[0]?.focus();
    } catch {
      toast("❌", "Failed to resend OTP");
    }
  }

  function handleInput(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < OTP_LEN - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  const complete = digits.every((d) => d !== "");

  const handleVerify = useCallback(async () => {
    const code = digits.join("") || (prefillOtp ?? "");
    if (code.length !== OTP_LEN || loading) return;
    setLoading(true);
    try {
      const res = await verifyOTP(email, code);
      if (res.verified) {
        setStatus("success");
        setStatusMsg("✓ Verified successfully!");
        toast("🎉", "Identity verified!");
        setTimeout(() => onNext(res.session_token), 600);
      } else {
        setStatus("error");
        setStatusMsg("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setStatus("error");
      setStatusMsg(msg);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, email, loading]);

  // Auto-verify when all 6 digits filled manually
  useEffect(() => {
    if (complete && !prefillOtp) handleVerify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  return (
    <div className="step-panel active" id="step-5">
      <div className="step-tag">Step 05 — OTP</div>
      <h1 className="step-title">Enter your code</h1>
      <p className="step-sub">
        We sent a 6-digit code to{" "}
        <strong style={{ color: "var(--text)" }}>{email}</strong>.
        It expires in 2 minutes.
      </p>

      <div className="card">
        {/* Dev-mode OTP banner */}
        {prefillOtp && (
          <div style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--warn)", marginBottom: 6 }}>
              🛠 Dev Mode — OTP auto-filled
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: 10, color: "var(--warn)" }}>
              {prefillOtp}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-sub)", marginTop: 4 }}>
              Configure SMTP in <code style={{ color: "var(--accent)" }}>backend/.env</code> to send real emails
            </div>
          </div>
        )}

        {/* OTP boxes */}
        <div className="otp-wrap">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              className={`otp-box ${digit ? "filled" : ""}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        {/* Status */}
        <div style={{ textAlign: "center", marginBottom: 24, minHeight: 20 }}>
          {statusMsg && (
            <span style={{ fontSize: 13, color: status === "success" ? "var(--success)" : "#f87171" }}>
              {statusMsg}
            </span>
          )}
          {loading && !statusMsg && (
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Verifying…</span>
          )}
        </div>

        {/* Resend */}
        <div className="resend-wrap" style={{ marginBottom: 24 }}>
          Didn't get it?{" "}
          {canResend ? (
            <span className="resend-link" onClick={handleResend}>Resend code</span>
          ) : (
            <span className="otp-timer">Resend in <span>{countdown}</span>s</span>
          )}
        </div>

        <div className="btn-row">
          <button className="btn btn-outline btn-sm" onClick={onBack}>← Back</button>
          <button
            className="btn btn-primary"
            onClick={handleVerify}
            disabled={!complete || loading}
            style={{ opacity: !complete || loading ? 0.4 : 1, cursor: !complete || loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Verifying…" : "Verify & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
