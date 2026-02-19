"use client";

import { useEffect, useState } from "react";
import { supabase, generateSlug, type Series } from "@/lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

export default function SeriesManager() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadSeries();
  }, []);

  async function loadSeries() {
    setLoading(true);
    const { data } = await supabase
      .from("series")
      .select("id, name, slug, description, created_at")
      .order("name");
    setSeriesList(data || []);
    setLoading(false);
  }

  async function addSeries() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const slug = generateSlug(trimmed);
    const { error } = await supabase
      .from("series")
      .insert({ name: trimmed, slug, description: description.trim() });

    if (error) {
      showStatus(
        error.message.includes("duplicate")
          ? "Series already exists."
          : "Failed to add: " + error.message,
        "error"
      );
      return;
    }

    setName("");
    setDescription("");
    showStatus("Series added.", "success");
    loadSeries();
  }

  async function deleteSeries(id: string, seriesName: string) {
    if (
      !confirm(
        `Delete "${seriesName}"? Posts will be removed from this series.`
      )
    )
      return;

    const { error } = await supabase
      .from("series")
      .delete()
      .eq("id", id);

    if (error) {
      showStatus("Failed to delete: " + error.message, "error");
      return;
    }

    showStatus("Series deleted.", "success");
    loadSeries();
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
        Series ({loading ? "..." : seriesList.length})
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

          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSeries()}
                placeholder="Series name"
                className="flex-1 px-3 py-2 bg-secondary text-foreground border border-border rounded-md font-sans text-xs transition-colors focus:outline-none focus:border-muted-foreground"
              />
              <button
                onClick={addSeries}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-foreground text-background font-medium text-xs cursor-pointer border-none transition-opacity hover:opacity-90"
              >
                <FontAwesomeIcon icon={faPlus} /> Add
              </button>
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="px-3 py-2 bg-secondary text-foreground border border-border rounded-md font-sans text-xs transition-colors focus:outline-none focus:border-muted-foreground"
            />
          </div>

          {loading ? (
            <p className="text-muted-foreground text-xs">Loading...</p>
          ) : seriesList.length === 0 ? (
            <p className="text-muted-foreground text-xs">No series yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {seriesList.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-lg border border-border bg-secondary"
                >
                  <div>
                    <span className="text-foreground font-medium">
                      {s.name}
                    </span>
                    {s.description && (
                      <span className="text-muted-foreground ml-2">
                        — {s.description}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteSeries(s.id, s.name)}
                    className="text-red-400 bg-transparent border-none cursor-pointer p-0 text-[0.6rem] transition-colors hover:text-red-300 ml-2 shrink-0"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
