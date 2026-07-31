import Link from "next/link";
import type { Tag } from "@/lib/supabase";

type Props = {
  tags: Tag[];
  category?: string;
  search?: string;
};

export default function TagBadges({ tags, category, search }: Props) {
  if (!tags || tags.length === 0) return null;

  function tagUrl(slug: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    params.set("tag", slug);
    return `/blog?${params.toString()}`;
  }

  return (
    <div className="tag-badge-list" role="list" aria-label="Tags">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={tagUrl(tag.slug)}
          role="listitem"
          className="tag-badge"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
