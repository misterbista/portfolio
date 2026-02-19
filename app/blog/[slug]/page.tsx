import {
  supabase,
  formatDate,
  calculateReadingTime,
  extractToc,
  type Post,
  type Tag,
  type Series,
} from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked, Renderer } from "marked";
import BlogNav from "@/components/blog-nav";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import TableOfContents from "@/components/blog/table-of-contents";
import TagBadges from "@/components/blog/tag-badges";
import SeriesNav from "@/components/blog/series-nav";
import ViewCounter from "@/components/blog/view-counter";
import Reactions from "@/components/blog/reactions";

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

// Configure marked to add IDs to headings for TOC links
const renderer = new Renderer();
renderer.heading = ({ text, depth }) => {
  const id = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  return `<h${depth} id="${id}">${text}</h${depth}>\n`;
};
marked.use({ renderer });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Post Not Found | Piyushraj Bista" };

  return {
    title: `${post.title} | Piyushraj Bista`,
    description: post.excerpt || `Blog post by Piyushraj Bista`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Blog post by Piyushraj Bista`,
      type: "article",
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const { data } = await supabase
    .from("posts")
    .select(
      "*, categories(name, slug), post_tags(tags(id, name, slug)), series(id, name, slug)"
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  const post = data as FullPost | null;

  if (!post) {
    notFound();
  }

  const htmlContent = marked.parse(post.content) as string;
  const readingTime = calculateReadingTime(post.content);
  const toc = extractToc(post.content);
  const tags: Tag[] = post.post_tags?.map((pt) => pt.tags) || [];

  // Fetch series posts if this post belongs to a series
  let seriesPosts: SeriesPost[] = [];
  if (post.series_id && post.series) {
    const { data: sp } = await supabase
      .from("posts")
      .select("title, slug, series_order")
      .eq("series_id", post.series_id)
      .eq("published", true)
      .order("series_order");
    seriesPosts = (sp as SeriesPost[]) || [];
  }

  return (
    <div
      className="font-mono max-w-[720px] mx-auto min-h-screen"
      style={{
        padding: "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 2rem)",
      }}
    >
      <BlogNav showBlogLink={false} />
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-muted-foreground text-[0.825rem] no-underline transition-colors hover:text-foreground mb-8"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-[0.7rem]" />
        Read other blogs
      </Link>

      <article>
        <header className="mb-10">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-foreground tracking-tight leading-tight mb-3">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2.5 text-[0.825rem]">
            <span className="text-muted-foreground">
              {formatDate(post.created_at)}
            </span>
            <span className="text-muted-foreground">&middot;</span>
            <span className="text-muted-foreground">
              {readingTime} min read
            </span>
            <span className="text-muted-foreground">&middot;</span>
            <ViewCounter slug={slug} initialCount={post.view_count} />
            {post.categories && (
              <Link
                href={`/blog?category=${post.categories.slug}`}
                className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border no-underline transition-colors hover:bg-muted"
              >
                {post.categories.name}
              </Link>
            )}
          </div>
          {tags.length > 0 && (
            <div className="mt-3">
              <TagBadges tags={tags} />
            </div>
          )}
        </header>

        <TableOfContents items={toc} />

        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      {post.series && seriesPosts.length > 0 && (
        <div className="mt-12">
          <SeriesNav
            seriesName={post.series.name}
            seriesSlug={post.series.slug}
            posts={seriesPosts}
            currentSlug={slug}
          />
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">
          Reactions
        </p>
        <Reactions postId={post.id} />
      </div>

      <footer className="mt-16 pt-8 border-t border-border text-muted-foreground text-xs">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
