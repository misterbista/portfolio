import {
  supabase,
  formatDate,
  supabaseConfigError,
} from "@/lib/supabase";
import type { Tag } from "@/lib/supabase";
import type { Metadata } from "next";
import BlogNav from "@/components/blog-nav";
import Link from "next/link";
import TagBadges from "@/components/blog/tag-badges";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

type PostWithCategory = {
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
  categories: { name: string; slug: string } | null;
  post_tags?: { tags: Tag }[];
};

type RawPostRow = Omit<PostWithCategory, "categories" | "post_tags"> & {
  categories: { name: string; slug: string }[] | { name: string; slug: string } | null;
  post_tags?: { tags: Tag[] | Tag }[];
};

const POSTS_PER_PAGE = 14;
export const revalidate = 30;

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Practical writing by Piyushraj Bista on web applications, migrations, operations, and production software.",
};

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

function buildUrl(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return `/blog${qs ? `?${qs}` : ""}`;
}

export default async function BlogPage({ searchParams }: Props) {
  const { page, search } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  const searchText = search?.trim() || undefined;

  if (!supabase) {
    return renderPage({
      posts: [],
      totalPages: 0,
      currentPage,
      search: searchText,
      unavailableMessage: supabaseConfigError ?? "Blog content is unavailable.",
    });
  }

  let query = supabase
    .from("posts")
    .select(
      "title, slug, excerpt, created_at, categories(name, slug), post_tags(tags(id, name, slug))",
      { count: "exact" }
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (searchText) {
    query = query.or(
      `title.ilike.%${searchText}%,excerpt.ilike.%${searchText}%`
    );
  }

  const { data, count } = await query.range(from, to);
  const posts = ((data || []) as unknown as RawPostRow[]).map((post) => ({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    created_at: post.created_at,
    categories: Array.isArray(post.categories)
      ? post.categories[0] || null
      : post.categories,
    post_tags: post.post_tags?.map((item) => ({
      tags: Array.isArray(item.tags) ? item.tags[0] : item.tags,
    })),
  }));
  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE);

  return renderPage({
    posts,
    totalPages,
    currentPage,
    search: searchText,
  });
}

function renderPage({
  posts,
  totalPages,
  currentPage,
  search,
  unavailableMessage,
}: {
  posts: PostWithCategory[];
  totalPages: number;
  currentPage: number;
  search?: string;
  unavailableMessage?: string;
}) {
  const hasSearch = !!search;

  return (
    <div className="blog-shell">
      <BlogNav showBlogLink={false} />

      <div className="blog-searchbar">
        <form method="GET" action="/blog" className="blog-searchbar__form">
          <div className="blog-searchbar__field">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="blog-searchbar__icon"
            />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search writing"
              className="blog-searchbar__input"
              aria-label="Search posts"
            />
          </div>
          {search && (
            <Link href="/blog" className="blog-searchbar__clear" prefetch>
              <FontAwesomeIcon icon={faXmark} />
              Clear
            </Link>
          )}
        </form>
      </div>

      {hasSearch && (
        <div className="blog-filter-status">
          <span>Search results for &quot;{search}&quot;</span>
          <Link href="/blog" prefetch>
            <FontAwesomeIcon icon={faXmark} />
            Clear
          </Link>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="blog-empty-state">
          <p>
            {unavailableMessage
              ? unavailableMessage
              : hasSearch
              ? "No posts match your search."
              : "No posts yet. Check back soon."}
          </p>
        </div>
      ) : (
        <>
          <div className="blog-stream">
            {posts.map((post) => {
              const tags = post.post_tags?.map((item) => item.tags) || [];

              return (
                <article key={post.slug} className="blog-stream__item">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="blog-stream__link"
                    prefetch
                  >
                    <div className="blog-stream__meta">
                      <time dateTime={post.created_at}>
                        {formatDate(post.created_at)}
                      </time>
                      {post.categories && <span>{post.categories.name}</span>}
                    </div>
                    <h2 className="blog-stream__title">{post.title}</h2>
                    {post.excerpt && (
                      <p className="blog-stream__excerpt">{post.excerpt}</p>
                    )}
                  </Link>
                  {tags.length > 0 && (
                    <div className="blog-stream__tags">
                      <TagBadges tags={tags} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav className="blog-pagination" aria-label="Pagination">
              {currentPage > 1 ? (
                <Link
                  href={buildUrl({
                    page: String(currentPage - 1),
                    search,
                  })}
                  rel="prev"
                  prefetch
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span>
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={buildUrl({
                    page: String(currentPage + 1),
                    search,
                  })}
                  rel="next"
                  prefetch
                >
                  Next
                  <FontAwesomeIcon icon={faChevronRight} />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}

      <footer className="mt-20 pt-8 border-t border-border text-muted-foreground text-xs font-mono">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
