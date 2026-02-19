import { unstable_noStore as noStore } from "next/cache";
import { supabase, formatDate, calculateReadingTime } from "@/lib/supabase";
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
  faEye,
  faLayerGroup,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

type PostWithCategory = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  created_at: string;
  view_count: number;
  categories: { name: string; slug: string } | null;
  post_tags?: { tags: Tag }[];
};

type SeriesWithCount = {
  id: string;
  name: string;
  slug: string;
  description: string;
  post_count: number;
};

const POSTS_PER_PAGE = 10;

export const metadata: Metadata = {
  title: "Blog | Piyushraj Bista",
  description:
    "Blog posts by Piyushraj Bista — Full Stack Developer writing about web development, tech, and more.",
};

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    tag?: string;
  }>;
};

function buildUrl(
  params: Record<string, string | undefined>
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return `/blog${qs ? `?${qs}` : ""}`;
}

export default async function BlogPage({ searchParams }: Props) {
  noStore();

  const { page, search, category, tag } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  // Fetch categories for filter bar
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name");

  // Fetch tags for filter bar
  const { data: allTags } = await supabase
    .from("tags")
    .select("name, slug")
    .order("name");

  // Fetch series that have published posts
  const { data: seriesData } = await supabase
    .from("series")
    .select("id, name, slug, description")
    .order("name");

  let seriesWithCounts: SeriesWithCount[] = [];
  if (seriesData && seriesData.length > 0) {
    const counts = await Promise.all(
      seriesData.map(async (s) => {
        const { count } = await supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("series_id", s.id)
          .eq("published", true);
        return { ...s, post_count: count || 0 };
      })
    );
    seriesWithCounts = counts.filter((s) => s.post_count > 0);
  }

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

  // Resolve tag slug → id for filtering
  let tagId: string | null = null;
  if (tag) {
    const { data: t } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tag)
      .single();
    tagId = t?.id || null;
  }

  // If filtering by tag, get the post IDs that have this tag
  let tagPostIds: string[] | null = null;
  if (tagId) {
    const { data: postTags } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tagId);
    tagPostIds = postTags?.map((pt) => pt.post_id) || [];
  }

  // Build post query
  let query = supabase
    .from("posts")
    .select(
      "title, slug, excerpt, content, created_at, view_count, categories(name, slug), post_tags(tags(id, name, slug))",
      { count: "exact" }
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (tagPostIds !== null) {
    if (tagPostIds.length === 0) {
      // No posts have this tag — return empty
      return renderPage({
        posts: [],
        totalPages: 0,
        currentPage,
        search,
        category,
        tag,
        categories,
        allTags,
        seriesWithCounts,
      });
    }
    query = query.in("id", tagPostIds);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  const { data, count } = await query.range(from, to);
  const posts = data as PostWithCategory[] | null;
  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE);

  return renderPage({
    posts: posts || [],
    totalPages,
    currentPage,
    search,
    category,
    tag,
    categories,
    allTags,
    seriesWithCounts,
  });
}

