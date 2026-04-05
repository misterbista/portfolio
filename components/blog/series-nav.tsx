import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faLayerGroup,
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
    <nav
      className="p-5 border border-border rounded-xl bg-secondary/10"
      aria-label={`Series: ${seriesName}`}
    >
      <div className="flex items-center gap-2">
        <FontAwesomeIcon
          icon={faLayerGroup}
          className="text-[0.6rem] text-muted-foreground"
        />
        <Link
          href={`/blog/series/${seriesSlug}`}
          className="text-[0.68rem] text-muted-foreground uppercase tracking-[0.2em] font-semibold no-underline transition-colors hover:text-foreground font-mono"
        >
          {seriesName}
        </Link>
      </div>
      <p className="text-muted-foreground text-[0.72rem] mt-1.5 font-mono">
        Part {currentIndex + 1} of {sorted.length}
      </p>

      <ol className="mt-4 flex flex-col gap-0.5 list-none p-0">
        {sorted.map((p, i) => {
          const isCurrent = p.slug === currentSlug;
          const isPast = i < currentIndex;

          return (
            <li key={p.slug} className="flex items-start gap-2.5">
              <span
                className={`shrink-0 mt-1.5 w-[18px] h-[18px] rounded-full border text-[0.6rem] font-mono flex items-center justify-center ${
                  isCurrent
                    ? "border-foreground bg-foreground text-background font-semibold"
                    : isPast
                    ? "border-muted-foreground/40 text-muted-foreground/60"
                    : "border-border text-muted-foreground/40"
                }`}
              >
                {i + 1}
              </span>
              {isCurrent ? (
                <span className="text-foreground text-[0.82rem] font-medium py-1 leading-snug">
                  {p.title}
                </span>
              ) : (
                <Link
                  href={`/blog/${p.slug}`}
                  className="text-muted-foreground text-[0.82rem] no-underline transition-colors hover:text-foreground py-1 leading-snug"
                >
                  {p.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {(prev || next) && (
        <div className="flex justify-between mt-5 pt-4 border-t border-border">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="group inline-flex items-center gap-1.5 text-muted-foreground text-[0.78rem] no-underline transition-colors hover:text-foreground max-w-[45%]"
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                className="text-[0.5rem] shrink-0 transition-transform group-hover:-translate-x-0.5"
              />
              <span className="truncate">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="group inline-flex items-center gap-1.5 text-muted-foreground text-[0.78rem] no-underline transition-colors hover:text-foreground max-w-[45%] ml-auto text-right"
            >
              <span className="truncate">{next.title}</span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="text-[0.5rem] shrink-0 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </nav>
  );
}
