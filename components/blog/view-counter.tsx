"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export default function ViewCounter({
  slug,
  initialCount,
}: {
  slug: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);

  const incrementView = useCallback(async () => {
    const storageKey = `viewed-post:${slug}`;

    if (typeof window === "undefined" || !supabase) return;
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, "1");

    try {
      const { error } = await supabase.rpc("increment_view_count", {
        post_slug: slug,
      });

      if (error) {
        sessionStorage.removeItem(storageKey);
        return;
      }

      setCount((c) => c + 1);
    } catch {
      sessionStorage.removeItem(storageKey);
    }
  }, [slug]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    incrementView();
  }, [incrementView]);

  return (
    <span className="post-metrics__value">
      {count.toLocaleString()}
    </span>
  );
}
