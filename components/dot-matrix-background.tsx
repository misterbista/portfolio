"use client";

import { useEffect, useRef, useCallback } from "react";

const GRID_SIZE = 26;
const CURSOR_RADIUS = 200;
const CURSOR_RADIUS_SQ = CURSOR_RADIUS * CURSOR_RADIUS;

export default function DotMatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef({ x: -10_000, y: -10_000 });
  const rafRef = useRef(0);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    cursorRef.current.x = e.clientX;
    cursorRef.current.y = e.clientY;
  }, []);

  const handlePointerLeave = useCallback(() => {
    cursorRef.current.x = -10_000;
    cursorRef.current.y = -10_000;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;

    // Pre-computed grid positions
    let gridX: Float32Array;
    let gridY: Float32Array;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Pre-compute grid positions
      const halfGrid = GRID_SIZE / 2;
      cols = Math.ceil(width / GRID_SIZE);
      rows = Math.ceil(height / GRID_SIZE);
      const total = cols * rows;
      gridX = new Float32Array(total);
      gridY = new Float32Array(total);

      let i = 0;
      for (let r = 0; r < rows; r++) {
        const y = halfGrid + r * GRID_SIZE;
        for (let c = 0; c < cols; c++) {
          gridX[i] = halfGrid + c * GRID_SIZE;
          gridY[i] = y;
          i++;
        }
      }
    }

    function render(time: number) {
      const total = cols * rows;
      ctx!.clearRect(0, 0, width, height);

      const isStatic = prefersReducedMotion.matches;
      const breath = isStatic ? 0 : (Math.sin(time * 0.0005) + 1) * 0.5;
      const cx = cursorRef.current.x;
      const cy = cursorRef.current.y;
      const hasCursor = cx > -1000;

      for (let i = 0; i < total; i++) {
        const x = gridX[i];
        const y = gridY[i];

        const pulse = isStatic
          ? 0
          : (Math.sin((x + y) * 0.013 + time * 0.001) + 1) * 0.5;

        let influence = 0;
        if (hasCursor) {
          const dx = x - cx;
          const dy = y - cy;
          const distSq = dx * dx + dy * dy;
          if (distSq < CURSOR_RADIUS_SQ) {
            influence = 1 - Math.sqrt(distSq) / CURSOR_RADIUS;
          }
        }

        const radius = 0.6 + pulse * 0.15 + breath * 0.18 + influence * 1.1;
        const alpha = 0.035 + pulse * 0.025 + breath * 0.04 + influence * 0.18;

        ctx!.beginPath();
        ctx!.arc(x, y, radius, 0, 6.2832);
        ctx!.fillStyle = `rgba(126,255,182,${alpha})`;
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    }

    resize();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerleave", handlePointerLeave);
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [handlePointerMove, handlePointerLeave]);

  return (
    <div className="dot-matrix-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="dot-matrix-bg__canvas" />
    </div>
  );
}
