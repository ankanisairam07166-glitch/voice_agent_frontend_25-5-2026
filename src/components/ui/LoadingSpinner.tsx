/**
 * LoadingSpinner — simple animated CSS ring with optional label.
 */

interface Props {
  label?: string;
  size?: number;
}

export default function LoadingSpinner({ label = "Loading…", size = 40 }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--accent)",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {label && (
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
      )}
    </div>
  );
}
