// import Navbar from "../components/layout/Navbar";
// import StepProgress from "../components/ui/StepProgress";
// import Toast from "../components/ui/Toast";
// import Step1Upload from "../components/steps/Step1Upload";
// import Step2JobListings from "../components/steps/Step2JobListings";
// import Step3JobDetail from "../components/steps/Step3JobDetail";
// import Step4Verify from "../components/steps/Step4Verify";
// import Step5OTP from "../components/steps/Step5OTP";
// import Step6Launch from "../components/steps/Step6Launch";
// import { useWizard } from "../hooks/useWizard";
// import { useToast } from "../hooks/useToast";

// export default function OnboardingPage() {
//   const [state, actions] = useWizard();
//   const { toastState, toast } = useToast();
//   const { currentStep, resumeId, selectedJob, email, devOtp, sessionToken } = state;

//   return (
//     <div className="app">
//       <Navbar />
//       <StepProgress currentStep={currentStep} onStepClick={actions.goTo} />
//       <main className="main">
//         {currentStep === 1 && <Step1Upload onNext={actions.onResumeUploaded} toast={toast} />}
//         {currentStep === 2 && (
//           <Step2JobListings resumeId={resumeId} onNext={actions.onJobSelected} onBack={() => actions.goTo(1)} toast={toast} />
//         )}
//         {currentStep === 3 && selectedJob && (
//           <Step3JobDetail selectedJob={selectedJob} resumeId={resumeId} onNext={actions.onJobReviewed} onBack={() => actions.goTo(2)} toast={toast} />
//         )}
//         {currentStep === 4 && (
//           <Step4Verify onNext={actions.onOTPSent} onBack={() => actions.goTo(3)} toast={toast} />
//         )}
//         {currentStep === 5 && (
//           <Step5OTP email={email} prefillOtp={devOtp} onNext={actions.onOTPVerified} onBack={() => actions.goTo(4)} toast={toast} />
//         )}
//         {currentStep === 6 && (
//           <Step6Launch
//             selectedJob={selectedJob}
//             email={email}
//             sessionToken={sessionToken}
//             resumeId={resumeId}
//             toast={toast}
//           />
//         )}
//       </main>
//       <Toast state={toastState} />
//     </div>
//   );
// }
import Navbar from "../components/layout/Navbar";
import StepProgress from "../components/ui/StepProgress";
import Toast from "../components/ui/Toast";
import Step1Upload from "../components/steps/Step1Upload";
import Step2JobListings from "../components/steps/Step2JobListings";
import Step3JobDetail from "../components/steps/Step3JobDetail";
import Step4Verify from "../components/steps/Step4Verify";
import Step5OTP from "../components/steps/Step5OTP";
import Step6Launch from "../components/steps/Step6Launch";
import { useWizard } from "../hooks/useWizard";
import { useToast } from "../hooks/useToast";

export default function OnboardingPage() {
  const [state, actions] = useWizard();
  const { toastState, toast } = useToast();
  const { currentStep, resumeId, selectedJob, email, devOtp } = state;

  return (
    <div className="app">
      <Navbar />
      <StepProgress currentStep={currentStep} onStepClick={actions.goTo} />
      <main className="main">
        {currentStep === 1 && <Step1Upload onNext={actions.onResumeUploaded} toast={toast} />}
        {currentStep === 2 && (
          <Step2JobListings resumeId={resumeId} onNext={actions.onJobSelected} onBack={() => actions.goTo(1)} toast={toast} />
        )}
        {currentStep === 3 && selectedJob && (
          <Step3JobDetail selectedJob={selectedJob} resumeId={resumeId} onNext={actions.onJobReviewed} onBack={() => actions.goTo(2)} toast={toast} />
        )}
        {currentStep === 4 && (
          <Step4Verify onNext={actions.onOTPSent} onBack={() => actions.goTo(3)} toast={toast} />
        )}
        {currentStep === 5 && (
          <Step5OTP email={email} prefillOtp={devOtp} onNext={actions.onOTPVerified} onBack={() => actions.goTo(4)} toast={toast} />
        )}
        {currentStep === 6 && (
          <Step6Launch selectedJob={selectedJob} resumeId={resumeId} toast={toast} />
        )}
      </main>
      <Toast state={toastState} />
    </div>
  );
}