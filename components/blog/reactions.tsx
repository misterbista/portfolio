"use client";

import { useEffect, useState } from "react";
import { supabase, REACTION_EMOJIS, type ReactionEmoji } from "@/lib/supabase";

export default function Reactions({ postId }: { postId: string }) {
  const isSupabaseUnavailable = !supabase;
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [animating, setAnimating] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!isSupabaseUnavailable);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      return;
    }

    let cancelled = false;

    async function loadCounts() {
      const { data } = await client!.rpc("get_reaction_counts", {
        p_post_id: postId,
      });

      if (cancelled) {
        return;
      }

      if (data) {
        const map: Record<string, number> = {};
        for (const row of data as { emoji: string; count: number }[]) {
          map[row.emoji] = Number(row.count);
        }
        setCounts(map);
      }

      setIsLoading(false);
    }

    void loadCounts();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function react(emoji: ReactionEmoji) {
    const client = supabase;
    if (animating || !client) return;

    setAnimating(emoji);
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));

    await client
      .from("post_reactions")
      .insert({ post_id: postId, emoji });

    setTimeout(() => setAnimating(null), 350);
  }

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 flex-wrap">
        {REACTION_EMOJIS.map(({ key, icon, label }) => {
          const count = counts[key] || 0;
          const isAnimating = animating === key;

          return (
            <button
              key={key}
              onClick={() => react(key)}
              disabled={!!animating || isSupabaseUnavailable}
              aria-label={`React with ${label}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-secondary/30 text-sm cursor-pointer transition-all hover:bg-muted hover:border-muted-foreground disabled:cursor-default"
              style={{
                transform: isAnimating ? "scale(1.12)" : "scale(1)",
                transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.2s ease, border-color 0.2s ease",
              }}
            >
              <span className="text-base" role="img" aria-hidden="true">
                {icon}
              </span>
              <span className="text-muted-foreground text-xs font-mono tabular-nums min-w-[1ch]">
                {isLoading ? "-" : count}
              </span>
            </button>
          );
        })}
      </div>
      {isSupabaseUnavailable && (
        <p className="text-muted-foreground text-xs font-mono mt-3">
          Reactions will appear once Supabase is configured.
        </p>
      )}
      {!isLoading && totalReactions > 0 && (
        <p className="text-muted-foreground text-xs font-mono mt-3">
          {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
        </p>
      )}
    </div>
  );
}
