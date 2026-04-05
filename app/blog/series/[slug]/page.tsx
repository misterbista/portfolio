import {
  supabase,
  formatDate,
  calculateReadingTime,
  supabaseConfigError,
} from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogNav from "@/components/blog-nav";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { cache } from "react";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

const getSeriesBySlug = cache(async (slug: string) => {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("series")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single();

  return data;
});

const getPublishedSeriesPosts = cache(async (seriesId: string) => {
  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("posts")
    .select("title, slug, excerpt, content, created_at")
    .eq("series_id", seriesId)
    .eq("published", true)
    .order("series_order");

  return data || [];
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!supabase) {
    return {
      title: "Blog",
      description: supabaseConfigError ?? "Blog content is unavailable.",
    };
  }

  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) return { title: "Series Not Found" };

  return {
    title: `${series.name} — Series`,
    description: series.description || `Blog series by Piyushraj Bista`,
  };
}

export default async function SeriesPage({ params }: Props) {
  if (!supabase) {
    return renderUnavailableSeries();
  }

  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) notFound();

  const posts = await getPublishedSeriesPosts(series.id);

  return (
    <div className="blog-shell" style={{ maxWidth: "780px" }}>
      <BlogNav showBlogLink={false} />

      <Link
        href="/blog"
        className="group inline-flex items-center gap-1.5 text-muted-foreground text-[0.82rem] no-underline transition-colors hover:text-foreground mb-10 font-medium"
      >
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="text-[0.65rem] transition-transform group-hover:-translate-x-0.5"
        />
        All posts
      </Link>

      <header className="mb-12">
        <span className="section-kicker">Series</span>
        <h1 className="text-[clamp(1.85rem,3.5vw,2.5rem)] font-bold text-foreground tracking-tight leading-tight mb-3">
          {series.name}
        </h1>
        {series.description && (
          <p className="text-muted-foreground text-[0.95rem] leading-relaxed max-w-[55ch]">
            {series.description}
          </p>
        )}
        <p className="text-muted-foreground text-xs mt-3 font-mono">
          {posts.length} {posts.length === 1 ? "post" : "posts"} in this series
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-16">
          No published posts in this series yet.
        </p>
      ) : (
        <div className="flex flex-col">
          {posts.map((post, i) => {
            const readingTime = calculateReadingTime(post.content);
            const isLast = i === posts.length - 1;

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex gap-5 no-underline py-6 border-b border-border last:border-b-0"
              >
                {/* Step number with connecting line */}
                <div className="relative flex flex-col items-center shrink-0">
                  <span className="w-8 h-8 rounded-full border border-border bg-secondary/20 text-muted-foreground text-xs font-mono flex items-center justify-center transition-all group-hover:border-foreground group-hover:text-foreground group-hover:bg-secondary/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {!isLast && (
                    <span className="w-px flex-1 bg-border mt-2" />
                  )}
                </div>

                <div className="min-w-0 flex-1 pb-2">
                  <h2 className="text-[1.05rem] font-semibold text-foreground leading-snug mb-2 transition-colors group-hover:text-muted-foreground">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground text-[0.72rem] font-mono">
                    <time dateTime={post.created_at}>
                      {formatDate(post.created_at)}
                    </time>
                    <span className="text-[0.5rem]">&middot;</span>
                    <span className="inline-flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-[0.5rem]"
                      />
                      {readingTime} min
                    </span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-[0.5rem] ml-auto opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <footer className="mt-20 pt-8 border-t border-border text-muted-foreground text-xs font-mono">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}

function renderUnavailableSeries() {
  return (
    <div className="blog-shell" style={{ maxWidth: "780px" }}>
      <BlogNav showBlogLink={false} />

      <Link
        href="/blog"
        className="group inline-flex items-center gap-1.5 text-muted-foreground text-[0.82rem] no-underline transition-colors hover:text-foreground mb-10 font-medium"
      >
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="text-[0.65rem] transition-transform group-hover:-translate-x-0.5"
        />
        All posts
      </Link>

      <header className="mb-12">
        <span className="section-kicker">Series</span>
        <h1 className="text-[clamp(1.85rem,3.5vw,2.5rem)] font-bold text-foreground tracking-tight leading-tight mb-3">
          Series unavailable
        </h1>
        <p className="text-muted-foreground text-[0.95rem] leading-relaxed max-w-[55ch]">
          {supabaseConfigError ?? "Blog content is unavailable."}
        </p>
      </header>

      <footer className="mt-20 pt-8 border-t border-border text-muted-foreground text-xs font-mono">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
