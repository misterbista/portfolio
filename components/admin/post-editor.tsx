"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  calculateReadingTime,
  generateSlug,
  supabase,
  type Category,
  type Post,
  type Series,
  type Tag,
} from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import TiptapEditor from "./tiptap-editor";
import TagInput from "./tag-input";

type Props = { postId: string | null; onBack: () => void };
type StatusType = "success" | "error" | "info";
type Draft = {
  title: string; slug: string; excerpt: string; content: string; published: boolean;
  categoryId: string | null; seriesId: string | null; seriesOrder: number | null; selectedTags: Tag[];
};

const EMPTY_DRAFT: Draft = {
  title: "", slug: "", excerpt: "", content: "", published: false,
  categoryId: null, seriesId: null, seriesOrder: null, selectedTags: [],
};

function snapshot(draft: Draft) {
  return JSON.stringify({ ...draft, selectedTags: draft.selectedTags.map((tag) => tag.id).sort() });
}

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Draft>;
  return typeof candidate.title === "string" && typeof candidate.slug === "string" &&
    typeof candidate.excerpt === "string" && typeof candidate.content === "string" &&
    typeof candidate.published === "boolean" && Array.isArray(candidate.selectedTags);
}

export default function PostEditor({ postId, onBack }: Props) {
  const initialTagIdsRef = useRef<Set<string>>(new Set());
  const initialSnapshotRef = useRef(snapshot(EMPTY_DRAFT));
  const statusTimeoutRef = useRef<number | null>(null);
  const previewPanelRef = useRef<HTMLDivElement | null>(null);
  const [activePostId, setActivePostId] = useState(postId);
  const [editorView, setEditorView] = useState<"edit" | "split" | "preview">("edit");
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
  const [isLoading, setIsLoading] = useState(Boolean(postId));
  const [isReady, setIsReady] = useState(!postId);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [recoveredDraft, setRecoveredDraft] = useState<Draft | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: StatusType } | null>(null);

  const currentDraft = useMemo<Draft>(() => ({
    title, slug, excerpt, content, published, categoryId, seriesId, seriesOrder, selectedTags,
  }), [categoryId, content, excerpt, published, selectedTags, seriesId, seriesOrder, slug, title]);
  const currentSnapshot = useMemo(() => snapshot(currentDraft), [currentDraft]);
  const draftStorageKey = `portfolio:post-editor-draft:${activePostId ?? "new"}`;
  const readingTime = calculateReadingTime(content);

  const showStatus = useCallback((text: string, type: StatusType) => {
    if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current);
    setStatusMsg({ text, type });
    statusTimeoutRef.current = window.setTimeout(() => setStatusMsg(null), 5000);
  }, []);

  const applyDraft = useCallback((draft: Draft) => {
    setTitle(draft.title); setSlug(draft.slug); setExcerpt(draft.excerpt); setContent(draft.content);
    setPublished(draft.published); setCategoryId(draft.categoryId); setSeriesId(draft.seriesId);
    setSeriesOrder(draft.seriesOrder); setSelectedTags(draft.selectedTags);
  }, []);

  useEffect(() => () => {
    if (statusTimeoutRef.current) window.clearTimeout(statusTimeoutRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;
    void Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("series").select("*").order("name"),
    ]).then(([catRes, seriesRes]) => {
      if (cancelled) return;
      if (catRes.error || seriesRes.error) showStatus("Some editor details could not be loaded. You can still write and save.", "info");
      setCategories(catRes.data || []);
      setSeriesList(seriesRes.data || []);
    });

    return () => { cancelled = true; };
  }, [showStatus]);

  useEffect(() => {
    let cancelled = false;
    if (!supabase || !postId) return;

    void (async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, post_tags(tags(id, name, slug, created_at))")
        .eq("id", postId)
        .single();
      if (cancelled) return;
      if (error || !data) {
        showStatus("Failed to load this post. Please go back and try again.", "error");
        setIsLoading(false);
        return;
      }
      const post = data as Post & { post_tags?: { tags: Tag }[] };
      const nextDraft: Draft = {
        title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
        published: post.published, categoryId: post.category_id, seriesId: post.series_id,
        seriesOrder: post.series_order, selectedTags: post.post_tags?.map((item) => item.tags).filter(Boolean) || [],
      };
      applyDraft(nextDraft);
      initialTagIdsRef.current = new Set(nextDraft.selectedTags.map((tag) => tag.id));
      initialSnapshotRef.current = snapshot(nextDraft);
      setIsLoading(false);
      setIsReady(true);
    })();

    return () => { cancelled = true; };
  }, [applyDraft, postId, showStatus]);

  useEffect(() => {
    if (isReady) setIsDirty(currentSnapshot !== initialSnapshotRef.current);
  }, [currentSnapshot, isReady]);

  useEffect(() => {
    if (!isReady) return;
    try {
      const savedDraft = window.localStorage.getItem(draftStorageKey);
      if (!savedDraft) return;
      const parsed: unknown = JSON.parse(savedDraft);
      if (isDraft(parsed) && snapshot(parsed) !== initialSnapshotRef.current) {
        const timeout = window.setTimeout(() => setRecoveredDraft(parsed), 0);
        return () => window.clearTimeout(timeout);
      }
    } catch {
      window.localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, isReady]);

  useEffect(() => {
    if (!isReady || !isDirty || isSaving) return;
    const timeout = window.setTimeout(() => {
      try { window.localStorage.setItem(draftStorageKey, JSON.stringify(currentDraft)); } catch { /* Storage is optional. */ }
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [currentDraft, draftStorageKey, isDirty, isReady, isSaving]);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty]);

  const save = useCallback(async () => {
    const cleanTitle = title.trim();
    const cleanSlug = slug.trim().toLowerCase();
    const plainContent = content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
    if (!cleanTitle) return showStatus("Add a title before saving.", "error");
    if (!cleanSlug) {
      setMetaOpen(true);
      return showStatus("Add a URL slug before saving.", "error");
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setMetaOpen(true);
      return showStatus("Use lowercase letters, numbers, and single hyphens in the slug.", "error");
    }
    if (published && !plainContent) return showStatus("Add content before publishing this post.", "error");
    if (seriesId && (!Number.isSafeInteger(seriesOrder) || (seriesOrder ?? 0) < 1)) {
      setMetaOpen(true);
      return showStatus("Set a whole-number series order of 1 or higher.", "error");
    }
    if (!supabase) return showStatus("Supabase is not configured.", "error");

    setIsSaving(true);
    const postData = {
      title: cleanTitle, slug: cleanSlug, excerpt: excerpt.trim(), content, published,
      category_id: categoryId, series_id: seriesId, series_order: seriesId ? seriesOrder : null,
      updated_at: new Date().toISOString(),
    };
    const wasNew = !activePostId;
    let savedPostId = activePostId;
    const response = activePostId
      ? await supabase.from("posts").update(postData).eq("id", activePostId)
      : await supabase.from("posts").insert(postData).select("id").single();

    if (response.error) {
      setIsSaving(false);
      return showStatus(`Could not save: ${response.error.message}`, "error");
    }
    if (!savedPostId && "data" in response && response.data) savedPostId = response.data.id;
    if (!savedPostId) {
      setIsSaving(false);
      return showStatus("The post saved but its ID was not returned. Refresh before editing further.", "error");
    }

    const nextTagIds = new Set(selectedTags.map((tag) => tag.id));
    const previousTagIds = initialTagIdsRef.current;
    const tagIdsToDelete = [...previousTagIds].filter((id) => !nextTagIds.has(id));
    const tagIdsToInsert = [...nextTagIds].filter((id) => !previousTagIds.has(id));
    if (tagIdsToDelete.length) {
      const { error } = await supabase.from("post_tags").delete().eq("post_id", savedPostId).in("tag_id", tagIdsToDelete);
      if (error) { setIsSaving(false); return showStatus(`Post saved, but tags could not be updated: ${error.message}`, "error"); }
    }
    if (tagIdsToInsert.length) {
      const { error } = await supabase.from("post_tags").insert(tagIdsToInsert.map((tagId) => ({ post_id: savedPostId, tag_id: tagId })));
      if (error) { setIsSaving(false); return showStatus(`Post saved, but tags could not be updated: ${error.message}`, "error"); }
    }

    initialTagIdsRef.current = nextTagIds;
    const savedDraft = { ...currentDraft, title: cleanTitle, slug: cleanSlug, excerpt: excerpt.trim(), seriesOrder: seriesId ? seriesOrder : null };
    initialSnapshotRef.current = snapshot(savedDraft);
    setTitle(cleanTitle); setSlug(cleanSlug); setExcerpt(excerpt.trim());
    if (wasNew) {
      try { window.localStorage.removeItem("portfolio:post-editor-draft:new"); } catch { /* Storage is optional. */ }
      setActivePostId(savedPostId);
    }
    try { window.localStorage.removeItem(`portfolio:post-editor-draft:${savedPostId}`); } catch { /* Storage is optional. */ }
    setIsDirty(false);
    setIsSaving(false);
    showStatus(wasNew ? "Post created. Your changes are saved." : "All changes saved.", "success");
  }, [activePostId, categoryId, content, currentDraft, excerpt, published, selectedTags, seriesId, seriesOrder, showStatus, slug, title]);

  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!isSaving && isReady) void save();
      }
    };
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [isReady, isSaving, save]);

  useEffect(() => {
    if (editorView === "preview") previewPanelRef.current?.scrollTo({ top: 0 });
  }, [editorView]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!activePostId) setSlug(generateSlug(value));
  }

  function handleBack() {
    if (isDirty) {
      setLeaveDialogOpen(true);
      return;
    }
    onBack();
  }

  if (isLoading) {
    return <div className="post-editor-shell post-editor-loading" role="status">Loading post editor…</div>;
  }

  return (
    <div className="post-editor-shell h-full min-h-0 flex flex-col border border-border bg-secondary/20 backdrop-blur-sm p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-border">
        <button onClick={handleBack} className="editor-back-button" aria-label="Back to posts">
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center rounded-full border border-border bg-secondary/80 p-1" role="tablist" aria-label="Editor view">
            {(["edit", "split", "preview"] as const).map((mode) => (
              <button key={mode} id={`editor-tab-${mode}`} type="button" role="tab" onClick={() => setEditorView(mode)} aria-selected={editorView === mode} aria-controls="editor-workspace" title={`${mode[0].toUpperCase()}${mode.slice(1)} view`} className={`rounded-full px-3 py-1.5 text-[0.72rem] capitalize transition-colors ${editorView === mode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                {mode}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/80 px-3 py-1.5 cursor-pointer">
            <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="w-3.5 h-3.5 accent-foreground" />
            <span className="text-xs text-muted-foreground">Published</span>
          </label>
          <button onClick={() => void save()} disabled={isSaving || !isReady} className="editor-save-button" title="Save changes (Ctrl/Cmd + S)">
            {isSaving ? "Saving…" : isDirty ? "Save changes" : "Saved"}
          </button>
        </div>
      </div>

      {statusMsg && <div className={`editor-status editor-status--${statusMsg.type}`} role={statusMsg.type === "error" ? "alert" : "status"}>{statusMsg.text}</div>}
      {recoveredDraft && (
        <div className="editor-status editor-status--info editor-draft-notice" role="status">
          <span>An unsaved local draft is available.</span>
          <span className="editor-draft-notice__actions">
            <button type="button" onClick={() => { applyDraft(recoveredDraft); setRecoveredDraft(null); }}>Restore draft</button>
            <button type="button" onClick={() => { try { window.localStorage.removeItem(draftStorageKey); } catch {} setRecoveredDraft(null); }}>Dismiss</button>
          </span>
        </div>
      )}

      <div className="editor-title-row">
        <input type="text" value={title} onChange={(event) => handleTitleChange(event.target.value)} placeholder="Post title" aria-label="Post title" className="w-full bg-transparent text-foreground text-2xl sm:text-3xl font-bold border-none outline-none placeholder:text-muted-foreground/40 tracking-tight" />
        <span className="editor-reading-time">{readingTime} min read</span>
      </div>

      <button type="button" onClick={() => setMetaOpen((open) => !open)} aria-expanded={metaOpen} className="inline-flex items-center gap-1.5 text-muted-foreground text-[0.7rem] uppercase tracking-wider font-medium mb-3 cursor-pointer bg-transparent border-none font-sans p-0 transition-colors hover:text-foreground w-fit">
        <FontAwesomeIcon icon={metaOpen ? faChevronUp : faChevronDown} className="text-[0.55rem]" />
        {metaOpen ? "Hide details" : "Details"}
      </button>

      {metaOpen && (
        <div className="flex flex-col gap-3 mb-5 pb-5 border-b border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="editor-field"><span>URL slug</span><input type="text" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="post-url-slug" spellCheck={false} /></label>
            <label className="editor-field"><span>Excerpt</span><input type="text" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="Short excerpt for listings" /></label>
            <label className="editor-field"><span>Category</span><select value={categoryId || ""} onChange={(event) => setCategoryId(event.target.value || null)}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="editor-field"><span>Series</span><select value={seriesId || ""} onChange={(event) => { setSeriesId(event.target.value || null); if (!event.target.value) setSeriesOrder(null); }}><option value="">No series</option>{seriesList.map((series) => <option key={series.id} value={series.id}>{series.name}</option>)}</select></label>
            {seriesId && <label className="editor-field"><span>Series order</span><input type="number" value={seriesOrder ?? ""} onChange={(event) => setSeriesOrder(event.target.value === "" ? null : Number(event.target.value))} placeholder="1" min={1} step={1} /></label>}
          </div>
          <TagInput selectedTags={selectedTags} onChange={setSelectedTags} />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <div id="editor-workspace" role="tabpanel" aria-labelledby={`editor-tab-${editorView}`} className={`post-editor-workspace grid h-full min-h-0 gap-4 ${editorView === "split" ? "post-editor-workspace--split" : "grid-cols-1"}`}>
          {editorView !== "preview" && <div className="post-editor-pane min-h-0"><TiptapEditor content={content} onChange={setContent} /></div>}
          {editorView !== "edit" && (
            <div ref={previewPanelRef} className="post-preview-panel post-editor-pane min-h-0 overflow-y-auto rounded-2xl border border-border bg-secondary/25 p-5" tabIndex={0} aria-label="Post preview">
              <div className="mb-6 border-b border-border pb-4"><p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground font-medium">Preview</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{title || "Untitled post"}</h1>{excerpt && <p className="mt-3 text-sm leading-7 text-muted-foreground">{excerpt}</p>}</div>
              <div className="markdown-body" dangerouslySetInnerHTML={{ __html: content || "<p class='text-muted-foreground'>Start writing to see the preview.</p>" }} />
            </div>
          )}
        </div>
      </div>

      {leaveDialogOpen && (
        <div className="editor-dialog-backdrop" role="presentation" onMouseDown={() => setLeaveDialogOpen(false)}>
          <div className="editor-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="leave-editor-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 id="leave-editor-title">Leave without saving?</h2>
            <p>Your latest changes are kept on this device as a recoverable draft, but they have not been saved to your post.</p>
            <div className="editor-confirm-dialog__actions">
              <button type="button" onClick={() => setLeaveDialogOpen(false)}>Keep editing</button>
              <button type="button" onClick={onBack}>Leave editor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
