"use client";

import { useEffect, useState } from "react";
import { supabase, generateSlug, type Tag } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type Props = {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
};

export default function TagInput({ selectedTags, onChange }: Props) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    supabase
      .from("tags")
      .select("*")
      .order("name")
      .then(({ data }) => setAllTags(data || []));
  }, []);

  const filtered = allTags.filter(
    (t) =>
      t.name.toLowerCase().includes(input.toLowerCase()) &&
      !selectedTags.some((s) => s.id === t.id)
  );

  function selectTag(tag: Tag) {
    onChange([...selectedTags, tag]);
    setInput("");
    setShowSuggestions(false);
  }

  function removeTag(tagId: string) {
    onChange(selectedTags.filter((t) => t.id !== tagId));
  }

  async function createAndSelect() {
    const name = input.trim();
    if (!name) return;

    const existing = allTags.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      selectTag(existing);
      return;
    }

    const slug = generateSlug(name);
    const { data, error } = await supabase
      .from("tags")
      .insert({ name, slug })
      .select()
      .single();

    if (error || !data) return;

    const newTag = data as Tag;
    setAllTags((prev) => [...prev, newTag]);
    selectTag(newTag);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        selectTag(filtered[0]);
      } else if (input.trim()) {
        createAndSelect();
      }
    }
  }

  return (
    <div className="relative">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 text-[0.675rem] px-2 py-0.5 rounded-full bg-secondary text-foreground border border-border"
            >
              #{tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="text-muted-foreground bg-transparent border-none cursor-pointer p-0 text-[0.55rem] transition-colors hover:text-foreground"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder="Add tags (Enter to create new)"
        className="w-full px-3 py-2 bg-secondary text-foreground border border-border rounded-md font-sans text-xs transition-colors focus:outline-none focus:border-muted-foreground"
      />
      {showSuggestions && input && filtered.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-secondary border border-border rounded-md shadow-lg max-h-32 overflow-y-auto">
          {filtered.slice(0, 8).map((tag) => (
            <button
              key={tag.id}
              type="button"
              onMouseDown={() => selectTag(tag)}
              className="w-full text-left px-3 py-1.5 text-xs text-foreground bg-transparent border-none cursor-pointer transition-colors hover:bg-muted"
            >
              #{tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
