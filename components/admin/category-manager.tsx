"use client";

import { useEffect, useState } from "react";
import { supabase, generateSlug, type Category } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories(data || []);
    setLoading(false);
  }

  async function addCategory() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const slug = generateSlug(trimmed);
    const { error } = await supabase
      .from("categories")
      .insert({ name: trimmed, slug });

    if (error) {
      showStatus(
        error.message.includes("duplicate")
          ? "Category already exists."
          : "Failed to add: " + error.message,
        "error"
      );
      return;
    }

    setName("");
    showStatus("Category added.", "success");
    loadCategories();
  }

  async function deleteCategory(id: string, catName: string) {
    if (!confirm(`Delete "${catName}"? Posts will become uncategorized.`))
      return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      showStatus("Failed to delete: " + error.message, "error");
      return;
    }

    showStatus("Category deleted.", "success");
    loadCategories();
  }

  function showStatus(text: string, type: "success" | "error") {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium cursor-pointer bg-transparent border-none font-sans p-0 transition-colors hover:text-foreground"
      >
        <FontAwesomeIcon
          icon={open ? faChevronUp : faChevronDown}
          className="text-[0.55rem]"
        />
        Categories ({loading ? "..." : categories.length})
      </button>

      {open && (
        <div className="mt-4 p-4 border border-border rounded-lg bg-secondary/20">
          {statusMsg && (
            <div
              className={`px-4 py-2.5 rounded-lg text-[0.8rem] mb-3 border ${
                statusMsg.type === "success"
                  ? "bg-green-400/10 text-green-400 border-green-400/20"
                  : "bg-red-400/10 text-red-400 border-red-400/20"
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="New category name"
              className="flex-1 px-3 py-2 bg-secondary text-foreground border border-border rounded-md font-sans text-xs transition-colors focus:outline-none focus:border-muted-foreground"
            />
            <button
              onClick={addCategory}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-foreground text-background font-medium text-xs cursor-pointer border-none transition-opacity hover:opacity-90"
            >
              <FontAwesomeIcon icon={faPlus} /> Add
            </button>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-xs">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              No categories yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-border bg-secondary text-foreground"
                >
                  {cat.name}
                  <button
                    onClick={() => deleteCategory(cat.id, cat.name)}
                    className="text-red-400 bg-transparent border-none cursor-pointer p-0 text-[0.6rem] transition-colors hover:text-red-300"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
