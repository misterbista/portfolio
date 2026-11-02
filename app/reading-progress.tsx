"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let frame = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const next = distance > 0 ? (window.scrollY / distance) * 100 : 100;
      setProgress(Math.min(100, Math.max(0, next)));
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    const handleScroll = () => {
      schedule();
      setIsScrolling(true);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsScrolling(false), 650);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
    };
  }, []);

  const percentage = Math.floor(progress);

  return (
    <div
      className="reading-ruler"
      data-scrolling={isScrolling}
      aria-hidden={!isScrolling}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      aria-valuetext={`${percentage}% of page read`}
    >
      <svg className="reading-ruler__scale" viewBox="0 0 8 104" fill="none" aria-hidden="true">
        <path className="reading-ruler__track" d="M4 4V100" />
        <path className="reading-ruler__fill" d={`M4 4V${4 + progress * 0.96}`} />
        <circle
          className="reading-ruler__marker"
          cx="4"
          cy="4"
          r="2"
          transform={`translate(0 ${progress * 0.96})`}
        />
      </svg>
      <span className="reading-ruler__value" aria-hidden="true">
        {percentage}%
      </span>
    </div>
  );
}