function renderPage({
  posts,
  totalPages,
  currentPage,
  search,
  category,
  tag,
  categories,
  allTags,
  seriesWithCounts,
}: {
  posts: PostWithCategory[];
  totalPages: number;
  currentPage: number;
  search?: string;
  category?: string;
  tag?: string;
  categories: { name: string; slug: string }[] | null;
  allTags: { name: string; slug: string }[] | null;
  seriesWithCounts: SeriesWithCount[];
}) {
  const hasSeries = seriesWithCounts.length > 0;

  return (
    <div
      className={`font-mono mx-auto min-h-screen ${hasSeries ? "max-w-[960px]" : "max-w-[720px]"}`}
      style={{
        padding: "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 2rem)",
      }}
    >
      <BlogNav showBlogLink={false} />

      <div className="mb-8">
        
        <p className="text-muted-foreground text-[0.925rem] mb-5">
          Thoughts on web development, technology, and more.
        </p>

        {/* Search */}
        <form method="GET" action="/blog">
          {category && <input type="hidden" name="category" value={category} />}
          {tag && <input type="hidden" name="tag" value={tag} />}
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
                href={buildUrl({ category, tag })}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground border border-border rounded-md no-underline transition-colors hover:text-foreground hover:bg-muted"
              >
                <FontAwesomeIcon icon={faXmark} />
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Two-column layout: posts left, series right */}
      <div className={hasSeries ? "flex flex-col lg:flex-row gap-10" : ""}>
        {/* Posts column */}
        <div className={hasSeries ? "flex-1 min-w-0" : ""}>
          {/* Category filter pills */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Link
                href={buildUrl({ search, tag })}
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
                  href={buildUrl({ category: cat.slug, search, tag })}
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

          {/* Tag filter pills */}
          {allTags && allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {tag && (
                <Link
                  href={buildUrl({ search, category })}
                  className="text-[0.675rem] px-2 py-0.5 rounded-full border border-border no-underline transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <FontAwesomeIcon icon={faXmark} className="mr-1 text-[0.55rem]" />
                  Clear tag
                </Link>
              )}
              {allTags.map((t) => (
                <Link
                  key={t.slug}
                  href={buildUrl({ tag: t.slug, search, category })}
                  className={`text-[0.675rem] px-2 py-0.5 rounded-full border no-underline transition-colors ${
                    tag === t.slug
                      ? "bg-foreground text-background border-foreground"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  }`}
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}
          {posts.length === 0 ? (
            <p className="text-muted-foreground text-[0.925rem] text-center py-12">
              {search || category || tag
                ? "No posts found."
                : "No posts yet. Check back soon!"}
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {posts.map((post) => {
                  const readingTime = calculateReadingTime(post.content);
                  const tags: Tag[] =
                    post.post_tags?.map((pt) => pt.tags) || [];

                  return (
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
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-muted-foreground text-[0.775rem]">
                            {formatDate(post.created_at)}
                          </span>
                          <span className="text-muted-foreground text-[0.6rem]">
                            &middot;
                          </span>
                          <span className="text-muted-foreground text-[0.775rem]">
                            {readingTime} min read
                          </span>
                          {post.view_count > 0 && (
                            <>
                              <span className="text-muted-foreground text-[0.6rem]">
                                &middot;
                              </span>
                              <span className="text-muted-foreground text-[0.775rem]">
                                <FontAwesomeIcon
                                  icon={faEye}
                                  className="text-[0.6rem] mr-1"
                                />
                                {post.view_count.toLocaleString()}
                              </span>
                            </>
                          )}
                          {post.categories && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
                              {post.categories.name}
                            </span>
                          )}
                        </div>
                      </Link>
                      {tags.length > 0 && (
                        <div className="mt-2">
                          <TagBadges tags={tags} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                  {currentPage > 1 ? (
                    <Link
                      href={buildUrl({
                        page: String(currentPage - 1),
                        search,
                        category,
                        tag,
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
                        tag,
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
        </div>

        {/* Series sidebar */}
        {hasSeries && (
          <aside className="w-full lg:w-[220px] shrink-0">
            <div className="lg:sticky lg:top-8">
              <h2 className="text-[0.7rem] text-muted-foreground font-medium uppercase tracking-wider mb-3">
                <FontAwesomeIcon
                  icon={faLayerGroup}
                  className="mr-1.5 text-[0.6rem]"
                />
                Series
              </h2>
              <div className="flex flex-col gap-2.5">
                {seriesWithCounts.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/blog/series/${s.slug}`}
                    className="group flex flex-col gap-1 p-3 rounded-lg border border-border bg-secondary/20 no-underline transition-colors hover:bg-secondary/50 hover:border-muted-foreground"
                  >
                    <span className="text-foreground text-[0.8rem] font-medium">
                      {s.name}
                    </span>
                    {s.description && (
                      <span className="text-muted-foreground text-[0.7rem] leading-snug line-clamp-2">
                        {s.description}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-muted-foreground text-[0.65rem] mt-0.5">
                      {s.post_count} {s.post_count === 1 ? "post" : "posts"}
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-[0.5rem]"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      <footer className="mt-16 pt-8 border-t border-border text-muted-foreground text-xs">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
