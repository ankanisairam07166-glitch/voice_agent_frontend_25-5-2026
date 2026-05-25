/**
 * useToast — lightweight toast notification hook.
 * Exposes a `toast(icon, message)` helper and the current toast state.
 */

import { useState, useCallback, useRef } from "react";

export interface ToastState {
  icon: string;
  message: string;
  visible: boolean;
}

export function useToast() {
  const [state, setState] = useState<ToastState>({
    icon: "",
    message: "",
    visible: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((icon: string, message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({ icon, message, visible: true });
    timerRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  return { toastState: state, toast };
}
