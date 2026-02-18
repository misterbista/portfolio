"use client";

import { useEffect, useRef, useCallback } from "react";
import { TIMING } from "@/lib/constants";

export default function GooglyEyes() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scheduleBlink = useCallback(() => {
    const delay =
      Math.random() * (TIMING.blinkDelayMax - TIMING.blinkDelayMin) +
      TIMING.blinkDelayMin;
    const timeout = setTimeout(() => {
      const eyes = containerRef.current?.querySelectorAll(".eye");
      eyes?.forEach((eye) => {
        eye.classList.add("blink");
        setTimeout(() => eye.classList.remove("blink"), TIMING.blinkDuration);
      });
      scheduleBlink();
    }, delay);
    return timeout;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      el.querySelectorAll(".pupil").forEach((pupil) => {
        const eye = pupil.parentElement!;
        const rect = eye.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        const maxDist = rect.width / 2 - 7;
        const dist = Math.min(
          maxDist,
          Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2) * 0.25
        );
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        (pupil as HTMLElement).style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
      });
    };

    const handleClick = (e: Event) => {
      const eye = (e.target as HTMLElement).closest(".eye");
      if (!eye) return;
      eye.classList.add("blink");
      setTimeout(() => eye.classList.remove("blink"), TIMING.blinkDuration);
      const pupil = eye.querySelector(".pupil") as HTMLElement;
      if (pupil) {
        pupil.style.transform = "translate(-50%, -60%)";
        setTimeout(() => {
          pupil.style.transform = "translate(-50%, -50%)";
        }, TIMING.pupilResetDelay);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("click", handleClick);
    const blinkTimeout = scheduleBlink();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("click", handleClick);
      clearTimeout(blinkTimeout);
    };
  }, [scheduleBlink]);

  return (
    <div className="googly-eyes" ref={containerRef}>
      <div className="eye">
        <div className="pupil" />
      </div>
      <div className="eye">
        <div className="pupil" />
      </div>
    </div>
  );
}
