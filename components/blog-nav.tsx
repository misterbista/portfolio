import Link from "next/link";

type Props = {
  showBlogLink?: boolean;
};

export default function BlogNav({ showBlogLink = true }: Props) {
  return (
    <nav className="blog-nav" aria-label="Site navigation">
      <Link href="/" className="blog-nav__brand" prefetch>
        PB
      </Link>

      <div className="blog-nav__links">
        <Link href="/" className="blog-nav__link" prefetch>
          Work
        </Link>
        <Link
          href="/blog"
          className={`blog-nav__link${!showBlogLink ? " is-active" : ""}`}
          prefetch
        >
          Writing
        </Link>
      </div>
    </nav>
  );
}
