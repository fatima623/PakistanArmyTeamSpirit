"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin route-change indicator — completes immediately (no artificial delay).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const isFirstPath = useRef(true);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    setVisible(true);
    setProgress(100);

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
      hideTimerRef.current = null;
    }, 100);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="navigation-progress"
      role="progressbar"
      aria-hidden
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="navigation-progress__bar"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  );
}
