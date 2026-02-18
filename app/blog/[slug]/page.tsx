import { supabase, formatDate, type Post } from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked } from "marked";
import BlogNav from "@/components/blog-nav";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

type PostWithCategory = Post & {
  categories: { name: string; slug: string } | null;
};

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

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
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  const post = data as PostWithCategory | null;

  if (!post) {
    notFound();
  }

  const htmlContent = marked.parse(post.content) as string;

  return (
    <div className="font-mono max-w-[720px] mx-auto min-h-screen" style={{ padding: "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 2rem)" }}>
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
          <div className="flex items-center gap-2.5 text-[0.825rem]">
            <span className="text-muted-foreground">
              {formatDate(post.created_at)}
            </span>
            {post.categories && (
              <Link
                href={`/blog?category=${post.categories.slug}`}
                className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-border no-underline transition-colors hover:bg-muted"
              >
                {post.categories.name}
              </Link>
            )}
          </div>
        </header>
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      <footer className="mt-16 pt-8 border-t border-border text-muted-foreground text-xs">
        <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
      </footer>
    </div>
  );
}
