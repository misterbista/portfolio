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
    supabase.rpc("increment_view_count", { post_slug: slug }).then(() => {
      setCount((c) => c + 1);
    });
  }, [slug]);

  return (
    <span className="text-muted-foreground text-[0.775rem]">
      {count.toLocaleString()} views
    </span>
  );
}
