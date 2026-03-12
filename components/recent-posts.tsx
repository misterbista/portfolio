import { unstable_noStore as noStore } from "next/cache";
import { supabase, formatDate } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

type PostWithCategory = {
  title: string;
  slug: string;
  created_at: string;
  categories: { name: string; slug: string } | null;
};

export default async function RecentPosts({
  variant = "rail",
}: {
  variant?: "rail" | "feature";
}) {
  noStore();

  const { data } = await supabase
    .from("posts")
    .select("title, slug, created_at, categories(name, slug)")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const posts = data as PostWithCategory[] | null;

  if (variant === "feature") {
    return (
      <section className="recent-posts-feature">
        <span className="section-kicker">Blog</span>
        <h2 className="section-title">Latest Writing</h2>
        <ul className="recent-posts-feature__list">
          {!posts || posts.length === 0 ? (
            <li className="text-muted-foreground text-sm py-2">No posts yet.</li>
          ) : (
            posts.map((post) => (
              <li key={post.slug} className="recent-posts-feature__item">
                <Link
                  href={`/blog/${post.slug}`}
                  className="recent-posts-feature__link"
                >
                  <div className="recent-posts-feature__meta">
                    <span>{formatDate(post.created_at)}</span>
                    {post.categories && !Array.isArray(post.categories) && (
                      <span className="recent-posts-feature__category">
                        {post.categories.name}
                      </span>
                    )}
                  </div>
                  <span className="recent-posts-feature__title">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
        <Link href="/blog" className="recent-posts-feature__all">
          Explore the blog{" "}
          <FontAwesomeIcon icon={faArrowRight} className="text-[0.65rem]" />
        </Link>
      </section>
    );
  }

  return (
    <section className="recent-posts">
      <h3 className="sidebar-panel-label mb-4">
        Recent Posts
      </h3>
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
                  <span>
                    {formatDate(post.created_at)}
                  </span>
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
