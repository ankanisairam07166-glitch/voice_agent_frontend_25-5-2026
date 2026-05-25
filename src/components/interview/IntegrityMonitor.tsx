import { RefObject } from 'react';
import type { IntegritySettings, IntegrityViolation } from '../../types/interview';
interface Props { videoRef: RefObject<HTMLVideoElement>; token: string; enabled: boolean; settings: IntegritySettings; onViolation: (v: IntegrityViolation[]) => void; onTerminate: (reason: string) => void; }
export default function IntegrityMonitor({ enabled }: Props) { if (!enabled) return null; return null; }
