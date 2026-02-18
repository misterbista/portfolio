"use client";

import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const LOADING_COMPLETE_EVENT = "portfolio:loading-complete";

export default function ScrollMoreButton() {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    let cleanupInit: (() => void) | null = null;

    const init = () => {
      if (cleanupInit) return;

      const update = () => {
        btn.classList.toggle("visible", window.scrollY < 80);
      };

      const handleClick = () => {
        const first = document.querySelector(".section-card");
        if (first) first.scrollIntoView({ behavior: "smooth" });
      };

      btn.addEventListener("click", handleClick);
      window.addEventListener("scroll", update, { passive: true });
      update();

      cleanupInit = () => {
        btn.removeEventListener("click", handleClick);
        window.removeEventListener("scroll", update);
      };
    };

    const completeInit = () => {
      init();
    };

    if (document.documentElement.classList.contains("portfolio-session-loaded")) {
      completeInit();
    }

    window.addEventListener(LOADING_COMPLETE_EVENT, completeInit);

    return () => {
      window.removeEventListener(LOADING_COMPLETE_EVENT, completeInit);
      cleanupInit?.();
    };
  }, []);

  return (
    <button ref={btnRef} className="scroll-more-btn">
      <span>Scroll to know more</span>
      <FontAwesomeIcon
        icon={faChevronDown}
        className="text-xs animate-scroll-bounce"
      />
    </button>
  );
}
