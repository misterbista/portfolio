"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TocItem } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    observerRef.current?.disconnect();

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the first heading that's currently intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-10% 0px -70% 0px",
        threshold: 0,
      }
    );

    headings.forEach((heading) => observerRef.current!.observe(heading));
  }, [items]);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-[0.68rem] text-muted-foreground uppercase tracking-[0.2em] font-semibold cursor-pointer bg-transparent border-none p-0 transition-colors hover:text-foreground font-mono"
      >
        <FontAwesomeIcon
          icon={open ? faChevronUp : faChevronDown}
          className="text-[0.5rem]"
        />
        On this page
      </button>
      {open && (
        <ul className="mt-3 flex flex-col gap-0.5 list-none p-0">
          {items.map((item, i) => {
            const isActive = item.id === activeId;

            return (
              <li
                key={i}
                style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
              >
                <a
                  href={`#${item.id}`}
                  className={`block py-1 text-[0.78rem] no-underline transition-colors leading-snug ${
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    setActiveId(item.id);
                  }}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
