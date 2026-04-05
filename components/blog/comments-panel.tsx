"use client";

import { type FormEvent, useEffect, useState } from "react";
import { supabase, formatDate } from "@/lib/supabase";

type CommentRow = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export default function CommentsPanel({ postId }: { postId: string }) {
  const isSupabaseUnavailable = !supabase;
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [isLoading, setIsLoading] = useState(!isSupabaseUnavailable);
  const [isUnsupported, setIsUnsupported] = useState(isSupabaseUnavailable);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      return;
    }

    let cancelled = false;

    async function loadComments() {
      const { data, error } = await client!
        .from("post_comments")
        .select("id, author_name, body, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (cancelled) {
        return;
      }

      if (error) {
        setIsUnsupported(true);
        setIsLoading(false);
        return;
      }

      setComments((data as CommentRow[]) || []);
      setIsLoading(false);
    }

    void loadComments();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authorName.trim() || !body.trim() || isSubmitting || isUnsupported) {
      return;
    }

    const client = supabase;
    if (!client) {
      setFeedback({
        type: "error",
        message: "Comments are not available yet.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const { data, error } = await client
      .from("post_comments")
      .insert({
        post_id: postId,
        author_name: authorName.trim(),
        body: body.trim(),
      })
      .select("id, author_name, body, created_at")
      .single();

    if (error || !data) {
      setFeedback({
        type: "error",
        message: "Comments are not available yet.",
      });
      setIsSubmitting(false);
      return;
    }

    setComments((prev) => [data as CommentRow, ...prev]);
    setAuthorName("");
    setBody("");
    setFeedback({ type: "success", message: "Comment posted successfully." });
    setIsSubmitting(false);

    // Auto-clear success feedback
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <section className="comments-panel" id="comments">
      <div className="comments-panel__header">
        <div>
          <p className="comments-panel__eyebrow">Discussion</p>
          <h2 className="comments-panel__title">Comments</h2>
        </div>
        <span className="comments-panel__count">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            comments.length
          )}
        </span>
      </div>

      <form
        className="comments-panel__form"
        onSubmit={handleSubmit}
        aria-label="Post a comment"
      >
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          className="comments-panel__input"
          disabled={isUnsupported || isSubmitting}
          maxLength={100}
          autoComplete="name"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            isUnsupported
              ? "Comments are being wired up."
              : "Share your thoughts..."
          }
          className="comments-panel__textarea"
          disabled={isUnsupported || isSubmitting}
          maxLength={2000}
        />
        <div className="comments-panel__actions">
          <p className="comments-panel__note">
            {isUnsupported
              ? "Comment storage is not configured yet."
              : "Be respectful and constructive."}
          </p>
          <button
            type="submit"
            className="comments-panel__submit"
            disabled={
              isUnsupported ||
              isSubmitting ||
              !authorName.trim() ||
              !body.trim()
            }
          >
            {isSubmitting ? "Posting..." : "Post comment"}
          </button>
        </div>
        {feedback && (
          <p
            className={`text-xs font-mono ${
              feedback.type === "success"
                ? "text-green-400/80"
                : "text-red-400/80"
            }`}
            role="status"
          >
            {feedback.message}
          </p>
        )}
      </form>

      <div className="comments-panel__list" role="list">
        {isLoading ? (
          <div className="py-6 flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 w-24 bg-muted rounded mb-2" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="comments-panel__empty py-8 text-center">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="comments-panel__item"
              role="listitem"
            >
              <div className="comments-panel__item-meta">
                <strong>{comment.author_name}</strong>
                <span>&middot;</span>
                <time dateTime={comment.created_at}>
                  {formatDate(comment.created_at)}
                </time>
              </div>
              <p className="comments-panel__item-body">{comment.body}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
