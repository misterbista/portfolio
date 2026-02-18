import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import LoadingScreen from "@/components/loading-screen";
import GooglyEyes from "@/components/googly-eyes";
import ScrollIndicator from "@/components/scroll-indicator";
import ScrollMoreButton from "@/components/scroll-more-button";
import RecentPosts from "@/components/recent-posts";
import {
  profile,
  summary,
  skills,
  experience,
  education,
  softSkills,
} from "@/data/portfolio";

export default function Home() {
  return (
    <LoadingScreen>
      <div className="home-viewport-mask">
        <div className="animate-fade-in-up">
          <div
            className="w-full min-h-screen grid gap-x-[clamp(4rem,10vw,12rem)] items-start grid-cols-1 lg:grid-cols-[minmax(320px,450px)_minmax(0,1fr)] p-[clamp(2rem,6vw,5rem)_clamp(1.5rem,8vw,8rem)]"
          >
          {/* Header / Sidebar */}
          <header
            className="self-start lg:sticky lg:top-[clamp(3rem,6vw,5rem)]"
          >
            <div className="flex justify-between items-start mb-4 gap-4">
              <div className="flex-1">
                <h1 className="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-[1.1] tracking-tight whitespace-nowrap mb-2.5 text-foreground">
                  {profile.name}
                </h1>
                <p className="text-sm text-muted-foreground mb-1">
                  {profile.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="mr-1.5 text-muted-foreground"
                  />
                  {profile.location}
                </p>
              </div>
            </div>

            <nav className="mt-8 flex flex-col gap-2.5">
              <div className="flex flex-nowrap gap-2.5 items-center">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-transparent border border-border text-muted-foreground text-xs no-underline transition-colors hover:bg-muted hover:text-foreground w-fit"
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  {profile.email}
                </a>
                <a
                  href={`tel:${profile.phone.replace(/-/g, "")}`}
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-transparent border border-border text-muted-foreground text-xs no-underline transition-colors hover:bg-muted hover:text-foreground w-fit whitespace-nowrap"
                >
                  <FontAwesomeIcon icon={faPhone} />
                  {profile.phone}
                </a>
              </div>
              <div className="flex flex-nowrap gap-2.5 items-center">
                <a
                  href={profile.linkedin}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-transparent border border-border text-muted-foreground text-xs no-underline transition-colors hover:bg-muted hover:text-foreground w-fit"
                >
                  <FontAwesomeIcon icon={faLinkedin} />
                  LinkedIn
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  className="github-tooltip inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-transparent border border-border text-muted-foreground text-xs no-underline transition-colors hover:bg-muted hover:text-foreground w-fit"
                >
                  <FontAwesomeIcon icon={faGithub} />
                  GitHub
                </a>
              </div>
            </nav>

            <RecentPosts />
            <GooglyEyes />
          </header>

          {/* Main Content */}
          <main>
            {/* About */}
            <section
              className="section-card py-14 first:pt-0 first:border-t-0 border-t border-border"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="block text-[0.7rem] text-muted-foreground font-medium uppercase tracking-wider mb-2.5 font-mono">
                ABOUT ME
              </span>
              <h2 className="text-[clamp(1.35rem,2.2vw,1.75rem)] font-semibold tracking-tight leading-tight mb-5 text-foreground">
                Professional Summary
              </h2>
              <p className="text-muted-foreground leading-relaxed text-[clamp(0.9rem,1.3vw,1rem)]">
                {summary}
              </p>
            </section>

            {/* Skills */}
            <section
              className="section-card py-14 border-t border-border"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="block text-[0.7rem] text-muted-foreground font-medium uppercase tracking-wider mb-2.5 font-mono">
                SKILLS
              </span>
              <h2 className="text-[clamp(1.35rem,2.2vw,1.75rem)] font-semibold tracking-tight leading-tight mb-5 text-foreground">
                Core Competencies
              </h2>
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-px mt-7 text-sm bg-border border border-border rounded-lg overflow-hidden">
                {skills.map((skill, i) => (
                  <div
                    key={skill.category}
                    className="bg-secondary p-5 transition-colors hover:bg-muted"
                    style={{ animationDelay: `${0.2 + i * 0.05}s` }}
                  >
                    <strong className="text-foreground font-medium block mb-2.5 text-xs">
                      {skill.category}
                    </strong>
                    <p className="text-muted-foreground text-xs leading-relaxed m-0">
                      {skill.items}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience */}
            <section
              className="section-card py-14 border-t border-border"
              style={{ animationDelay: "0.3s" }}
            >
              <span className="block text-[0.7rem] text-muted-foreground font-medium uppercase tracking-wider mb-2.5 font-mono">
                PROFESSIONAL JOURNEY
              </span>
              <h2 className="text-[clamp(1.35rem,2.2vw,1.75rem)] font-semibold tracking-tight leading-tight mb-5 text-foreground">
                Experience
              </h2>
              <div className="mt-7">
                {experience.map((exp, i) => (
                  <div
                    key={i}
                    className={`pb-12 pt-9 border-b border-border first:pt-0 last:border-b-0 last:pb-0`}
                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <h3 className="text-[clamp(1.05rem,1.7vw,1.3rem)] font-semibold text-foreground tracking-tight leading-snug mb-1.5">
                      {exp.title}
                    </h3>
                    <p className="text-muted-foreground text-xs mb-4">
                      <span className="text-secondary-foreground font-normal">
                        {exp.company}
                      </span>
                    </p>
                    <ul className="mt-5 pl-0 list-none flex flex-col gap-3.5">
                      {exp.bullets.map((bullet, j) => (
                        <li
                          key={j}
                          className="text-sm text-muted-foreground pl-6 relative leading-relaxed before:content-['·'] before:absolute before:left-0 before:text-muted-foreground before:font-bold before:text-lg transition-colors hover:text-foreground"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      <span className="text-[0.7rem] text-secondary-foreground font-medium whitespace-nowrap bg-muted border border-border px-2.5 py-0.5 rounded-full inline-block tracking-wide">
                        {exp.period}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section
              className="section-card py-14 border-t border-border"
              style={{ animationDelay: "0.4s" }}
            >
              <span className="block text-[0.7rem] text-muted-foreground font-medium uppercase tracking-wider mb-2.5 font-mono">
                EDUCATION
              </span>
              <h2 className="text-[clamp(1.35rem,2.2vw,1.75rem)] font-semibold tracking-tight leading-tight mb-5 text-foreground">
                Education
              </h2>
              <p className="text-muted-foreground leading-relaxed text-[clamp(0.9rem,1.3vw,1rem)]">
                <strong className="text-foreground font-semibold">
                  {education.degree}
                </strong>
                <br />
                {education.institution}
                <br />
                <em className="text-muted-foreground">{education.period}</em>
              </p>
            </section>

            {/* Soft Skills */}
            <section
              className="section-card py-14 border-t border-border"
              style={{ animationDelay: "0.5s" }}
            >
              <span className="block text-[0.7rem] text-muted-foreground font-medium uppercase tracking-wider mb-2.5 font-mono">
                SOFT SKILLS
              </span>
              <h2 className="text-[clamp(1.35rem,2.2vw,1.75rem)] font-semibold tracking-tight leading-tight mb-5 text-foreground">
                Additional Skills
              </h2>
              <ul className="list-none pl-0 flex flex-col gap-3.5 mt-6">
                {softSkills.map((skill, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground pl-6 relative leading-relaxed before:content-['·'] before:absolute before:left-0 before:text-muted-foreground before:font-bold before:text-lg transition-colors hover:text-foreground"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </section>

            <footer className="text-left pt-12 text-muted-foreground text-[clamp(0.8rem,1.2vw,0.9rem)]">
              <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
            </footer>
            </main>
          </div>
        </div>
        <ScrollMoreButton />
        <ScrollIndicator />
      </div>
    </LoadingScreen>
  );
}
