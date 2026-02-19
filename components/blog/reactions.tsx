"use client";

import { useEffect, useState } from "react";
import { supabase, REACTION_EMOJIS, type ReactionEmoji } from "@/lib/supabase";

export default function Reactions({ postId }: { postId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [animating, setAnimating] = useState<string | null>(null);

  useEffect(() => {
    loadCounts();
  }, [postId]);

  async function loadCounts() {
    const { data } = await supabase.rpc("get_reaction_counts", {
      p_post_id: postId,
    });
    if (data) {
      const map: Record<string, number> = {};
      for (const row of data as { emoji: string; count: number }[]) {
        map[row.emoji] = Number(row.count);
      }
      setCounts(map);
    }
  }

  async function react(emoji: ReactionEmoji) {
    setAnimating(emoji);
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    await supabase
      .from("post_reactions")
      .insert({ post_id: postId, emoji });
    setTimeout(() => setAnimating(null), 300);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {REACTION_EMOJIS.map(({ key, icon }) => (
        <button
          key={key}
          onClick={() => react(key)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-sm cursor-pointer transition-all hover:bg-muted hover:border-muted-foreground"
          style={{
            transform: animating === key ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.15s ease, background 0.2s ease",
          }}
        >
          <span>{icon}</span>
          <span className="text-muted-foreground text-xs font-mono">
            {counts[key] || 0}
          </span>
        </button>
      ))}
    </div>
  );
}
