"use client";

import { useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function ScrollMoreButton() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const tickingRef = useRef(false);

  const handleClick = useCallback(() => {
    const first = document.querySelector(".section-card");
    first?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const update = () => {
      btn.classList.toggle("visible", window.scrollY < 80);
      tickingRef.current = false;
    };

    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      ref={btnRef}
      className="scroll-more-btn"
      onClick={handleClick}
      aria-label="Scroll to content"
    >
      <span>Scroll to explore</span>
      <FontAwesomeIcon
        icon={faChevronDown}
        className="text-xs animate-scroll-bounce"
      />
    </button>
  );
}
