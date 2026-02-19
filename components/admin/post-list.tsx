"use client";

import { useEffect, useState } from "react";
import { supabase, formatDate } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

type PostWithJoins = {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  view_count: number;
  categories?: { name: string } | null;
  series?: { name: string } | null;
};

type RawPostRow = {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  view_count: number;
  categories: { name: string }[] | null;
  series: { name: string }[] | null;
};

type Props = {
  onEdit: (id: string) => void;
  onNew: () => void;
};

export default function PostList({ onEdit, onNew }: Props) {
  const [posts, setPosts] = useState<PostWithJoins[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, title, published, created_at, view_count, categories(name), series(name)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      showStatus("Failed to load posts: " + error.message, "error");
      setLoading(false);
      return;
    }
    const normalized = ((data as RawPostRow[]) || []).map((post) => ({
      id: post.id,
      title: post.title,
      published: post.published,
      created_at: post.created_at,
      view_count: post.view_count,
      categories: post.categories?.[0] || null,
      series: post.series?.[0] || null,
    }));
    setPosts(normalized);
    setLoading(false);
  }

  async function deletePost(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const previousPosts = posts;
    setPosts((current) => current.filter((post) => post.id !== id));

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      setPosts(previousPosts);
      showStatus("Failed to delete: " + error.message, "error");
      return;
    }
    showStatus("Post deleted.", "success");
  }

  function showStatus(text: string, type: "success" | "error") {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  }

  return (
    <div>
      {statusMsg && (
        <div
          className={`px-4 py-2.5 rounded-lg text-[0.825rem] mb-4 border ${
            statusMsg.type === "success"
              ? "bg-green-400/10 text-green-400 border-green-400/20"
              : "bg-red-400/10 text-red-400 border-red-400/20"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <div className="flex justify-end mb-5">
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background font-medium text-sm cursor-pointer border-none transition-opacity hover:opacity-90"
        >
          <FontAwesomeIcon icon={faPlus} /> New Post
        </button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          Loading...
        </p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground text-[0.925rem] text-center py-12">
          No posts yet. Create your first one!
        </p>
      ) : (
        <table className="w-full text-[0.85rem] border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border">
                Title
              </th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border hidden md:table-cell">
                Category
              </th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border hidden lg:table-cell">
                Series
              </th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border hidden md:table-cell">
                Status
              </th>
              <th className="text-right py-2.5 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border hidden lg:table-cell">
                Views
              </th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border hidden md:table-cell">
                Date
              </th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wider border-b border-border">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="py-2.5 px-3 text-foreground border-b border-border">
                  {post.title}
                </td>
                <td className="py-2.5 px-3 border-b border-border hidden md:table-cell">
                  {post.categories ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-accent text-accent-foreground border border-border">
                      {post.categories.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">---</span>
                  )}
                </td>
                <td className="py-2.5 px-3 border-b border-border hidden lg:table-cell">
                  {post.series ? (
                    <span className="text-xs text-muted-foreground">
                      {post.series.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">---</span>
                  )}
                </td>
                <td className="py-2.5 px-3 border-b border-border hidden md:table-cell">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.published
                        ? "bg-green-400/10 text-green-400"
                        : "bg-yellow-400/10 text-yellow-400"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="py-2.5 px-3 border-b border-border hidden lg:table-cell text-right text-muted-foreground text-xs font-mono">
                  {post.view_count.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 border-b border-border hidden md:table-cell text-muted-foreground">
                  {formatDate(post.created_at)}
                </td>
                <td className="py-2.5 px-3 border-b border-border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(post.id)}
                      className="px-3 py-1.5 rounded-md text-xs bg-secondary text-secondary-foreground border border-border cursor-pointer transition-colors hover:bg-muted"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      onClick={() => deletePost(post.id, post.title)}
                      className="px-3 py-1.5 rounded-md text-xs bg-transparent text-red-400 border border-red-400/30 cursor-pointer transition-colors hover:bg-red-400/10 hover:border-red-400"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
