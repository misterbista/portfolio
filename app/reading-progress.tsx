"use client";

import { useEffect, useState } from "react";

const ticks = Array.from({ length: 21 }, (_, index) => index);

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let frame = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
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
    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", schedule);
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
      <span className="reading-ruler__caption" aria-hidden="true">Read</span>
      <svg className="reading-ruler__scale" viewBox="0 0 28 212" fill="none" aria-hidden="true">
        <path className="reading-ruler__track" d="M8 6V206" />
        <path className="reading-ruler__fill" d={`M8 6V${6 + progress * 2}`} />
        {ticks.map((tick) => (
          <path
            key={tick}
            className={tick * 5 <= progress ? "reading-ruler__tick is-read" : "reading-ruler__tick"}
            d={`M14 ${6 + tick * 10}H${tick % 5 === 0 ? 26 : 20}`}
          />
        ))}
        <path
          className="reading-ruler__marker"
          d="M8 -4L11 0L8 4L5 0Z"
          transform={`translate(0 ${6 + progress * 2})`}
        />
      </svg>
      <span className="reading-ruler__value" aria-hidden="true">
        {percentage === 100 ? "Fin." : `${String(percentage).padStart(2, "0")}%`}
      </span>
    </div>
  );
}
