import Link from "next/link";
import { siteConfig } from "./site-config";
import { ThemeToggle } from "./theme-toggle";

const profileJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: { "@id": `${siteConfig.url}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteConfig.url}/#profile-page`,
      url: siteConfig.url,
      name: siteConfig.title,
      description: siteConfig.description,
      inLanguage: "en",
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      mainEntity: {
        "@type": "Person",
        "@id": `${siteConfig.url}/#person`,
        name: siteConfig.name,
        url: siteConfig.url,
        jobTitle: siteConfig.role,
        description: siteConfig.description,
        email: `mailto:${siteConfig.email}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Kathmandu",
          addressCountry: "NP",
        },
        sameAs: [siteConfig.links.linkedin, siteConfig.links.github],
        knowsAbout: siteConfig.expertise,
      },
    },
  ],
};

export default function Home() {
  return (
    <main className="story-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profileJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <a className="skip-link" href="#story-content">
        Skip to story
      </a>
      <article className="story">
        <nav className="masthead" aria-label="Personal navigation">
          <Link
            className="masthead__identity"
            href="/"
            aria-label="Piyushraj Bista, home"
            aria-current="page"
          >
            <strong>Piyushraj Bista</strong>
            <span>Full Stack Developer · Kathmandu, Nepal</span>
          </Link>

          <div className="masthead__actions">
            <a className="text-link" href="/resume.pdf" download>
              Résumé <span aria-hidden="true">↓</span>
            </a>
            <ThemeToggle />
          </div>
        </nav>

        <header className="story-header" id="story-content">
          <h1>My Story</h1>
          <p>
            I got into software because I wanted to understand what was
            happening behind the screen—not only how an interface worked, but
            how the services, data, and decisions behind it came together as a
            real system.
          </p>
        </header>

        <div className="story-sections">
          <section className="story-section" aria-labelledby="beginning">
            <h2 id="beginning">01 / Beginning</h2>
            <div className="story-section__body">
              <p>
                My first professional glimpse of that world came at{" "}
                <strong>Citytech Global</strong>. As a Backend Developer Intern,
                I worked with Java and Micronaut to build REST APIs. It was my
                introduction to backend engineering in a professional
                environment, and it made the systems I had been curious about
                feel tangible.
              </p>
              <p>
                At around the same time, I co-founded{" "}
                <strong>Autovity Tech</strong>. Suddenly, software was not just
                a technical exercise. I was thinking about product strategy,
                system design, development, and the business problem underneath
                all of it. That experience gave me an idea I still carry: good
                engineering starts with understanding what actually needs to be
                solved.
              </p>
            </div>
          </section>

          <section className="story-section" aria-labelledby="ownership">
            <h2 id="ownership">02 / Ownership</h2>
            <div className="story-section__body">
              <p>
                <strong>Waterflow Technology</strong> gave me the opportunity to
                put that idea into practice on enterprise applications. I
                worked across ASP.NET Core, React, Next.js, and SQL databases,
                but my role quickly grew beyond implementing features.
              </p>
              <p>
                I became involved in architecture, requirements, testing,
                deployment, maintenance, stakeholder communication, and project
                management. I started seeing software as a complete lifecycle
                rather than a collection of tickets and code changes.
              </p>
            </div>
          </section>

          <section className="story-section" aria-labelledby="production">
            <h2 id="production">03 / Production</h2>
            <div className="story-section__body">
              <p>
                Later, as a Product Engineer at <strong>ITsutra</strong>, I moved
                closer to the realities of running enterprise software in
                production. Working with .NET, Azure, and Dynamics 365, I
                improved performance through caching and database optimization,
                introduced centralized logging and monitoring, built secure
                integrations with JWT and MSAL, and diagnosed issues that only
                reveal themselves in real systems.
              </p>
              <p>
                That role also changed how I thought about engineering teams.
                Through mentoring junior developers and conducting code
                reviews, the question was no longer only whether my own code
                worked. I began thinking about how the whole team could make
                better decisions and build software that was easier to
                understand and maintain.
              </p>
            </div>
          </section>

          <section className="story-section" aria-labelledby="now">
            <h2 id="now">04 / Now</h2>
            <div className="story-section__body">
              <p>
                Today, I work as a Full Stack Developer at{" "}
                <strong>Tekkon Nepal</strong>, partnering with Plancare Australia
                on enterprise healthcare management systems. The stack includes
                C#, ASP.NET Core, React, Angular, and Microsoft SQL Server, but
                the technology list is not the part that keeps the work
                interesting.
              </p>
              <p>
                What interests me is everything underneath it: designing
                scalable APIs, making complex business workflows understandable,
                running background work reliably, improving database
                performance, troubleshooting production behaviour, and
                translating conversations with international stakeholders into
                solutions people can depend on.
              </p>
              <p>
                Over time, I have realised that the problems I enjoy most rarely
                end with “write another endpoint.” I want to know why something
                is slow, why it behaves differently under load, which query is
                doing too much work, where a background process can fail, and
                how a growing application can remain clear to the people
                responsible for it.
              </p>
              <p>
                My career has followed that curiosity. I began by learning how
                to build software, then learned how to build complete
                applications, and eventually started thinking more deeply about
                architecture, performance, reliability, production, and the
                teams behind those systems.
              </p>
              <p>
                The direction I want to keep moving in is clear: toward taking
                ownership of complex systems from the first conversation about
                the business problem through design, development, optimization,
                and day-to-day operation in production.
              </p>
            </div>
          </section>
        </div>

        <footer className="story-footer">
          <p>Have a system problem worth thinking through?</p>
          <address
            className="story-footer__links"
            aria-label="Contact and social links"
          >
            <a className="text-link" href={`mailto:${siteConfig.email}`}>
              Email <span aria-hidden="true">↗</span>
            </a>
            <a
              className="text-link"
              href={siteConfig.links.linkedin}
              rel="me noreferrer"
            >
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
            <a
              className="text-link"
              href={siteConfig.links.github}
              rel="me noreferrer"
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </address>
        </footer>
      </article>
    </main>
  );
}
