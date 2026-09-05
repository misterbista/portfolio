"use client";

import { useSyncExternalStore, type MouseEvent } from "react";

type Theme = "light" | "dark";

const storageKey = "portfolio-theme";
const themeChangeEvent = "portfolio-theme-change";
let activeTransition: ViewTransition | undefined;
let requestedTheme: Theme | undefined;

function syncThemeIcons(theme: Theme) {
  document
    .querySelectorAll<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
    .forEach((icon) => {
      icon.media = icon.getAttribute("href") === `/favicon-${theme}.svg` ? "all" : "not all";
    });
}

function applyTheme(theme: Theme, origin?: { x: number; y: number }) {
  requestedTheme = theme;
  activeTransition?.skipTransition();
  document.documentElement.classList.add("theme-transitioning");

  const update = () => {
    if (requestedTheme !== theme) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#111210" : "#ffffff");
    syncThemeIcons(theme);
    window.dispatchEvent(new Event(themeChangeEvent));
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition && !reducedMotion) {
    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    ) + 48;
    const style = document.documentElement.style;
    style.setProperty("--theme-origin-x", `${x}px`);
    style.setProperty("--theme-origin-y", `${y}px`);
    style.setProperty("--theme-reveal-end", `${radius}px`);
    style.setProperty("--theme-reveal-duration", theme === "dark" ? "820ms" : "740ms");
    const transition = document.startViewTransition(update);
    activeTransition = transition;
    void transition.finished.finally(() => {
      if (activeTransition !== transition) return;
      activeTransition = undefined;
      document.documentElement.classList.remove("theme-transitioning");
    });
  } else {
    activeTransition = undefined;
    update();
    requestAnimationFrame(() => {
      if (!activeTransition) document.documentElement.classList.remove("theme-transitioning");
    });
  }
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  syncThemeIcons(currentTheme());

  const handleSavedThemeChange = () => onChange();
  const handleSystemThemeChange = (event: MediaQueryListEvent) => {
    try {
      if (window.localStorage.getItem(storageKey)) return;
    } catch {
      // Follow the system preference when storage cannot be read.
    }

    applyTheme(event.matches ? "dark" : "light");
    onChange();
  };

  window.addEventListener(themeChangeEvent, handleSavedThemeChange);
  media.addEventListener("change", handleSystemThemeChange);

  return () => {
    window.removeEventListener(themeChangeEvent, handleSavedThemeChange);
    media.removeEventListener("change", handleSystemThemeChange);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    currentTheme,
    () => "light",
  );

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const nextTheme = (requestedTheme ?? currentTheme()) === "dark" ? "light" : "dark";
    const bounds = event.currentTarget.getBoundingClientRect();
    applyTheme(nextTheme, {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    });
    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch {
      // The theme still applies for this visit when storage is unavailable.
    }
  };

  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={theme === "dark"}
      title={label}
    >
      <svg
        className="theme-toggle__icon theme-toggle__sun"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="3.25" />
        <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6 16 16M16 4l-1.4 1.4M5.4 14.6 4 16" />
      </svg>
      <svg
        className="theme-toggle__icon theme-toggle__moon"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M16.4 12.7A7 7 0 0 1 7.3 3.6 6.6 6.6 0 1 0 16.4 12.7Z" />
      </svg>
    </button>
  );
}
