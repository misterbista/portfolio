import Link from "next/link";
import type { Tag } from "@/lib/supabase";

export default function TagBadges({ tags }: { tags: Tag[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/blog?tag=${tag.slug}`}
          className="text-[0.675rem] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border no-underline transition-colors hover:text-foreground hover:bg-muted"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
