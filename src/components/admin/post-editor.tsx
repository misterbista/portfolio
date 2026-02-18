"use client";

import { useEffect, useState } from "react";
import { supabase, generateSlug, type Post } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import MDEditor from "@uiw/react-md-editor";

type Props = {
  postId: string | null;
  onBack: () => void;
};

export default function PostEditor({ postId, onBack }: Props) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (postId) loadPost(postId);
  }, [postId]);

  async function loadPost(id: string) {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      showStatus("Failed to load post.", "error");
      return;
    }
    const post = data as Post;
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setPublished(post.published);
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
      updated_at: new Date().toISOString(),
    };

    const { error } = postId
      ? await supabase.from("posts").update(postData).eq("id", postId)
      : await supabase.from("posts").insert(postData);

    if (error) {
      showStatus("Failed to save: " + error.message, "error");
      return;
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
        {metaOpen ? "Hide details" : "Slug & excerpt"}
      </button>

      {metaOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 pb-5 border-b border-border">
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
