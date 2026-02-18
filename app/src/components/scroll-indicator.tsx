"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const INDICATOR_HIDE_DELAY = 1500;

export default function ScrollIndicator() {
  const [sectionCount, setSectionCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollTo = useCallback((index: number) => {
    const sections = document.querySelectorAll(".section-card");
    sections[index]?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    function findSections() {
      const sections = document.querySelectorAll(".section-card");
      if (sections.length > 0) {
        setSectionCount(sections.length);
        return true;
      }
      return false;
    }

    // Try immediately, poll if not found
    if (!findSections()) {
      const interval = setInterval(() => {
        if (findSections()) clearInterval(interval);
      }, 200);
      const timeout = setTimeout(() => clearInterval(interval), 5000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  useEffect(() => {
    if (sectionCount === 0) return;

    const scheduleHide = () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, INDICATOR_HIDE_DELAY);
    };

    const update = () => {
      const sections = document.querySelectorAll(".section-card");
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 10;

      if (isBottom) {
        setActiveIndex(sections.length - 1);
        return;
      }

      let minDist = Infinity;
      let current = 0;
      sections.forEach((s, i) => {
        const dist = Math.abs(s.getBoundingClientRect().top);
        if (dist < minDist) {
          minDist = dist;
          current = i;
        }
      });
      setActiveIndex(current);
    };

    const onScroll = () => {
      setIsVisible(true);
      update();
      scheduleHide();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [sectionCount]);

  if (sectionCount === 0) return null;

  return (
    <div className={`scroll-indicator${isVisible ? " is-visible" : ""}`}>
      {Array.from({ length: sectionCount }, (_, i) => (
        <div
          key={i}
          className={`scroll-dot${i === activeIndex ? " active" : ""}`}
          onClick={() => scrollTo(i)}
        />
      ))}
    </div>
  );
}
