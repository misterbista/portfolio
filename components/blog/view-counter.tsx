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

    const incrementView = async () => {
      if (typeof window !== "undefined") {
        const hasViewed = window.sessionStorage.getItem(storageKey);
        if (hasViewed) return;
        window.sessionStorage.setItem(storageKey, "1");
      }

      try {
        const { error } = await supabase.rpc("increment_view_count", {
          post_slug: slug,
        });

        if (error) {
          if (typeof window !== "undefined") {
            window.sessionStorage.removeItem(storageKey);
          }
          return;
        }

        setCount((c) => c + 1);
      } catch {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(storageKey);
        }
      }
    };

    void incrementView();
  }, [slug]);

  return (
    <span className="text-muted-foreground text-[0.775rem]">
      {count.toLocaleString()} views
    </span>
  );
}
