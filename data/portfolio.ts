export const profile = {
  name: "Piyushraj Bista",
  title: "Full Stack Developer & Team Lead",
  location: "Kathmandu, Nepal",
  email: "piyushrajbista@outlook.com",
  phone: "+977-9805335286",
  linkedin: "https://linkedin.com/in/piyushraj-bista-a692a6260",
  github: "https://github.com/misterbista",
  website: "https://piyushrajbista.com.np",
};

export const summary =
  "I work on production systems where the details matter: aged care workflows, legacy migrations, trading tools, and internal operations software. Most of my work sits between React interfaces, .NET services, SQL data, Azure infrastructure, and the teams who rely on them every day.";

export const focusAreas = [
  "Healthcare platforms",
  "Dynamics 365 migrations",
  "React and .NET apps",
  "Azure operations",
];

export const skills = [
  { category: "Languages", items: "C#, JavaScript, TypeScript, Python" },
  {
    category: "Frameworks/Libraries",
    items: ".NET 7/8, React, Next.js, Node.js",
  },
  { category: "Databases", items: "PostgreSQL, Dataverse, SQLServer" },
  {
    category: "Tools",
    items:
      "Git, Figma, Azure DevOps, JIRA, Dynamics 365, Power Apps, Power Automate, Agentic AI",
  },
  {
    category: "Practices",
    items: "RESTful API design, Agile methodologies, UI/UX integration",
  },
  {
    category: "Cloud",
    items: "Azure App Services, Azure Functions, Supabase",
  },
];

export type ExperienceEntry = {
  title: string;
  company: string;
  period: string;
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
  {
    title: "Full Stack Developer",
    company: "Tekkon Nepal, Baluwatar, Kathmandu, Nepal",
    period: "MAR 2025 – PRESENT",
    bullets: [
      "Build features for an Australian aged care management platform with Plancare Australia.",
      "Deliver compliance-driven changes from Australian government and client requirements.",
      "Maintain production modules across .NET, React, Angular, and SQL Server.",
    ],
  },
  {
    title: "Product Engineer",
    company: "ITsutra Inc., Kuleswor, Kathmandu, Nepal",
    period: "APR 2024 – FEB 2025",
    bullets: [
      "Led migration work from a legacy application into Dynamics 365 Power Apps.",
      "Improved performance with faster lookups, caching, and Azure cloud services.",
      "Set up logging and monitoring for Azure App Services and Azure Functions.",
      "Shipped JWT and MSAL React authentication improvements for RingCentral and users.",
      "Built a sales ranking dashboard and automated workflows with Power Automate.",
    ],
  },
  {
    title: "Full Stack Developer / Project Manager",
    company: "Waterflow Technology Pvt. Ltd., Kathmandu, Nepal",
    period: "MAR 2023 – APR 2024",
    bullets: [
      "Led Tradeflow development across REST APIs, React, and Next.js.",
      "Resolved production issues and kept delivery milestones on track.",
      "Managed the Naasa Mess project with Agile planning and Jira sprint cycles.",
      "Worked directly with clients to translate product needs into technical delivery.",
    ],
  },
  {
    title: "Technical Advisor",
    company: "Bharnaa.com · Part-time",
    period: "SEP 2022 – JAN 2023",
    bullets: [
      "Advised on development strategy, scalability, and product experience.",
      "Supported Agile delivery practices across product and engineering teams.",
      "Worked with REST APIs, Spring Boot, Figma, and project planning tools.",
    ],
  },
  {
    title: "Co-founder",
    company: "Autovity Tech",
    period: "SEP 2021 – AUG 2022",
    bullets: [
      "Co-founded a startup and worked across product planning, delivery, and operations.",
      "Built early leadership experience across project management and product development.",
    ],
  },
  {
    title: "Backend Developer Intern",
    company: "Citytech Global Pvt. Ltd., Kathmandu, Nepal",
    period: "APR – AUG 2021",
    bullets: [
      "Developed REST APIs with Java and Micronaut.",
      "Integrated backend services with senior engineering support.",
    ],
  },
];

export const education = {
  degree: "Bachelor of Information Technology (Hons)",
  institution: "Padmashree College, Tinkune, Kathmandu, Nepal",
  period: "2017 – 2022",
};

export const softSkills = [
  "Clear communication with technical and non-technical stakeholders.",
  "Client-facing delivery with attention to business context.",
  "Fast ramp-up across unfamiliar systems and domains.",
  "Cross-functional collaboration with product, design, and DevOps teams.",
  "Calm prioritization across concurrent work and tight timelines.",
];
