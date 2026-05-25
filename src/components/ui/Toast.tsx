/** Toast notification overlay */

import type { ToastState } from "../../hooks/useToast";

interface Props {
  state: ToastState;
}

export default function Toast({ state }: Props) {
  return (
    <div className={`toast ${state.visible ? "show" : ""}`}>
      <span className="toast-icon">{state.icon}</span>
      <span>{state.message}</span>
    </div>
  );
}
