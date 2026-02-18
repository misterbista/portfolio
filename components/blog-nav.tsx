import Link from "next/link";

type Props = {
  showBlogLink?: boolean;
};

export default function BlogNav({ showBlogLink = true }: Props) {
  return (
    <nav className="flex items-center justify-between pb-8 mb-8 border-b border-border">
      <Link
        href="/"
        className="text-foreground no-underline font-semibold text-base"
      >
        Piyushraj Bista
      </Link>
      {showBlogLink ? (
        <div className="flex gap-5 items-center">
          <Link
            href="/blog"
            className="text-muted-foreground no-underline text-sm transition-colors hover:text-foreground"
          >
            Blog
          </Link>
        </div>
      ) : (
        <div />
      )}
    </nav>
  );
}
