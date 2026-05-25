/**
 * App.tsx — root component with React Router routes and ErrorBoundary.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import OnboardingPage from "./pages/OnboardingPage";
import InterviewPage from "./pages/InterviewPage";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "DM Sans, sans-serif", background: "var(--black)", color: "var(--text)" }}>
                <div style={{ fontSize: 64 }}>🔍</div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 24 }}>Page not found</h2>
                <a href="/" style={{ color: "var(--accent)", fontSize: 14 }}>← Back to home</a>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
