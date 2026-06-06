import {
  supabase,
  formatDate,
  calculateReadingTime,
  extractToc,
  supabaseConfigError,
  type Post,
  type Tag,
  type Series,
} from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogNav from "@/components/blog-nav";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import TableOfContents from "@/components/blog/table-of-contents";
import TagBadges from "@/components/blog/tag-badges";
import SeriesNav from "@/components/blog/series-nav";
import { cache } from "react";

type FullPost = Post & {
  categories: { name: string; slug: string } | null;
  post_tags?: { tags: Tag }[];
  series: Series | null;
};

type SeriesPost = { title: string; slug: string; series_order: number };

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

const getPublishedPostBySlug = cache(async (slug: string) => {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, content, published, created_at, updated_at, category_id, series_id, series_order, view_count, categories(name, slug), post_tags(tags(id, name, slug, created_at)), series(id, name, slug, description, created_at)"
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  return (data as FullPost | null) || null;
});

const getPublishedSeriesPosts = cache(async (seriesId: string) => {
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("posts")
    .select("title, slug, series_order")
    .eq("series_id", seriesId)
    .eq("published", true)
    .order("series_order");

  return (data as SeriesPost[]) || [];
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!supabase) {
    return {
      title: "Blog",
      description: supabaseConfigError ?? "Blog content is unavailable.",
    };
  }

  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt || `Blog post by Piyushraj Bista`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Blog post by Piyushraj Bista`,
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: ["Piyushraj Bista"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || `Blog post by Piyushraj Bista`,
    },
  };
}

export default async function PostPage({ params }: Props) {
  if (!supabase) {
    return renderUnavailablePost();
  }

  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);
  const toc = extractToc(post.content);
  const tags: Tag[] = post.post_tags?.map((pt) => pt.tags) || [];

  let seriesPosts: SeriesPost[] = [];
  if (post.series_id && post.series) {
    seriesPosts = await getPublishedSeriesPosts(post.series_id);
  }

  return (
    <div className="blog-shell blog-post-shell">
      <BlogNav showBlogLink={false} />

      <div className="blog-post-layout">
        <aside className="blog-post-aside">
          <Link href="/blog" className="blog-post-backlink">
            <FontAwesomeIcon icon={faArrowLeft} className="text-[0.65rem]" />
            All posts
          </Link>

          <div className="blog-post-aside__toc">
            <TableOfContents items={toc} />
          </div>
        </aside>

        <article className="blog-post-article">
          <header className="blog-post-header">
            <h1 className="blog-post-title">{post.title}</h1>
            {post.excerpt && (
              <p className="blog-post-excerpt">{post.excerpt}</p>
            )}
            <div className="blog-post-header__meta">
              <time dateTime={post.created_at}>
                {formatDate(post.created_at)}
              </time>
              <span>{readingTime} min read</span>
              {post.categories && (
                <Link href={`/blog?category=${post.categories.slug}`}>
                  {post.categories.name}
                </Link>
              )}
            </div>
            {tags.length > 0 && (
              <div className="blog-post-header__tags">
                <TagBadges tags={tags} />
              </div>
            )}
          </header>

          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.series && seriesPosts.length > 0 && (
            <div className="mt-14">
              <SeriesNav
                seriesName={post.series.name}
                seriesSlug={post.series.slug}
                posts={seriesPosts}
                currentSlug={slug}
              />
            </div>
          )}
        </article>
      </div>

      <footer className="mt-20 pt-8 border-t border-border text-muted-foreground text-xs font-mono">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}

function renderUnavailablePost() {
  return (
    <div className="blog-shell blog-post-shell">
      <BlogNav showBlogLink={false} />

      <div className="blog-post-layout">
        <aside className="blog-post-aside">
          <Link href="/blog" className="blog-post-backlink">
            <FontAwesomeIcon icon={faArrowLeft} className="text-[0.65rem]" />
            All posts
          </Link>
        </aside>

        <article className="blog-post-article">
          <header className="blog-post-header">
            <h1 className="blog-post-title">Blog unavailable</h1>
            <p className="blog-post-excerpt">
              {supabaseConfigError ?? "Blog content is unavailable."}
            </p>
          </header>
        </article>
      </div>

      <footer className="mt-20 pt-8 border-t border-border text-muted-foreground text-xs font-mono">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
