"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ViewCounter({
  slug,
  initialCount,
}: {
  slug: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const storageKey = `viewed-post:${slug}`;

    if (typeof window !== "undefined") {
      const hasViewed = window.sessionStorage.getItem(storageKey);
      if (hasViewed) return;
      window.sessionStorage.setItem(storageKey, "1");
    }

    supabase
      .rpc("increment_view_count", { post_slug: slug })
      .then(({ error }) => {
        if (error) {
          if (typeof window !== "undefined") {
            window.sessionStorage.removeItem(storageKey);
          }
          return;
        }
        setCount((c) => c + 1);
      })
      .catch(() => {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(storageKey);
        }
      });
  }, [slug]);

  return (
    <span className="text-muted-foreground text-[0.775rem]">
      {count.toLocaleString()} views
    </span>
  );
}
