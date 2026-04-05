"use client";

import { useEffect, useRef, useCallback } from "react";

export default function ReadingProgress() {
  const trackRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const ticking = useRef(false);
  const lastPercent = useRef(-1);

  const update = useCallback(() => {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const p = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
    const rounded = Math.round(p * 100);

    trackRef.current?.style.setProperty("--progress", `${p}`);

    if (rounded !== lastPercent.current) {
      lastPercent.current = rounded;
      if (countRef.current) {
        countRef.current.textContent = `${rounded}%`;
      }
    }

    ticking.current = false;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => window.removeEventListener("scroll", onScroll);
  }, [update]);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div ref={trackRef} className="reading-progress__track" />
      <span ref={countRef} className="reading-progress__count">0%</span>
    </div>
  );
}
