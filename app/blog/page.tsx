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

type SeriesLink = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type CategoryLink = {
  id: string;
  name: string;
  slug: string;
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
    category?: string;
    tag?: string;
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
  const { page, search, category, tag } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  const searchText = search?.trim() || undefined;
  const categorySlug = category?.trim() || undefined;
  const tagSlug = tag?.trim() || undefined;

  if (!supabase) {
    return renderPage({
      posts: [],
      totalPages: 0,
      currentPage,
      search: searchText,
      category: categorySlug,
      tag: tagSlug,
      unavailableMessage: supabaseConfigError ?? "Blog content is unavailable.",
    });
  }

  const categoryRelation = categorySlug
    ? "categories!inner(name, slug)"
    : "categories(name, slug)";
  const tagRelation = tagSlug
    ? "post_tags!inner(tags!inner(id, name, slug))"
    : "post_tags(tags(id, name, slug))";
  let query = supabase
    .from("posts")
    .select(
      `title, slug, excerpt, created_at, ${categoryRelation}, ${tagRelation}`,
      { count: "exact" }
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (searchText) {
    query = query.or(
      `title.ilike.%${searchText}%,excerpt.ilike.%${searchText}%`
    );
  }
  if (categorySlug) query = query.eq("categories.slug", categorySlug);
  if (tagSlug) query = query.eq("post_tags.tags.slug", tagSlug);

  const [postsRes, seriesRes, categoriesRes] = await Promise.all([
    query.range(from, to),
    supabase
      .from("series")
      .select("id, name, slug, description")
      .order("name"),
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("name"),
  ]);

  const { data, count } = postsRes;
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
    series: (seriesRes.data || []) as SeriesLink[],
    categories: (categoriesRes.data || []) as CategoryLink[],
    totalPages,
    currentPage,
    search: searchText,
    category: categorySlug,
    tag: tagSlug,
  });
}

function renderPage({
  posts,
  series = [],
  categories = [],
  totalPages,
  currentPage,
  search,
  category,
  tag,
  unavailableMessage,
}: {
  posts: PostWithCategory[];
  series?: SeriesLink[];
  categories?: CategoryLink[];
  totalPages: number;
  currentPage: number;
  search?: string;
  category?: string;
  tag?: string;
  unavailableMessage?: string;
}) {
  const hasSearch = !!search;
  const hasFilters = hasSearch || !!category || !!tag;

  return (
    <div className="blog-shell">
      <BlogNav showBlogLink={false} />

      <div className="blog-searchbar">
        <form method="GET" action="/blog" className="blog-searchbar__form">
          {category && <input type="hidden" name="category" value={category} />}
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
              placeholder="Search writing"
              className="blog-searchbar__input"
              aria-label="Search posts"
            />
          </div>
          {hasFilters && (
            <Link href="/blog" className="blog-searchbar__clear" prefetch>
              <FontAwesomeIcon icon={faXmark} />
              Clear
            </Link>
          )}
        </form>
      </div>

      {hasFilters && (
        <div className="blog-filter-status">
          <span>
            {search && `Search results for “${search}”`}
            {search && (category || tag) && " · "}
            {category && `Category: ${category}`}
            {category && tag && " · "}
            {tag && `Tag: #${tag}`}
          </span>
        </div>
      )}

      <div className={series.length > 0 || categories.length > 0 ? "blog-content-layout" : ""}>
        <div className="min-w-0">
          {posts.length === 0 ? (
            <div className="blog-empty-state">
              <p>
                {unavailableMessage
                  ? unavailableMessage
                  : hasFilters
                  ? "No posts match the current filters."
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
                      <div className="blog-stream__meta">
                        <time dateTime={post.created_at}>
                          {formatDate(post.created_at)}
                        </time>
                        {post.categories && (
                          <Link href={buildUrl({ category: post.categories.slug, tag, search })} prefetch>
                            {post.categories.name}
                          </Link>
                        )}
                      </div>
                      <Link href={`/blog/${post.slug}`} className="blog-stream__link" prefetch>
                        <h2 className="blog-stream__title">{post.title}</h2>
                        {post.excerpt && (
                          <p className="blog-stream__excerpt">{post.excerpt}</p>
                        )}
                      </Link>
                      {tags.length > 0 && (
                        <div className="blog-stream__tags">
                          <TagBadges tags={tags} category={category} search={search} />
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
                        category,
                        tag,
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
                        category,
                        tag,
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
        </div>

        {(series.length > 0 || categories.length > 0) && (
          <aside className="blog-series-list" aria-label="Series">
            {categories.length > 0 && <>
              <h2>Categories</h2>
              <div>
                <Link href={buildUrl({ search, tag })} className={`blog-series-list__item ${!category ? "is-active" : ""}`} prefetch><span>All writing</span></Link>
                {categories.map((item) => (
                  <Link key={item.id} href={buildUrl({ category: item.slug, tag, search })} className={`blog-series-list__item ${category === item.slug ? "is-active" : ""}`} prefetch><span>{item.name}</span></Link>
                ))}
              </div>
            </>}
            {series.length > 0 && <>
              <h2 className={categories.length > 0 ? "mt-8" : ""}>Series</h2>
              <div>
              {series.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/series/${item.slug}`}
                  className="blog-series-list__item"
                  prefetch
                >
                  <span>{item.name}</span>
                  {item.description && <small>{item.description}</small>}
                </Link>
              ))}
              </div>
            </>}
          </aside>
        )}
      </div>

      <footer className="mt-20 pt-8 border-t border-border text-muted-foreground text-xs font-mono">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
