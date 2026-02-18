import { supabase, formatDate } from "@/lib/supabase";
import type { Metadata } from "next";
import BlogNav from "@/components/blog-nav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Piyushraj Bista",
  description:
    "Blog posts by Piyushraj Bista — Full Stack Developer writing about web development, tech, and more.",
};

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from("posts")
    .select("title, slug, excerpt, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="font-mono max-w-[720px] mx-auto min-h-screen" style={{ padding: "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 2rem)" }}>
      <BlogNav showBlogLink={false} />

      <div className="mb-10">
        <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-bold text-foreground tracking-tight mb-2">
          Blog
        </h1>
        <p className="text-muted-foreground text-[0.925rem]">
          Thoughts on web development, technology, and more.
        </p>
      </div>

      {!posts || posts.length === 0 ? (
        <p className="text-muted-foreground text-[0.925rem] text-center py-12">
          No posts yet. Check back soon!
        </p>
      ) : (
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
                <span className="text-muted-foreground text-[0.775rem]">
                  {formatDate(post.created_at)}
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-16 pt-8 border-t border-border text-muted-foreground text-xs">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
