import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import DotMatrixBackground from "@/components/dot-matrix-background";
import ScrollIndicator from "@/components/scroll-indicator";
import ScrollMoreButton from "@/components/scroll-more-button";
import RecentPosts from "@/components/recent-posts";
import { education, experience, profile, skills, softSkills, summary } from "@/data/portfolio";

export default function Home() {
  return (
    <div className="home-viewport-mask">
      <DotMatrixBackground />
      <div className="animate-fade-in-up">
        <div className="portfolio-shell grid min-h-screen grid-cols-1 gap-x-[clamp(3rem,8vw,7rem)] gap-y-12 px-[clamp(1.25rem,5vw,4rem)] py-[clamp(1.5rem,5vw,4rem)] xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
          <aside className="portfolio-rail xl:sticky xl:top-[clamp(2rem,4vw,3rem)] xl:self-start">
            <div className="portfolio-identity">
              <p className="portfolio-status-pill">Available for ambitious products</p>
              <h1 className="portfolio-name">{profile.name}</h1>
              <p className="portfolio-role">{profile.title}</p>
              <p className="portfolio-meta">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="mr-1.5 text-muted-foreground"
                />
                {profile.location}
              </p>
            </div>

            <div className="portfolio-rail-block">
              <p className="sidebar-panel-label">Direct</p>
              <div className="portfolio-contact-list">
                <a
                  href={`mailto:${profile.email}`}
                  className="portfolio-text-link"
                >
                  <span>
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    Email
                  </span>
                  <span>{profile.email}</span>
                </a>
                <a
                  href={`tel:${profile.phone.replace(/-/g, "")}`}
                  className="portfolio-text-link"
                >
                  <span>
                    <FontAwesomeIcon icon={faPhone} className="mr-2" />
                    Phone
                  </span>
                  <span>{profile.phone}</span>
                </a>
                <a href={profile.linkedin} target="_blank" className="portfolio-text-link">
                  <span>
                    <FontAwesomeIcon icon={faLinkedin} className="mr-2" />
                    LinkedIn
                  </span>
                  <span>Open</span>
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  className="github-tooltip portfolio-text-link"
                >
                  <span>
                    <FontAwesomeIcon icon={faGithub} className="mr-2" />
                    GitHub
                  </span>
                  <span>Open</span>
                </a>
              </div>
            </div>
          </aside>

          <main className="portfolio-main">
            <section className="hero-stage">
              <h2 className="hero-stage__title">
                Building reliable digital products with calm systems and sharp
                execution.
              </h2>
              <p className="hero-stage__body">{summary}</p>
            </section>

            <section className="section-card">
              <RecentPosts variant="feature" />
            </section>

            <section className="section-card">
              <span className="section-kicker">Capabilities</span>
              <h2 className="section-title">What I build</h2>
              <div className="skills-list">
                {skills.map((skill) => (
                  <div key={skill.category} className="skills-row">
                    <strong className="skills-row__title">{skill.category}</strong>
                    <p className="skills-row__body">{skill.items}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="section-card">
              <span className="section-kicker">Experience</span>
              <h2 className="section-title">Work History</h2>
              <div className="experience-list">
                {experience.map((exp) => (
                  <article
                    key={`${exp.company}-${exp.title}`}
                    className="experience-entry"
                  >
                    <div className="experience-entry__meta">
                      <p className="experience-entry__period">{exp.period}</p>
                      <p className="experience-entry__company">{exp.company}</p>
                    </div>

                    <div>
                      <h3 className="experience-entry__title">{exp.title}</h3>
                      <ul className="experience-entry__bullets">
                        {exp.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="section-card section-card--split">
              <div>
                <span className="section-kicker">Education</span>
                <h2 className="section-title">Academic Background</h2>
                <p className="section-body">
                  <strong className="text-foreground font-semibold">
                    {education.degree}
                  </strong>
                  <br />
                  {education.institution}
                </p>
                <p className="education-period">{education.period}</p>
              </div>

              <div>
                <span className="section-kicker">Soft Skills</span>
                <h2 className="section-title">How I Work</h2>
                <ul className="soft-skill-list">
                  {softSkills.map((skill, index) => (
                    <li key={index} className="soft-skill-item">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <footer className="portfolio-footer">
              <p>&copy; 2026 Piyushraj Bista. All rights reserved.</p>
              <p>Built with Next.js, Supabase, and a preference for clean systems.</p>
            </footer>
          </main>
        </div>
      </div>

      <ScrollMoreButton />
      <ScrollIndicator />
    </div>
  );
}
