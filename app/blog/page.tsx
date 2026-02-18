import { unstable_noStore as noStore } from "next/cache";
import { supabase, formatDate } from "@/lib/supabase";
import type { Metadata } from "next";
import BlogNav from "@/components/blog-nav";
import Link from "next/link";
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
};

const POSTS_PER_PAGE = 10;

export const metadata: Metadata = {
  title: "Blog | Piyushraj Bista",
  description:
    "Blog posts by Piyushraj Bista — Full Stack Developer writing about web development, tech, and more.",
};

type Props = {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
};

function buildUrl(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return `/blog${qs ? `?${qs}` : ""}`;
}

export default async function BlogPage({ searchParams }: Props) {
  noStore();

  const { page, search, category } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  // Fetch categories for filter bar
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name");

  // Resolve category slug → id for filtering
  let categoryId: string | null = null;
  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();
    categoryId = cat?.id || null;
  }

  // Build post query
  let query = supabase
    .from("posts")
    .select("title, slug, excerpt, created_at, categories(name, slug)", {
      count: "exact",
    })
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  const { data, count } = await query.range(from, to);
  const posts = data as PostWithCategory[] | null;
  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE);

  return (
    <div
      className="font-mono max-w-[720px] mx-auto min-h-screen"
      style={{
        padding: "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 2rem)",
      }}
    >
      <BlogNav showBlogLink={false} />

      <div className="mb-10">
        <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-bold text-foreground tracking-tight mb-2">
          Blog
        </h1>
        <p className="text-muted-foreground text-[0.925rem]">
          Thoughts on web development, technology, and more.
        </p>
      </div>

      {/* Search */}
      <form method="GET" action="/blog" className="mb-5">
        {category && <input type="hidden" name="category" value={category} />}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs"
            />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search posts..."
              className="w-full pl-8 pr-3 py-2 bg-secondary text-foreground border border-border rounded-md text-xs transition-colors focus:outline-none focus:border-muted-foreground"
            />
          </div>
          {search && (
            <Link
              href={buildUrl({ category })}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground border border-border rounded-md no-underline transition-colors hover:text-foreground hover:bg-muted"
            >
              <FontAwesomeIcon icon={faXmark} />
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Category filter pills */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={buildUrl({ search })}
            className={`text-xs px-3 py-1.5 rounded-full border no-underline transition-colors ${
              !category
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={buildUrl({ category: cat.slug, search })}
              className={`text-xs px-3 py-1.5 rounded-full border no-underline transition-colors ${
                category === cat.slug
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {!posts || posts.length === 0 ? (
        <p className="text-muted-foreground text-[0.925rem] text-center py-12">
          {search || category ? "No posts found." : "No posts yet. Check back soon!"}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="border-b border-border pb-6 mb-4 last:border-b-0"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block no-underline group"
                >
                  <h2 className="text-lg font-semibold text-foreground leading-snug mb-1.5 transition-colors group-hover:text-muted-foreground">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm leading-normal mb-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2.5">
                    <span className="text-muted-foreground text-[0.775rem]">
                      {formatDate(post.created_at)}
                    </span>
                    {post.categories && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
                        {post.categories.name}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              {currentPage > 1 ? (
                <Link
                  href={buildUrl({
                    page: String(currentPage - 1),
                    search,
                    category,
                  })}
                  className="inline-flex items-center gap-1.5 text-muted-foreground text-sm no-underline transition-colors hover:text-foreground"
                >
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className="text-[0.6rem]"
                  />
                  Prev
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground text-xs">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={buildUrl({
                    page: String(currentPage + 1),
                    search,
                    category,
                  })}
                  className="inline-flex items-center gap-1.5 text-muted-foreground text-sm no-underline transition-colors hover:text-foreground"
                >
                  Next
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="text-[0.6rem]"
                  />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      )}

      <footer className="mt-16 pt-8 border-t border-border text-muted-foreground text-xs">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
