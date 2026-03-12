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

  const [categoriesRes, allTagsRes, seriesRes, seriesRowsRes] =
    await Promise.all([
      supabase.from("categories").select("id, name, slug").order("name"),
      supabase.from("tags").select("id, name, slug").order("name"),
      supabase.from("series").select("id, name, slug, description").order("name"),
      supabase
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
    seriesCounts.set(row.series_id, (seriesCounts.get(row.series_id) || 0) + 1);
  }

  const seriesWithCounts: SeriesWithCount[] = seriesData
    .map((seriesItem) => ({
      ...seriesItem,
      post_count: seriesCounts.get(seriesItem.id) || 0,
    }))
    .filter((seriesItem) => seriesItem.post_count > 0);

  const categoryId = category
    ? categories.find((c) => c.slug === category)?.id || null
    : null;
  const tagId = tag ? allTags.find((t) => t.slug === tag)?.id || null : null;

  // Requested filters that don't exist should return empty quickly.
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
    query = query.or(`title.ilike.%${searchText}%,excerpt.ilike.%${searchText}%`);
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
}) {
  const hasSeries = seriesWithCounts.length > 0;
  const featuredPost =
    !search && !category && !tag && currentPage === 1 ? posts[0] || null : null;
  const listPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <div className="blog-shell">
      <BlogNav showBlogLink={false} />

      <header className="blog-landing">
        <span className="section-kicker">Writing</span>
        <h1 className="blog-landing__title">
          Notes on software, product delivery, and the small details that
          matter.
        </h1>
        <p className="blog-landing__body">
          Posts on web development, engineering decisions, and shipping real
          work.
        </p>
      </header>

      {featuredPost && (
        <section className="blog-featured">
          <div className="blog-featured__meta">
            <span>{formatDate(featuredPost.created_at)}</span>
            <span>{calculateReadingTime(featuredPost.content)} min read</span>
            <span>{featuredPost.view_count.toLocaleString()} views</span>
            {featuredPost.categories && (
              <span>{featuredPost.categories.name}</span>
            )}
          </div>

          <Link
            href={`/blog/${featuredPost.slug}`}
            className="blog-featured__link"
          >
            <h2 className="blog-featured__title">{featuredPost.title}</h2>
          </Link>

          {featuredPost.excerpt && (
            <p className="blog-featured__excerpt">{featuredPost.excerpt}</p>
          )}

          <Link href={`/blog/${featuredPost.slug}`} className="blog-featured__cta">
            Read article
            <FontAwesomeIcon icon={faArrowRight} className="text-[0.65rem]" />
          </Link>

          {featuredPost.post_tags?.length ? (
            <div className="mt-4">
              <TagBadges tags={featuredPost.post_tags.map((pt) => pt.tags)} />
            </div>
          ) : null}
        </section>
      )}

      <div className="mb-8">

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

      <div className={hasSeries ? "blog-collection" : ""}>
        <div className={hasSeries ? "min-w-0 flex-1" : ""}>
          {/* Category filter pills */}
          {categories.length > 0 && (
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
          {allTags.length > 0 && (
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
          {listPosts.length === 0 ? (
            <p className="text-muted-foreground text-[0.925rem] text-center py-12">
              {featuredPost
                ? "More posts coming soon."
                : search || category || tag
                ? "No posts found."
                : "No posts yet. Check back soon!"}
            </p>
          ) : (
            <>
              <div className="blog-stream">
                {listPosts.map((post) => {
                  const readingTime = calculateReadingTime(post.content);
                  const tags: Tag[] =
                    post.post_tags?.map((pt) => pt.tags) || [];

                  return (
                    <article
                      key={post.slug}
                      className="blog-stream__item"
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="blog-stream__link"
                      >
                        <div className="blog-stream__meta">
                          <span>{formatDate(post.created_at)}</span>
                          <span>{readingTime} min read</span>
                          {post.view_count > 0 && (
                            <span>
                              <FontAwesomeIcon
                                icon={faEye}
                                className="text-[0.6rem] mr-1"
                              />
                              {post.view_count.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <h2 className="blog-stream__title">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="blog-stream__excerpt">
                            {post.excerpt}
                          </p>
                        )}
                      </Link>
                      <div className="blog-stream__foot">
                        {post.categories && (
                          <span className="blog-stream__category">
                            {post.categories.name}
                          </span>
                        )}
                      </div>
                      {tags.length > 0 ? (
                        <div className="mt-2">
                          <TagBadges tags={tags} />
                        </div>
                      ) : null}
                    </article>
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

        {hasSeries && (
          <aside className="blog-series-aside">
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
