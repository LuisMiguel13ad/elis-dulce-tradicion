import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Hook that signs out the user and redirects to /login
 * after a period of inactivity (no mouse, keyboard, or touch events).
 */
export function useInactivityTimeout(timeoutMs: number = 15 * 60 * 1000) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastActivityRef = useRef<number>(Date.now());

  const handleTimeout = useCallback(async () => {
    toast.warning('Session expired due to inactivity');
    await signOut();
    navigate('/login', { replace: true });
  }, [signOut, navigate]);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    // Throttle: only reset if >30s since last activity reset
    if (now - lastActivityRef.current < 30000) return;
    lastActivityRef.current = now;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleTimeout, timeoutMs);
  }, [handleTimeout, timeoutMs]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    // Start the initial timer
    timerRef.current = setTimeout(handleTimeout, timeoutMs);

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer, handleTimeout, timeoutMs]);
}
