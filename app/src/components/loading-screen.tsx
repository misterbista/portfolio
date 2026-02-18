"use client";

import { useState, useEffect, useCallback } from "react";
import TerminalAnimation from "./terminal-animation";
import { TIMING } from "@/lib/constants";

const SESSION_KEY = "portfolio-loaded";
const LOADING_COMPLETE_EVENT = "portfolio:loading-complete";

export default function LoadingScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const markLoadingComplete = useCallback(() => {
    document.documentElement.classList.add("portfolio-session-loaded");
    window.dispatchEvent(new Event(LOADING_COMPLETE_EVENT));
  }, []);

  const handleComplete = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setFadeOut(true);
    setTimeout(() => {
      setIsLoaded(true);
      markLoadingComplete();
    }, TIMING.loadingFadeDuration);
  }, [markLoadingComplete]);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      setIsLoaded(true);
      markLoadingComplete();
    }
  }, [markLoadingComplete]);

  return (
    <>
      <div className={isLoaded ? "" : "portfolio-page-pending"}>{children}</div>
      {!isLoaded && (
        <div
          className={`portfolio-loading-screen fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-all duration-600 ${
            fadeOut ? "loading-fade-out" : ""
          }`}
        >
          <TerminalAnimation onComplete={handleComplete} />
        </div>
      )}
    </>
  );
}
