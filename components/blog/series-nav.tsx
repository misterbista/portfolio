import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

type SeriesPost = { title: string; slug: string; series_order: number };

type Props = {
  seriesName: string;
  seriesSlug: string;
  posts: SeriesPost[];
  currentSlug: string;
};

export default function SeriesNav({
  seriesName,
  seriesSlug,
  posts,
  currentSlug,
}: Props) {
  const sorted = [...posts].sort((a, b) => a.series_order - b.series_order);
  const currentIndex = sorted.findIndex((p) => p.slug === currentSlug);
  const prev = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const next =
    currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  return (
    <div className="p-4 border border-border rounded-lg bg-secondary/20">
      <Link
        href={`/blog/series/${seriesSlug}`}
        className="text-xs text-muted-foreground uppercase tracking-wider font-medium no-underline transition-colors hover:text-foreground"
      >
        Series: {seriesName}
      </Link>
      <p className="text-muted-foreground text-[0.75rem] mt-1">
        Part {currentIndex + 1} of {sorted.length}
      </p>
      <ul className="mt-3 flex flex-col gap-1 list-none p-0">
        {sorted.map((p) => (
          <li key={p.slug}>
            {p.slug === currentSlug ? (
              <span className="text-foreground text-[0.8rem] font-medium">
                &#9656; {p.title}
              </span>
            ) : (
              <Link
                href={`/blog/${p.slug}`}
                className="text-muted-foreground text-[0.8rem] no-underline transition-colors hover:text-foreground"
              >
                {p.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
      {(prev || next) && (
        <div className="flex justify-between mt-4 pt-3 border-t border-border">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="inline-flex items-center gap-1 text-muted-foreground text-[0.775rem] no-underline transition-colors hover:text-foreground max-w-[45%]"
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                className="text-[0.55rem] shrink-0"
              />
              <span className="truncate">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="inline-flex items-center gap-1 text-muted-foreground text-[0.775rem] no-underline transition-colors hover:text-foreground max-w-[45%] ml-auto text-right"
            >
              <span className="truncate">{next.title}</span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="text-[0.55rem] shrink-0"
              />
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
