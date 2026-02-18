"use client";

import { useState } from "react";
import BlogNav from "@/components/blog-nav";
import AuthGate from "@/components/admin/auth-gate";
import PostList from "@/components/admin/post-list";
import PostEditor from "@/components/admin/post-editor";
import CategoryManager from "@/components/admin/category-manager";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  function openEditor(id: string | null) {
    setEditingPostId(id);
    setView("editor");
  }

  function backToList() {
    setEditingPostId(null);
    setView("list");
  }

  const isEditor = view === "editor";

  return (
    <div
      className={`transition-all duration-300 ${
        isEditor
          ? "h-screen w-screen max-w-none overflow-hidden"
          : "mx-auto min-h-screen max-w-[720px]"
      }`}
      style={{
        padding: isEditor
          ? "0"
          : "clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 2rem)",
      }}
    >
      {!isEditor && <BlogNav />}

      <AuthGate>
        {(session) => (
          <div className={isEditor ? "h-full" : ""}>
            {!isEditor && (
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-semibold text-foreground">
                  Blog Admin
                </h1>
                <div className="flex items-center gap-3 text-muted-foreground text-[0.825rem]">
                  <span>
                    {(session.user.user_metadata.user_name as string) ||
                      session.user.email}
                  </span>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="px-3 py-1.5 rounded-md text-xs bg-secondary text-secondary-foreground border border-border cursor-pointer transition-colors hover:bg-muted"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}

            {view === "list" ? (
              <>
              <CategoryManager />
              <PostList
                onEdit={(id) => openEditor(id)}
                onNew={() => openEditor(null)}
              />
              </>
            ) : (
              <PostEditor postId={editingPostId} onBack={backToList} />
            )}
          </div>
        )}
      </AuthGate>

      {!isEditor && (
        <footer className="mt-16 pt-8 border-t border-border text-muted-foreground text-xs">
          <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
}
