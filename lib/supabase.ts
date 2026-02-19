import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Types ──────────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Series = {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type PostReaction = {
  id: string;
  post_id: string;
  emoji: ReactionEmoji;
  created_at: string;
};

export type ReactionEmoji =
  | "thumbs_up"
  | "heart"
  | "fire"
  | "eyes"
  | "rocket";

export type TocItem = {
  level: number;
  text: string;
  id: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  series_id: string | null;
  series_order: number | null;
  view_count: number;
  categories?: Category | null;
  series?: Series | null;
  tags?: Tag[];
};

// ── Constants ──────────────────────────────────────────

export const REACTION_EMOJIS: {
  key: ReactionEmoji;
  label: string;
  icon: string;
}[] = [
  { key: "thumbs_up", label: "Thumbs Up", icon: "👍" },
  { key: "heart", label: "Heart", icon: "❤️" },
  { key: "fire", label: "Fire", icon: "🔥" },
  { key: "eyes", label: "Eyes", icon: "👀" },
  { key: "rocket", label: "Rocket", icon: "🚀" },
];

// ── Helpers ────────────────────────────────────────────

export function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateReadingTime(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/[#*`~>\-|]/g, "")
    .trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[2].replace(/[`*_~]/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    items.push({ level: match[1].length, text, id });
  }
  return items;
}
