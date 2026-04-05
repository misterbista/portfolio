import { unstable_noStore as noStore } from "next/cache";
import {
  supabase,
  calculateReadingTime,
  formatDate,
  supabaseConfigError,
} from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

type PostWithCategory = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  created_at: string;
  view_count: number;
  categories: { name: string; slug: string } | null;
};

export default async function RecentPosts({
  variant = "rail",
}: {
  variant?: "rail" | "feature";
}) {
  noStore();

  if (!supabase) {
    return variant === "feature" ? (
      <section className="recent-posts-feature">
        <div className="recent-posts-feature__header">
          <div>
            <span className="section-kicker">Blog</span>
            <h2 className="section-title">Latest Writing</h2>
          </div>
          <Link href="/blog" className="recent-posts-feature__all">
            Explore the blog{" "}
            <FontAwesomeIcon icon={faArrowRight} className="text-[0.65rem]" />
          </Link>
        </div>
        <p className="text-muted-foreground text-sm py-2">
          {supabaseConfigError}
        </p>
      </section>
    ) : (
      <section className="recent-posts">
        <h3 className="sidebar-panel-label mb-4">Recent Posts</h3>
        <p className="text-muted-foreground text-sm py-2">
          {supabaseConfigError}
        </p>
      </section>
    );
  }

  const client = supabase;

  const { data } = await client
    .from("posts")
    .select(
      "id, title, slug, excerpt, content, created_at, view_count, categories(name, slug)"
    )
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const posts = data as PostWithCategory[] | null;
  const postIds = posts?.map((post) => post.id) || [];
  const { data: reactionRows } = postIds.length
    ? await client
        .from("post_reactions")
        .select("post_id")
        .in("post_id", postIds)
    : { data: [] as { post_id: string }[] };

  const reactionCounts = new Map<string, number>();
  for (const row of reactionRows || []) {
    reactionCounts.set(row.post_id, (reactionCounts.get(row.post_id) || 0) + 1);
  }

  if (variant === "feature") {
    const leadPost = posts?.[0] || null;
    const supportingPosts = posts?.slice(1, 5) || [];

    return (
      <section className="recent-posts-feature">
        <div className="recent-posts-feature__header">
          <div>
            <span className="section-kicker">Blog</span>
            <h2 className="section-title">Latest Writing</h2>
          </div>
          <Link href="/blog" className="recent-posts-feature__all">
            Explore the blog{" "}
            <FontAwesomeIcon icon={faArrowRight} className="text-[0.65rem]" />
          </Link>
        </div>

        {!leadPost ? (
          <p className="text-muted-foreground text-sm py-2">No posts yet.</p>
        ) : (
          <div className="recent-posts-feature__layout">
            <article className="recent-posts-feature__lead">
              <div className="recent-posts-feature__meta">
                <time dateTime={leadPost.created_at}>{formatDate(leadPost.created_at)}</time>
                {leadPost.categories && !Array.isArray(leadPost.categories) && (
                  <span className="recent-posts-feature__category">
                    {leadPost.categories.name}
                  </span>
                )}
              </div>

              <Link
                href={`/blog/${leadPost.slug}`}
                className="recent-posts-feature__lead-link"
              >
                <h3 className="recent-posts-feature__lead-title">
                  {leadPost.title}
                </h3>
              </Link>

              <p className="recent-posts-feature__excerpt">
                {leadPost.excerpt}
              </p>

              <div className="recent-posts-feature__stats">
                <span>{leadPost.view_count.toLocaleString()} views</span>
                <span>{reactionCounts.get(leadPost.id) || 0} reactions</span>
                <span>{calculateReadingTime(leadPost.content)} min read</span>
              </div>

              <Link
                href={`/blog/${leadPost.slug}`}
                className="recent-posts-feature__read"
              >
                Read post{" "}
                <FontAwesomeIcon icon={faArrowRight} className="text-[0.65rem]" />
              </Link>
            </article>

            <div className="recent-posts-feature__stack">
              {supportingPosts.map((post) => (
                <article
                  key={post.slug}
                  className="recent-posts-feature__stack-item"
                >
                  <div className="recent-posts-feature__meta">
                    <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                    {post.categories && !Array.isArray(post.categories) && (
                      <span className="recent-posts-feature__category">
                        {post.categories.name}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="recent-posts-feature__stack-link"
                  >
                    <span className="recent-posts-feature__stack-title">
                      {post.title}
                    </span>
                  </Link>

                  <div className="recent-posts-feature__stack-stats">
                    <span>{post.view_count.toLocaleString()} views</span>
                    <span>{reactionCounts.get(post.id) || 0} reactions</span>
                    <span>{calculateReadingTime(post.content)} min read</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="recent-posts">
      <h3 className="sidebar-panel-label mb-4">Recent Posts</h3>
      <ul className="recent-posts__list">
        {!posts || posts.length === 0 ? (
          <li className="text-muted-foreground text-sm py-2">No posts yet.</li>
        ) : (
          posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="recent-posts__link"
              >
                <span className="recent-posts__title">
                  {post.title}
                </span>
                <div className="recent-posts__meta">
                  <time dateTime={post.created_at}>
                    {formatDate(post.created_at)}
                  </time>
                  {post.categories && !Array.isArray(post.categories) && (
                    <span className="recent-posts__category">
                      {post.categories.name}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
      <Link
        href="/blog"
        className="recent-posts__all"
      >
        View all posts{" "}
        <FontAwesomeIcon icon={faArrowRight} className="text-[0.65rem]" />
      </Link>
    </section>
  );
}
