/**
 * ErrorBoundary — catches unhandled render errors and shows a fallback UI
 * instead of a blank page. Wrap around top-level route components.
 */

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 20,
          padding: 32,
          textAlign: "center",
          background: "var(--black)",
          color: "var(--text)",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        <div style={{ fontSize: 56 }}>⚠️</div>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-sub)",
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          {this.state.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={this.handleReset}
          style={{
            padding: "12px 28px",
            background: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Return to Home
        </button>
      </div>
    );
  }
}
