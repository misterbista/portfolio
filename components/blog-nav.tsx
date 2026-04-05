import Link from "next/link";

type Props = {
  showBlogLink?: boolean;
};

export default function BlogNav({ showBlogLink = true }: Props) {
  return (
    <nav className="blog-nav" aria-label="Site navigation">
      <Link href="/" className="blog-nav__brand">
        PB
      </Link>

      <div className="blog-nav__links">
        <Link href="/" className="blog-nav__link">
          Work
        </Link>
        <Link
          href="/blog"
          className={`blog-nav__link${!showBlogLink ? " is-active" : ""}`}
        >
          Writing
        </Link>
      </div>
    </nav>
  );
}
