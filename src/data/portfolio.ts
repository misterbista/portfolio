export const profile = {
  name: "Piyushraj Bista",
  title: "Full Stack Developer | Team Lead",
  location: "Kathmandu, Nepal",
  email: "piyushrajbista@outlook.com",
  phone: "+977-9805335286",
  linkedin: "https://linkedin.com/in/piyushraj-bista-a692a6260",
  github: "https://github.com/anormiedev",
  website: "https://piyushrajbista.com.np",
};

export const summary =
  "Experienced Full Stack Developer and Team Lead with a strong background in software development, backend architecture, and project management. Skilled in building scalable web applications using modern technologies like .NET, React, Next.js, and Azure. Proven ability to lead projects from start to finish, ensuring successful delivery.";

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
      "Developing features for an Australian age care management system in partnership with Plancare Australia.",
      "Working with international clients to deliver solutions that comply with Australian government regulations.",
      "Building and maintaining features using .NET, React, Angular, and SQL Server.",
      "Maintaining existing features and performing bug fixes across the application.",
      "Implementing system changes and updates as per requirements from Australian government and client specifications.",
    ],
  },
  {
    title: "Product Engineer",
    company: "ITsutra Inc., Kuleswor, Kathmandu, Nepal",
    period: "APR 2024 – FEB 2025",
    bullets: [
      "Led the migration of a legacy application to Dynamics 365 Power Apps, improving efficiency.",
      "Optimized code performance using fast lookups, caching, and Azure cloud services.",
      "Set up logging and monitoring for Azure App Services and Functions to ensure smooth operations.",
      "Improved security by transitioning to JWT authentication for RingCentral integration and user authentication using MSAL React.",
      "Built a Sales Ranking Dashboard to help the sales team drive revenue growth.",
      "Automated workflows using Power Automate and AI Agents, reducing manual tasks.",
      "Mentored junior developers and collaborated with DevOps to reduce cloud costs.",
    ],
  },
  {
    title: "Full Stack Developer / Project Manager",
    company: "Waterflow Technology Pvt. Ltd., Kathmandu, Nepal",
    period: "MAR 2023 – APR 2024",
    bullets: [
      "Led the development of the Tradeflow project, building RESTful APIs and integrating frontend components with React and Next.js.",
      "Solved critical technical issues to keep projects on track.",
      "Managed the Naasa Mess project using Agile methodologies and Jira for sprint cycles.",
      "Worked with cross-functional teams to deliver features on time.",
      "Communicated with clients to understand their needs and deliver technical solutions.",
    ],
  },
  {
    title: "Technical Advisor",
    company: "Bharnaa.com · Part-time",
    period: "SEP 2022 – JAN 2023",
    bullets: [
      "Advised on development strategies to align with business goals.",
      "Suggested improvements for scalability and user experience.",
      "Collaborated with teams to implement Agile methodologies and deliver results.",
      "Used tools like Figma, Adobe Creative Suite, and Google Workspace for design and project management.",
      "Worked with REST APIs and Spring Boot to enhance project functionality.",
    ],
  },
  {
    title: "Co-founder",
    company: "Autovity Tech",
    period: "SEP 2021 – AUG 2022",
    bullets: [
      "Co-founded a startup, focusing on innovation and problem-solving.",
      "Gained experience in business planning, teamwork, and product development.",
      "Developed leadership and project management skills.",
    ],
  },
  {
    title: "Backend Developer Intern",
    company: "Citytech Global Pvt. Ltd., Kathmandu, Nepal",
    period: "APR – AUG 2021",
    bullets: [
      "Developed and maintained RESTful APIs using Java and Micronaut.",
      "Worked with senior developers to integrate backend services.",
      "Gained hands-on experience in building scalable applications.",
    ],
  },
];

export const education = {
  degree: "Bachelor of Information Technology (Hons)",
  institution: "Padmashree College, Tinkune, Kathmandu, Nepal",
  period: "2017 – 2022",
};

export const softSkills = [
  "Strong communication skills for technical and non-technical audiences.",
  "Skilled in managing client relationships and understanding business needs.",
  "Quick learner with a passion for staying updated on new technologies.",
  "Experienced working with cross-functional teams to deliver results.",
  "Effective time management, able to handle multiple projects under tight deadlines.",
];
