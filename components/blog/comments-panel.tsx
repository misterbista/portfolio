"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase, formatDate } from "@/lib/supabase";

type CommentRow = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export default function CommentsPanel({ postId }: { postId: string }) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      const { data, error } = await supabase
        .from("post_comments")
        .select("id, author_name, body, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setIsUnsupported(true);
        setIsLoading(false);
        return;
      }

      setComments((data as CommentRow[]) || []);
      setIsLoading(false);
    }

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authorName.trim() || !body.trim() || isSubmitting || isUnsupported) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        author_name: authorName.trim(),
        body: body.trim(),
      })
      .select("id, author_name, body, created_at")
      .single();

    if (error || !data) {
      setFeedback("Comments are not available yet.");
      setIsSubmitting(false);
      return;
    }

    setComments((prev) => [data as CommentRow, ...prev]);
    setAuthorName("");
    setBody("");
    setFeedback("Comment posted.");
    setIsSubmitting(false);
  }

  return (
    <section className="comments-panel">
      <div className="comments-panel__header">
        <div>
          <p className="comments-panel__eyebrow">Discussion</p>
          <h2 className="comments-panel__title">Comments</h2>
        </div>
        <span className="comments-panel__count">
          {isLoading ? "..." : comments.length}
        </span>
      </div>

      <form className="comments-panel__form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="Your name"
          className="comments-panel__input"
          disabled={isUnsupported || isSubmitting}
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={
            isUnsupported
              ? "Comments are being wired up."
              : "Share your thoughts..."
          }
          className="comments-panel__textarea"
          disabled={isUnsupported || isSubmitting}
        />
        <div className="comments-panel__actions">
          <p className="comments-panel__note">
            {isUnsupported
              ? "Comment storage is not configured yet."
              : "Comments go directly to the blog discussion stream."}
          </p>
          <button
            type="submit"
            className="comments-panel__submit"
            disabled={isUnsupported || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post comment"}
          </button>
        </div>
        {feedback && <p className="comments-panel__feedback">{feedback}</p>}
      </form>

      <div className="comments-panel__list">
        {isLoading ? (
          <p className="comments-panel__empty">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="comments-panel__empty">
            No comments yet. Start the discussion.
          </p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="comments-panel__item">
              <div className="comments-panel__item-meta">
                <strong>{comment.author_name}</strong>
                <span>{formatDate(comment.created_at)}</span>
              </div>
              <p className="comments-panel__item-body">{comment.body}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
