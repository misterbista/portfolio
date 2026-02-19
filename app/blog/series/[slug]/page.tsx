import { supabase, formatDate, calculateReadingTime } from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogNav from "@/components/blog-nav";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { cache } from "react";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

const getSeriesBySlug = cache(async (slug: string) => {
  const { data } = await supabase
    .from("series")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single();

  return data;
});

const getPublishedSeriesPosts = cache(async (seriesId: string) => {
  const { data } = await supabase
    .from("posts")
    .select("title, slug, excerpt, content, created_at")
    .eq("series_id", seriesId)
    .eq("published", true)
    .order("series_order");

  return data || [];
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) return { title: "Series Not Found | Piyushraj Bista" };

  return {
    title: `${series.name} | Piyushraj Bista`,
    description: series.description || `Blog series by Piyushraj Bista`,
  };
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;

  const series = await getSeriesBySlug(slug);

  if (!series) notFound();

  const posts = await getPublishedSeriesPosts(series.id);

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
        Back to blog
      </Link>

      <div className="mb-10">
        <p className="text-[0.7rem] text-muted-foreground uppercase tracking-wider font-medium mb-2">
          Series
        </p>
        <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-bold text-foreground tracking-tight mb-2">
          {series.name}
        </h1>
        {series.description && (
          <p className="text-muted-foreground text-[0.925rem]">
            {series.description}
          </p>
        )}
        <p className="text-muted-foreground text-xs mt-2">
          {posts.length} {posts.length === 1 ? "post" : "posts"} in this series
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-[0.925rem] text-center py-12">
          No published posts in this series yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post, i) => {
            const readingTime = calculateReadingTime(post.content);
            return (
              <div
                key={post.slug}
                className="border-b border-border pb-6 mb-4 last:border-b-0"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block no-underline group"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-muted-foreground text-xs font-mono shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
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
                        <span className="text-muted-foreground text-[0.6rem]">
                          &middot;
                        </span>
                        <span className="text-muted-foreground text-[0.775rem]">
                          {readingTime} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <footer className="mt-16 pt-8 border-t border-border text-muted-foreground text-xs">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
