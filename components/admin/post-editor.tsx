"use client";

import { useEffect, useRef, useState } from "react";
import {
  supabase,
  generateSlug,
  type Post,
  type Category,
  type Series,
  type Tag,
} from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import MDEditor from "@uiw/react-md-editor";
import TagInput from "./tag-input";

type Props = {
  postId: string | null;
  onBack: () => void;
};

export default function PostEditor({ postId, onBack }: Props) {
  const initialTagIdsRef = useRef<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [seriesOrder, setSeriesOrder] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [metaOpen, setMetaOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("series").select("*").order("name"),
    ]).then(([catRes, seriesRes]) => {
      setCategories(catRes.data || []);
      setSeriesList(seriesRes.data || []);
    });
    if (postId) {
      loadPost(postId);
    } else {
      initialTagIdsRef.current = new Set();
    }
  }, [postId]);

  async function loadPost(id: string) {
    const { data, error } = await supabase
      .from("posts")
      .select("*, post_tags(tags(id, name, slug, created_at))")
      .eq("id", id)
      .single();

    if (error || !data) {
      showStatus("Failed to load post.", "error");
      return;
    }
    const post = data as Post & { post_tags?: { tags: Tag }[] };
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setPublished(post.published);
    setCategoryId(post.category_id);
    setSeriesId(post.series_id);
    setSeriesOrder(post.series_order);
    const tags = post.post_tags?.map((pt) => pt.tags) || [];
    setSelectedTags(tags);
    initialTagIdsRef.current = new Set(tags.map((tag) => tag.id));
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!postId) setSlug(generateSlug(value));
  }

  async function save() {
    if (!title.trim()) {
      showStatus("Title is required.", "error");
      return;
    }
    if (!slug.trim()) {
      showStatus("Slug is required.", "error");
      return;
    }

    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      published,
      category_id: categoryId,
      series_id: seriesId,
      series_order: seriesOrder,
      updated_at: new Date().toISOString(),
    };

    let savedPostId = postId;

    if (postId) {
      const { error } = await supabase
        .from("posts")
        .update(postData)
        .eq("id", postId);
      if (error) {
        showStatus("Failed to save: " + error.message, "error");
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("posts")
        .insert(postData)
        .select("id")
        .single();
      if (error || !data) {
        showStatus(
          "Failed to save: " + (error?.message || "Unknown error"),
          "error"
        );
        return;
      }
      savedPostId = data.id;
    }

    // Sync tags by diffing to minimize writes.
    if (savedPostId) {
      const nextTagIds = new Set(selectedTags.map((tag) => tag.id));
      const prevTagIds = initialTagIdsRef.current;
      const tagIdsToDelete = [...prevTagIds].filter((id) => !nextTagIds.has(id));
      const tagIdsToInsert = [...nextTagIds].filter((id) => !prevTagIds.has(id));

      if (tagIdsToDelete.length > 0) {
        const { error: deleteTagsError } = await supabase
          .from("post_tags")
          .delete()
          .eq("post_id", savedPostId)
          .in("tag_id", tagIdsToDelete);

        if (deleteTagsError) {
          showStatus("Failed to sync tags: " + deleteTagsError.message, "error");
          return;
        }
      }

      if (tagIdsToInsert.length > 0) {
        const { error: insertTagsError } = await supabase
          .from("post_tags")
          .insert(
            tagIdsToInsert.map((tagId) => ({
              post_id: savedPostId!,
              tag_id: tagId,
            }))
          );

        if (insertTagsError) {
          showStatus("Failed to sync tags: " + insertTagsError.message, "error");
          return;
        }
      }

      initialTagIdsRef.current = nextTagIds;
    }

    showStatus(postId ? "Post updated." : "Post created.", "success");
    setTimeout(onBack, 800);
  }

  function showStatus(text: string, type: "success" | "error") {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  }

  return (
    <div className="post-editor-shell h-full min-h-0 flex flex-col border border-border bg-secondary/20 backdrop-blur-sm p-4 sm:p-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-border">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-muted-foreground text-[0.825rem] cursor-pointer bg-transparent border-none font-sans p-0 transition-colors hover:text-foreground"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3 py-1.5">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-3.5 h-3.5 accent-foreground"
            />
            <label
              htmlFor="published"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Published
            </label>
          </div>
          <button
            onClick={save}
            className="px-4 py-2 rounded-md bg-foreground text-background font-medium text-xs cursor-pointer border-none transition-opacity hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`px-4 py-2.5 rounded-lg text-[0.8rem] mb-4 border ${
            statusMsg.type === "success"
              ? "bg-green-400/10 text-green-400 border-green-400/20"
              : "bg-red-400/10 text-red-400 border-red-400/20"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Title — always visible, large and prominent */}
      <input
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Post title"
        className="w-full bg-transparent text-foreground text-2xl sm:text-3xl font-bold border-none outline-none mb-2 placeholder:text-muted-foreground/40 tracking-tight"
      />

      {/* Collapsible metadata */}
      <button
        onClick={() => setMetaOpen(!metaOpen)}
        className="inline-flex items-center gap-1.5 text-muted-foreground text-[0.7rem] uppercase tracking-wider font-medium mb-3 cursor-pointer bg-transparent border-none font-sans p-0 transition-colors hover:text-foreground w-fit"
      >
        <FontAwesomeIcon
          icon={metaOpen ? faChevronUp : faChevronDown}
          className="text-[0.55rem]"
        />
        {metaOpen ? "Hide details" : "Details"}
      </button>

      {metaOpen && (
        <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="post-url-slug"
              className="px-3 py-2 bg-secondary text-foreground border border-border rounded-md font-sans text-xs transition-colors focus:outline-none focus:border-muted-foreground"
            />
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short excerpt for listings"
              className="px-3 py-2 bg-secondary text-foreground border border-border rounded-md font-sans text-xs transition-colors focus:outline-none focus:border-muted-foreground"
            />
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="px-3 py-2 bg-secondary text-foreground border border-border rounded-md font-sans text-xs transition-colors focus:outline-none focus:border-muted-foreground"
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={seriesId || ""}
              onChange={(e) => setSeriesId(e.target.value || null)}
              className="px-3 py-2 bg-secondary text-foreground border border-border rounded-md font-sans text-xs transition-colors focus:outline-none focus:border-muted-foreground"
            >
              <option value="">No series</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {seriesId && (
              <input
                type="number"
                value={seriesOrder ?? ""}
                onChange={(e) =>
                  setSeriesOrder(
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
                placeholder="Series order (1, 2, 3...)"
                min={1}
                className="px-3 py-2 bg-secondary text-foreground border border-border rounded-md font-sans text-xs transition-colors focus:outline-none focus:border-muted-foreground"
              />
            )}
          </div>
          <TagInput selectedTags={selectedTags} onChange={setSelectedTags} />
        </div>
      )}

      {/* Editor — takes remaining space */}
      <div className="flex-1 min-h-0" data-color-mode="dark">
        <MDEditor
          className="post-editor-md"
          value={content}
          onChange={(val) => setContent(val || "")}
          height="100%"
          style={{ height: "100%" }}
          preview="live"
          visibleDragbar={false}
          textareaProps={{
            placeholder:
              "Write your post in markdown. Use headings, lists, links, and code blocks.",
          }}
        />
      </div>
    </div>
  );
}
