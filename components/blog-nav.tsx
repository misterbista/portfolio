import Link from "next/link";

type Props = {
  showBlogLink?: boolean;
};

export default function BlogNav({ showBlogLink = true }: Props) {
  return (
    <nav className="blog-nav">
      <div className="blog-nav__crumbs">
        <Link href="/" className="blog-nav__brand">
          Piyushraj Bista
        </Link>
        <span className="blog-nav__slash">/</span>
        <Link href="/blog" className="blog-nav__section">
          Writing
        </Link>
      </div>
      <Link
        href={showBlogLink ? "/blog" : "/"}
        className="blog-nav__action"
      >
        {showBlogLink ? "Open blog" : "Back to portfolio"}
      </Link>
    </nav>
  );
}
