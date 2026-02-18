import { unstable_noStore as noStore } from "next/cache";
import { supabase, formatDate } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

type PostWithCategory = {
  title: string;
  slug: string;
  created_at: string;
  categories: { name: string; slug: string } | null;
};

export default async function RecentPosts() {
  noStore();

  const { data } = await supabase
    .from("posts")
    .select("title, slug, created_at, categories(name, slug)")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  const posts = data as PostWithCategory[] | null;

  return (
    <section className="mt-8 pt-6 border-t border-border">
      <h3 className="text-[0.7rem] text-muted-foreground font-medium uppercase tracking-wider mb-3 font-mono">
        Recent Posts
      </h3>
      <ul className="flex flex-col gap-1">
        {!posts || posts.length === 0 ? (
          <li className="text-muted-foreground text-sm py-2">No posts yet.</li>
        ) : (
          posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex flex-col gap-0.5 no-underline px-2.5 py-2 rounded-md border border-transparent transition-colors hover:bg-accent hover:border-border"
              >
                <span className="text-foreground text-[0.825rem] font-medium leading-snug">
                  {post.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[0.7rem]">
                    {formatDate(post.created_at)}
                  </span>
                  {post.categories && !Array.isArray(post.categories) && (
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
                      {post.categories.name}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 mt-3 text-[0.775rem] text-muted-foreground no-underline transition-colors hover:text-foreground"
      >
        View all posts{" "}
        <FontAwesomeIcon icon={faArrowRight} className="text-[0.65rem]" />
      </Link>
    </section>
  );
}
