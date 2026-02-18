"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ALLOWED_GITHUB_USER } from "@/lib/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import type { Session } from "@supabase/supabase-js";

export default function AuthGate({
  children,
}: {
  children: (session: Session) => React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "unauthorized" | "ready">(
    "loading"
  );
  const hasResolved = useRef(false);

  useEffect(() => {
    // Check if URL has OAuth callback params — if so, wait for onAuthStateChange
    const hasAuthParams =
      window.location.hash.includes("access_token") ||
      window.location.search.includes("code=") ||
      window.location.search.includes("error=");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[auth-gate] event:", event, "session:", !!session);
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        hasResolved.current = true;
        checkSession(session);
      }
      if (event === "SIGNED_OUT") {
        hasResolved.current = true;
        setSession(null);
        setStatus("ready");
      }
    });

    // If no auth params in URL, also try getSession as fallback
    if (!hasAuthParams) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!hasResolved.current) {
          checkSession(session);
        }
      });
    }

    // Safety timeout — don't stay on "loading" forever
    const timeout = setTimeout(() => {
      if (!hasResolved.current) {
        hasResolved.current = true;
        setStatus("ready");
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  function checkSession(s: Session | null) {
    if (!s) {
      setSession(null);
      setStatus("ready");
      return;
    }
    const username =
      (s.user.user_metadata.user_name as string) ||
      (s.user.user_metadata.preferred_username as string) ||
      "";
    console.log(
      "[auth-gate] username:",
      username,
      "allowed:",
      ALLOWED_GITHUB_USER
    );
    if (
      !ALLOWED_GITHUB_USER ||
      username.toLowerCase() !== ALLOWED_GITHUB_USER.toLowerCase()
    ) {
      supabase.auth.signOut();
      setSession(null);
      setStatus("unauthorized");
      return;
    }
    setSession(s);
    setStatus("ready");
  }

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin + "/admin" },
    });
  }

  if (status === "loading") {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (session) {
    return <>{children(session)}</>;
  }

  return (
    <div className="text-center py-16">
      {status === "unauthorized" && (
        <p className="text-red-400 mb-4 text-sm">
          Unauthorized. This admin panel is restricted.
        </p>
      )}
      <p className="text-muted-foreground mb-6 text-[0.925rem]">
        Sign in to manage blog posts.
      </p>
      <button
        onClick={signIn}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background font-medium text-sm cursor-pointer border-none transition-opacity hover:opacity-90"
      >
        <FontAwesomeIcon icon={faGithub} />
        Sign in with GitHub
      </button>
    </div>
  );
}
