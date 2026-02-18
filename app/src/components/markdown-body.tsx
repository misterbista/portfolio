"use client";

import { useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function MarkdownBody({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const raw = marked.parse(content) as string;
    ref.current.innerHTML = DOMPurify.sanitize(raw);
  }, [content]);

  return <div className="markdown-body" ref={ref} />;
}
