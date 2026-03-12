"use client";

import { useEffect, useRef } from "react";

const GRID_SIZE = 24;
const CURSOR_RADIUS = 180;

export default function DotMatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cursor = { x: -10_000, y: -10_000 };
    let width = 0;
    let height = 0;
    let rafId = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      cursor.x = event.clientX;
      cursor.y = event.clientY;
    };

    const handlePointerLeave = () => {
      cursor.x = -10_000;
      cursor.y = -10_000;
    };

    const render = (time: number) => {
      context.clearRect(0, 0, width, height);
      const breath = mediaQuery.matches
        ? 0
        : (Math.sin(time * 0.00055) + 1) * 0.5;

      for (let y = GRID_SIZE / 2; y < height; y += GRID_SIZE) {
        for (let x = GRID_SIZE / 2; x < width; x += GRID_SIZE) {
          const pulse = mediaQuery.matches
            ? 0
            : (Math.sin((x + y) * 0.014 + time * 0.0011) + 1) * 0.5;
          const dx = x - cursor.x;
          const dy = y - cursor.y;
          const distance = Math.hypot(dx, dy);
          const influence =
            cursor.x < 0
              ? 0
              : Math.max(0, 1 - distance / CURSOR_RADIUS);

          const radius = 0.62 + pulse * 0.18 + breath * 0.2 + influence * 0.95;
          const alpha = 0.04 + pulse * 0.03 + breath * 0.05 + influence * 0.16;

          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fillStyle = `rgba(126, 255, 182, ${alpha})`;
          context.fill();
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerleave", handlePointerLeave);
    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div className="dot-matrix-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="dot-matrix-bg__canvas" />
    </div>
  );
}
