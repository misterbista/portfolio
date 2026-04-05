"use client";

import { useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faCheck } from "@fortawesome/free-solid-svg-icons";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";

type Props = {
  title: string;
  slug: string;
};

export default function SharePost({ title, slug }: Props) {
  const [copied, setCopied] = useState(false);

  const url = `https://piyushrajbista.com.np/blog/${slug}`;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const shareOnX = useCallback(() => {
    const text = encodeURIComponent(`${title} by @piyushrajbista`);
    const shareUrl = encodeURIComponent(url);
    window.open(
      `https://x.com/intent/tweet?text=${text}&url=${shareUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [title, url]);

  return (
    <div className="share-post">
      <button
        onClick={copyLink}
        className={`share-post__btn${copied ? " is-copied" : ""}`}
        title={copied ? "Copied!" : "Copy link"}
        aria-label={copied ? "Link copied" : "Copy link to clipboard"}
      >
        <FontAwesomeIcon icon={copied ? faCheck : faLink} />
      </button>
      <button
        onClick={shareOnX}
        className="share-post__btn"
        title="Share on X"
        aria-label="Share on X (Twitter)"
      >
        <FontAwesomeIcon icon={faXTwitter} />
      </button>
    </div>
  );
}
