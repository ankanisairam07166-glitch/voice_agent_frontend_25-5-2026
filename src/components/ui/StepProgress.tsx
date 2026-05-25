/**
 * StepProgress — 6-step horizontal progress indicator.
 * Shows completed (✓), active, and pending states.
 */

interface Props {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STEPS = ["Upload", "Match", "Review", "Verify", "OTP", "Launch"];

export default function StepProgress({ currentStep, onStepClick }: Props) {
  return (
    <div className="progress-bar-wrap">
      <div className="steps-track">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const isDone = num < currentStep;
          const isActive = num === currentStep;

          return (
            <div key={num} className="step-item" style={{ display: "flex", alignItems: "center", flex: num < STEPS.length ? 1 : undefined }}>
              {/* Dot */}
              <div
                className={`step-dot ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                onClick={() => num < currentStep && onStepClick(num)}
                style={{ cursor: num < currentStep ? "pointer" : "default" }}
              >
                {!isDone && <span className="step-num">{num}</span>}
                {isDone && "✓"}
                <span className="step-label">{label}</span>
              </div>

              {/* Connector line (not after last step) */}
              {num < STEPS.length && (
                <div className="step-line" style={{ flex: 1 }}>
                  <div
                    className="fill"
                    style={{ width: isDone ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
