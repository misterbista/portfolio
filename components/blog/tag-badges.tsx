import Link from "next/link";
import type { Tag } from "@/lib/supabase";

export default function TagBadges({ tags }: { tags: Tag[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5" role="list" aria-label="Tags">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/blog?tag=${tag.slug}`}
          role="listitem"
          className="text-[0.66rem] px-2.5 py-0.5 rounded-full bg-secondary/40 text-muted-foreground border border-border no-underline transition-all hover:text-foreground hover:bg-muted hover:border-muted-foreground font-mono"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
