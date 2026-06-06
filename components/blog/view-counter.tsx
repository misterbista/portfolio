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
  const [incrementedSlugs, setIncrementedSlugs] = useState<
    Record<string, number>
  >({});

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

      setIncrementedSlugs((current) => ({
        ...current,
        [slug]: (current[slug] || 0) + 1,
      }));
    } catch {
      sessionStorage.removeItem(storageKey);
    }
  }, [slug]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      incrementView();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [incrementView]);

  const count = initialCount + (incrementedSlugs[slug] || 0);

  return (
    <span className="post-metrics__value">
      {count.toLocaleString()}
    </span>
  );
}
