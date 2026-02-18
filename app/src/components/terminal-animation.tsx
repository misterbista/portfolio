"use client";

import { useRef, useEffect, useCallback } from "react";
import { TIMING, SPINNER_FRAMES, TERMINAL_STEPS } from "@/lib/constants";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function TerminalAnimation({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);

  const getTypingDelay = useCallback((char: string, context: string) => {
    if (char === " ") return TIMING.typingMedium + Math.random() * 40;
    if ("/:@.".includes(char) && context === "url")
      return TIMING.typingSlow + Math.random() * TIMING.typingVariance;
    if (context === "command") return TIMING.typingFast + Math.random() * 3;
    return TIMING.typingMedium + Math.random() * TIMING.typingVariance;
  }, []);

  const getCharContext = useCallback((text: string, index: number) => {
    if (index < 4) return "command";
    if (text.includes("://") && index > text.indexOf("://")) return "url";
    return "normal";
  }, []);

  const run = useCallback(async () => {
    const el = contentRef.current;
    if (!el) return;
    el.innerHTML = "";

    let inGitRepo = false;
    let currentDir = "~";

    function getPromptHTML() {
      const gitPart = inGitRepo
        ? ' <span class="prompt-git">(main)</span>'
        : "";
      return `<span class="prompt-user">user@dev</span> <span class="prompt-dir">${currentDir}</span>${gitPart} $ `;
    }

    function createPromptLine() {
      const line = document.createElement("div");
      line.className = "terminal-line";
      line.innerHTML = `${getPromptHTML()}<span class="terminal-text"></span><span class="cursor">|</span>`;
      el!.appendChild(line);
      return line;
    }

    async function typeText(
      span: HTMLSpanElement,
      text: string,
      contextFn?: (i: number) => string
    ) {
      for (let i = 0; i < text.length; i++) {
        if (cancelledRef.current) return;
        const ctx = contextFn ? contextFn(i) : "normal";
        span.textContent += text[i];
        const microPause = Math.random() < 0.08 ? randomBetween(80, 200) : 0;
        await sleep(getTypingDelay(text[i], ctx) + microPause);
      }
    }

    async function backspace(span: HTMLSpanElement, count: number) {
      for (let i = 0; i < count; i++) {
        if (cancelledRef.current) return;
        span.textContent = span.textContent!.slice(0, -1);
        await sleep(TIMING.backspaceSpeed + Math.random() * 30);
      }
    }

    async function showProgressBar(config: {
      text: string;
      total: number;
      speed: number;
      cls?: string;
    }) {
      const line = document.createElement("div");
      line.className = `terminal-line ${config.cls || ""}`;
      el!.appendChild(line);
      let current = 0;
      while (current < config.total) {
        if (cancelledRef.current) return;
        current += 1 + Math.floor(Math.random() * 3);
        if (current > config.total) current = config.total;
        const barWidth = 20;
        const filled = Math.round((current / config.total) * barWidth);
        const empty = barWidth - filled;
        const pct = Math.round((current / config.total) * 100);
        line.textContent = `${config.text} [${"#".repeat(filled)}${"·".repeat(empty)}] ${pct}% (${current}/${config.total})`;
        await sleep(config.speed + Math.random() * 40);
      }
      line.textContent = `Receiving objects: 100% (${config.total}/${config.total}), 18.4 KiB | 3.2 MiB/s, done.`;
      await sleep(TIMING.progressFinalizeDelay);
    }

    async function showSpinner(config: {
      text: string;
      duration: number;
      cls?: string;
    }) {
      const line = document.createElement("div");
      line.className = `terminal-line ${config.cls || ""} spinner`;
      el!.appendChild(line);
      let frame = 0;
      const start = Date.now();
      while (Date.now() - start < config.duration) {
        if (cancelledRef.current) return;
        line.textContent = `${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]} ${config.text}`;
        frame++;
        await sleep(TIMING.spinnerInterval);
      }
      line.remove();
    }

    createPromptLine();

    for (let stepIndex = 0; stepIndex < TERMINAL_STEPS.length; stepIndex++) {
      const step = TERMINAL_STEPS[stepIndex];
      if (cancelledRef.current) return;
      const promptLine = el!.lastElementChild as HTMLDivElement | null;
      const textSpan = promptLine?.querySelector(
        ".terminal-text"
      ) as HTMLSpanElement | null;
      if (!textSpan) return;

      if (step.typo) {
        await typeText(textSpan, step.typo.wrongText, (i) =>
          getCharContext(step.typo!.wrongText, i)
        );
        await sleep(TIMING.typoPause);
        await backspace(textSpan, step.typo.deleteCount);
        await sleep(TIMING.typoCorrectionDelay);
        await typeText(textSpan, step.typo.correction);
      } else if (step.tabComplete) {
        await typeText(textSpan, step.tabComplete.typed, (i) =>
          getCharContext(step.tabComplete!.typed, i)
        );
        await sleep(TIMING.tabCompletePause);
        const cursor = promptLine.querySelector(".cursor");
        if (cursor) cursor.classList.add("tab-flash");
        await sleep(TIMING.tabCompletePause);
        textSpan.textContent += step.tabComplete.completed;
        if (cursor) cursor.classList.remove("tab-flash");
      } else {
        await typeText(textSpan, step.cmd, (i) =>
          getCharContext(step.cmd, i)
        );
      }

      await sleep(TIMING.commandDelay);
      promptLine.innerHTML = `${getPromptHTML()}${step.cmd}`;

      if (step.changeDir) {
        inGitRepo = true;
        currentDir = "~/portfolio";
      }

      // Show output lines
      for (const out of step.output) {
        if (cancelledRef.current) return;
        if (out.type === "progress") {
          await showProgressBar({
            text: out.text,
            total: out.total!,
            speed: out.speed!,
            cls: out.cls,
          });
        } else if (out.type === "spinner") {
          await showSpinner({
            text: out.text,
            duration: out.duration!,
            cls: out.cls,
          });
        } else {
          await sleep(out.delay || 80);
          const line = document.createElement("div");
          line.className = `terminal-line ${out.cls || ""}`;
          line.textContent = out.text;
          el!.appendChild(line);
        }
      }

      // Thinking pause between steps
      if (stepIndex < TERMINAL_STEPS.length - 1) {
        await sleep(randomBetween(TIMING.thinkPauseMin, TIMING.thinkPauseMax));
        createPromptLine();
        await sleep(TIMING.lineDelay);
      }
    }

    await sleep(TIMING.loadingHideDelayAfterAnimation);
    if (!cancelledRef.current) onComplete();
  }, [onComplete, getTypingDelay, getCharContext]);

  useEffect(() => {
    cancelledRef.current = false;
    const timeout = setTimeout(run, TIMING.animationStartDelay);
    return () => {
      cancelledRef.current = true;
      clearTimeout(timeout);
    };
  }, [run]);

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="terminal-button close" />
          <span className="terminal-button minimize" />
          <span className="terminal-button maximize" />
        </div>
        <div className="terminal-title">portfolio.sh</div>
      </div>
      <div className="terminal-body">
        <div className="terminal-content" ref={contentRef} />
      </div>
    </div>
  );
}
