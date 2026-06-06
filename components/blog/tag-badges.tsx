import Link from "next/link";
import type { Tag } from "@/lib/supabase";

export default function TagBadges({ tags }: { tags: Tag[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="tag-badge-list" role="list" aria-label="Tags">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/blog?tag=${tag.slug}`}
          role="listitem"
          className="tag-badge"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
