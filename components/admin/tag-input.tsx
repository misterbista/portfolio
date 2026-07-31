"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { generateSlug, supabase, type Tag } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type Props = { selectedTags: Tag[]; onChange: (tags: Tag[]) => void };

export default function TagInput({ selectedTags, onChange }: Props) {
  const listboxId = useId();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    void supabase.from("tags").select("id, name, slug, created_at").order("name").then(({ data, error: loadError }) => {
      if (cancelled) return;
      if (loadError) setError("Could not load existing tags.");
      setAllTags(data || []);
    });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => allTags.filter((tag) =>
    tag.name.toLowerCase().includes(input.toLowerCase()) && !selectedTags.some((selected) => selected.id === tag.id)
  ), [allTags, input, selectedTags]);
  const visibleTags = filtered.slice(0, 8);
  const trimmedInput = input.trim();
  const canCreate = Boolean(trimmedInput) && !allTags.some((tag) => tag.name.toLowerCase() === trimmedInput.toLowerCase());

  function selectTag(tag: Tag) {
    if (!selectedTags.some((selected) => selected.id === tag.id)) onChange([...selectedTags, tag]);
    setInput("");
    setError("");
    setShowSuggestions(false);
  }

  function removeTag(tagId: string) {
    onChange(selectedTags.filter((tag) => tag.id !== tagId));
  }

  async function createAndSelect() {
    const name = trimmedInput;
    if (!name || isCreating) return;
    if (name.length > 60) return setError("Tag names can be up to 60 characters.");
    const existing = allTags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
    if (existing) return selectTag(existing);
    if (!supabase) return setError("Tags are unavailable until Supabase is configured.");

    setIsCreating(true);
    setError("");
    const { data, error: createError } = await supabase.from("tags").insert({ name, slug: generateSlug(name) }).select().single();
    setIsCreating(false);
    if (createError || !data) {
      setError(createError?.message || "Could not create this tag. Try a different name.");
      return;
    }
    const nextTag = data as Tag;
    setAllTags((tags) => [...tags, nextTag].sort((a, b) => a.name.localeCompare(b.name)));
    selectTag(nextTag);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const optionCount = visibleTags.length + (canCreate ? 1 : 0);
    if (event.key === "ArrowDown" && optionCount) {
      event.preventDefault(); setShowSuggestions(true); setActiveIndex((index) => Math.min(index + 1, optionCount - 1));
    } else if (event.key === "ArrowUp" && optionCount) {
      event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (visibleTags[activeIndex]) selectTag(visibleTags[activeIndex]);
      else if (canCreate) void createAndSelect();
    } else if (event.key === "Backspace" && !input && selectedTags.length) {
      removeTag(selectedTags[selectedTags.length - 1].id);
    }
  }

  return (
    <div className="relative">
      <label htmlFor="post-tags" className="editor-field-label">Tags</label>
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tag) => (
            <span key={tag.id} className="inline-flex items-center gap-1 text-[0.675rem] px-2 py-0.5 rounded-full bg-secondary text-foreground border border-border">
              #{tag.name}
              <button type="button" onClick={() => removeTag(tag.id)} className="text-muted-foreground bg-transparent border-none cursor-pointer p-0 text-[0.55rem] transition-colors hover:text-foreground" aria-label={`Remove ${tag.name} tag`}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        id="post-tags" type="text" value={input}
        onChange={(event) => { setInput(event.target.value); setActiveIndex(0); setShowSuggestions(true); setError(""); }}
        onFocus={() => setShowSuggestions(true)} onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
        onKeyDown={handleKeyDown} placeholder="Search or create a tag" maxLength={60}
        role="combobox" aria-autocomplete="list" aria-expanded={showSuggestions && Boolean(trimmedInput)} aria-controls={listboxId}
        aria-activedescendant={showSuggestions && optionCountId(activeIndex, visibleTags.length, canCreate, listboxId) || undefined}
        className="w-full px-3 py-2 bg-secondary text-foreground border border-border rounded-md font-sans text-xs transition-colors focus:outline-none focus:border-muted-foreground"
      />
      {error && <p className="editor-field-error" role="alert">{error}</p>}
      {showSuggestions && trimmedInput && (visibleTags.length > 0 || canCreate) && (
        <div id={listboxId} role="listbox" className="absolute z-10 w-full mt-1 bg-secondary border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
          {visibleTags.map((tag, index) => (
            <button key={tag.id} id={`${listboxId}-option-${index}`} type="button" role="option" aria-selected={activeIndex === index} onMouseDown={() => selectTag(tag)} className={`w-full text-left px-3 py-1.5 text-xs text-foreground bg-transparent border-none cursor-pointer transition-colors hover:bg-muted ${activeIndex === index ? "bg-muted" : ""}`}>
              #{tag.name}
            </button>
          ))}
          {canCreate && <button id={`${listboxId}-option-${visibleTags.length}`} type="button" role="option" aria-selected={activeIndex === visibleTags.length} onMouseDown={() => void createAndSelect()} className={`w-full text-left px-3 py-2 text-xs text-foreground bg-transparent border-t border-border cursor-pointer transition-colors hover:bg-muted ${activeIndex === visibleTags.length ? "bg-muted" : ""}`}>
            {isCreating ? "Creating tag…" : <>Create “{trimmedInput}”</>}
          </button>}
        </div>
      )}
    </div>
  );
}

function optionCountId(index: number, filteredLength: number, canCreate: boolean, listboxId: string) {
  if (index < filteredLength || canCreate) return `${listboxId}-option-${index}`;
  return undefined;
}
