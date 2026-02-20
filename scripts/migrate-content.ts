/**
 * One-time migration: Convert markdown content to HTML for all posts.
 *
 * Usage:
 *   bun run scripts/migrate-content.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * in .env.local (or environment variables).
 */

import { createClient } from "@supabase/supabase-js";
import { marked, Renderer } from "marked";

// Load env from .env.local
const envFile = Bun.file(".env.local");
if (await envFile.exists()) {
  const text = await envFile.text();
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = val;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configure marked with heading IDs (same logic as the old blog renderer)
const renderer = new Renderer();
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  return `<h${depth} id="${id}">${text}</h${depth}>\n`;
};
marked.use({ renderer });

async function migrate() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, content");

  if (error) {
    console.error("Failed to fetch posts:", error.message);
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log("No posts found.");
    return;
  }

  console.log(`Found ${posts.length} posts. Migrating...`);

  let migrated = 0;
  let skipped = 0;

  for (const post of posts) {
    // Skip posts that already look like HTML
    if (post.content.trim().startsWith("<")) {
      console.log(`  SKIP: "${post.title}" (already HTML)`);
      skipped++;
      continue;
    }

    const html = marked.parse(post.content) as string;

    const { error: updateError } = await supabase
      .from("posts")
      .update({ content: html })
      .eq("id", post.id);

    if (updateError) {
      console.error(`  FAIL: "${post.title}" — ${updateError.message}`);
    } else {
      console.log(`  OK: "${post.title}"`);
      migrated++;
    }
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}`);
}

migrate();
