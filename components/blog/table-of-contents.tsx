"use client";

import { useState } from "react";
import type { TocItem } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(true);

  if (items.length === 0) return null;

  return (
    <nav className="mb-8 p-4 border border-border rounded-lg bg-secondary/20">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider font-medium cursor-pointer bg-transparent border-none p-0 transition-colors hover:text-foreground"
      >
        <FontAwesomeIcon
          icon={open ? faChevronUp : faChevronDown}
          className="text-[0.55rem]"
        />
        Table of Contents
      </button>
      {open && (
        <ul className="mt-3 flex flex-col gap-1.5 list-none p-0">
          {items.map((item, i) => (
            <li
              key={i}
              style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
            >
              <a
                href={`#${item.id}`}
                className="text-muted-foreground text-[0.8rem] no-underline transition-colors hover:text-foreground"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
