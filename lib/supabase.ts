import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const isBrowser = typeof window !== "undefined";

function initSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
    },
  });
}

export const supabase = initSupabase();
export const supabaseConfigError = supabase
  ? null
  : "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable blog data and admin features.";

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

export function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function extractToc(content: string): TocItem[] {
  const headingRegex = /<h([1-4])\s+id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
  const items: TocItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[3].replace(/<[^>]*>/g, "").trim();
    items.push({ level: parseInt(match[1], 10), text, id: match[2] });
  }
  return items;
}
