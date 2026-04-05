import {
  supabase,
  formatDate,
  calculateReadingTime,
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
  faEye,
  faLayerGroup,
  faArrowRight,
  faClock,
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

type CategoryFilter = {
  id: string;
  name: string;
  slug: string;
};

type TagFilter = {
  id: string;
  name: string;
  slug: string;
};

type SeriesFilter = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

type SeriesCountRow = {
  series_id: string | null;
};

const POSTS_PER_PAGE = 10;
export const revalidate = 30;

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Blog posts by Piyushraj Bista — Full Stack Developer writing about web development, engineering, and technology.",
};

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    tag?: string;
  }>;
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
  const { page, search, category, tag } = await searchParams;
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
      category,
      tag,
      categories: [],
      allTags: [],
      seriesWithCounts: [],
      unavailableMessage: supabaseConfigError ?? "Blog content is unavailable.",
    });
  }

  const client = supabase;

  const [categoriesRes, allTagsRes, seriesRes, seriesRowsRes] =
    await Promise.all([
      client.from("categories").select("id, name, slug").order("name"),
      client.from("tags").select("id, name, slug").order("name"),
      client
        .from("series")
        .select("id, name, slug, description")
        .order("name"),
      client
        .from("posts")
        .select("series_id")
        .eq("published", true)
        .not("series_id", "is", null),
    ]);

  const categories = (categoriesRes.data || []) as CategoryFilter[];
  const allTags = (allTagsRes.data || []) as TagFilter[];
  const seriesData = (seriesRes.data || []) as SeriesFilter[];
  const seriesRows = (seriesRowsRes.data || []) as SeriesCountRow[];

  const seriesCounts = new Map<string, number>();
  for (const row of seriesRows) {
    if (!row.series_id) continue;
    seriesCounts.set(
      row.series_id,
      (seriesCounts.get(row.series_id) || 0) + 1
    );
  }

  const seriesWithCounts: SeriesWithCount[] = seriesData
    .map((s) => ({ ...s, post_count: seriesCounts.get(s.id) || 0 }))
    .filter((s) => s.post_count > 0);

  const categoryId = category
    ? categories.find((c) => c.slug === category)?.id || null
    : null;
  const tagId = tag ? allTags.find((t) => t.slug === tag)?.id || null : null;

  if ((category && !categoryId) || (tag && !tagId)) {
    return renderPage({
      posts: [],
      totalPages: 0,
      currentPage,
      search: searchText,
      category,
      tag,
      categories,
      allTags,
      seriesWithCounts,
    });
  }

  let tagPostIds: string[] | null = null;
  if (tagId) {
    const { data: postTags } = await client
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tagId);
    tagPostIds = postTags?.map((pt) => pt.post_id) || [];
  }

  let query = client
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
      return renderPage({
        posts: [],
        totalPages: 0,
        currentPage,
        search: searchText,
        category,
        tag,
        categories,
        allTags,
        seriesWithCounts,
      });
    }
    query = query.in("id", tagPostIds);
  }

  if (searchText) {
    query = query.or(
      `title.ilike.%${searchText}%,excerpt.ilike.%${searchText}%`
    );
  }

  const { data, count } = await query.range(from, to);
  const posts = data as PostWithCategory[] | null;
  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE);

  return renderPage({
    posts: posts || [],
    totalPages,
    currentPage,
    search: searchText,
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
  unavailableMessage,
}: {
  posts: PostWithCategory[];
  totalPages: number;
  currentPage: number;
  search?: string;
  category?: string;
  tag?: string;
  categories: CategoryFilter[];
  allTags: TagFilter[];
  seriesWithCounts: SeriesWithCount[];
  unavailableMessage?: string;
}) {
  const hasSeries = seriesWithCounts.length > 0;
  const featuredPost =
    !search && !category && !tag && currentPage === 1
      ? posts[0] || null
      : null;
  const listPosts = featuredPost ? posts.slice(1) : posts;
  const hasActiveFilters = !!(search || category || tag);

  return (
    <div className="blog-shell">
      <BlogNav showBlogLink={false} />

      {/* Search — compact, inline */}
      <div className="blog-searchbar">
        <form method="GET" action="/blog" className="blog-searchbar__form">
          {category && (
            <input type="hidden" name="category" value={category} />
          )}
          {tag && <input type="hidden" name="tag" value={tag} />}
          <div className="blog-searchbar__field">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="blog-searchbar__icon"
            />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search posts..."
              className="blog-searchbar__input"
              aria-label="Search posts"
            />
          </div>
          {search && (
            <Link
              href={buildUrl({ category, tag })}
              className="blog-searchbar__clear"
            >
              <FontAwesomeIcon icon={faXmark} />
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Latest Post — editorial, not a card */}
      {featuredPost && (
        <article className="blog-featured" aria-label="Latest post">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="blog-featured__link"
          >
            <h2 className="blog-featured__title">{featuredPost.title}</h2>
          </Link>

          {featuredPost.excerpt && (
            <p className="blog-featured__excerpt">{featuredPost.excerpt}</p>
          )}

          <div className="blog-featured__meta">
            <time dateTime={featuredPost.created_at}>
              {formatDate(featuredPost.created_at)}
            </time>
            <span>{calculateReadingTime(featuredPost.content)} min read</span>
            {featuredPost.view_count > 0 && (
              <span>{featuredPost.view_count.toLocaleString()} views</span>
            )}
            {featuredPost.categories && (
              <span>{featuredPost.categories.name}</span>
            )}
          </div>

          {featuredPost.post_tags?.length ? (
            <div className="mt-4">
              <TagBadges tags={featuredPost.post_tags.map((pt) => pt.tags)} />
            </div>
          ) : null}
        </article>
      )}

      <div className={hasSeries ? "blog-collection" : ""}>
        <div className={hasSeries ? "min-w-0 flex-1" : ""}>
          {/* Category Filter */}
          {categories.length > 0 && (
            <nav className="flex flex-wrap gap-2 mb-4" aria-label="Categories">
              <Link
                href={buildUrl({ search, tag })}
                className={`text-xs px-3.5 py-1.5 rounded-full border no-underline transition-all font-medium ${
                  !category
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted hover:border-muted-foreground"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={buildUrl({ category: cat.slug, search, tag })}
                  className={`text-xs px-3.5 py-1.5 rounded-full border no-underline transition-all font-medium ${
                    category === cat.slug
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:bg-muted hover:border-muted-foreground"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <nav
              className="flex flex-wrap gap-1.5 mb-8"
              aria-label="Filter by tags"
            >
              {tag && (
                <Link
                  href={buildUrl({ search, category })}
                  className="text-[0.66rem] px-2.5 py-0.5 rounded-full border border-border no-underline transition-all text-muted-foreground hover:text-foreground hover:bg-muted font-mono"
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="mr-1 text-[0.5rem]"
                  />
                  Clear tag
                </Link>
              )}
              {allTags.map((t) => (
                <Link
                  key={t.slug}
                  href={buildUrl({ tag: t.slug, search, category })}
                  className={`text-[0.66rem] px-2.5 py-0.5 rounded-full border no-underline transition-all font-mono ${
                    tag === t.slug
                      ? "bg-foreground text-background border-foreground"
                      : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted hover:border-muted-foreground"
                  }`}
                >
                  #{t.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Posts */}
          {listPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">
                {unavailableMessage
                  ? unavailableMessage
                  : featuredPost
                  ? "More posts coming soon."
                  : hasActiveFilters
                  ? "No posts match your filters."
                  : "No posts yet. Check back soon!"}
              </p>
              {hasActiveFilters && (
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mt-3 no-underline hover:text-foreground transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-[0.6rem]" />
                  Clear all filters
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="blog-stream">
                {listPosts.map((post) => {
                  const readingTime = calculateReadingTime(post.content);
                  const tags: Tag[] =
                    post.post_tags?.map((pt) => pt.tags) || [];

                  return (
                    <article key={post.slug} className="blog-stream__item">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="blog-stream__link"
                      >
                        <div className="blog-stream__meta">
                          <time dateTime={post.created_at}>
                            {formatDate(post.created_at)}
                          </time>
                          <span>
                            <FontAwesomeIcon
                              icon={faClock}
                              className="text-[0.5rem] mr-1"
                            />
                            {readingTime} min
                          </span>
                          {post.view_count > 0 && (
                            <span>
                              <FontAwesomeIcon
                                icon={faEye}
                                className="text-[0.5rem] mr-1"
                              />
                              {post.view_count.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <h2 className="blog-stream__title">{post.title}</h2>
                        {post.excerpt && (
                          <p className="blog-stream__excerpt">{post.excerpt}</p>
                        )}
                      </Link>
                      <div className="blog-stream__foot">
                        {post.categories && (
                          <span className="blog-stream__category">
                            {post.categories.name}
                          </span>
                        )}
                      </div>
                      {tags.length > 0 && (
                        <div className="mt-2.5">
                          <TagBadges tags={tags} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="flex items-center justify-between mt-12 pt-6 border-t border-border"
                  aria-label="Pagination"
                >
                  {currentPage > 1 ? (
                    <Link
                      href={buildUrl({
                        page: String(currentPage - 1),
                        search,
                        category,
                        tag,
                      })}
                      className="group inline-flex items-center gap-1.5 text-muted-foreground text-sm no-underline transition-colors hover:text-foreground"
                      rel="prev"
                    >
                      <FontAwesomeIcon
                        icon={faChevronLeft}
                        className="text-[0.55rem] transition-transform group-hover:-translate-x-0.5"
                      />
                      Previous
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="text-muted-foreground text-xs font-mono">
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
                      className="group inline-flex items-center gap-1.5 text-muted-foreground text-sm no-underline transition-colors hover:text-foreground"
                      rel="next"
                    >
                      Next
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-[0.55rem] transition-transform group-hover:translate-x-0.5"
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

        {/* Series Sidebar */}
        {hasSeries && (
          <aside className="blog-series-aside" aria-label="Blog series">
            <div className="lg:sticky lg:top-8">
              <h2 className="text-[0.68rem] text-muted-foreground font-semibold uppercase tracking-[0.2em] mb-4 font-mono">
                <FontAwesomeIcon
                  icon={faLayerGroup}
                  className="mr-1.5 text-[0.55rem]"
                />
                Series
              </h2>
              <div className="flex flex-col gap-2.5">
                {seriesWithCounts.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/blog/series/${s.slug}`}
                    className="group flex flex-col gap-1.5 p-3.5 rounded-xl border border-border bg-secondary/10 no-underline transition-all hover:bg-secondary/30 hover:border-muted-foreground"
                  >
                    <span className="text-foreground text-[0.82rem] font-medium">
                      {s.name}
                    </span>
                    {s.description && (
                      <span className="text-muted-foreground text-[0.72rem] leading-snug line-clamp-2">
                        {s.description}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground text-[0.65rem] mt-0.5 font-mono transition-colors group-hover:text-foreground">
                      {s.post_count}{" "}
                      {s.post_count === 1 ? "post" : "posts"}
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="text-[0.45rem] transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      <footer className="mt-20 pt-8 border-t border-border text-muted-foreground text-xs font-mono">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
