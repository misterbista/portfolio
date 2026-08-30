const productionUrl = "https://piyushrajbista.com.np";

export const siteConfig = {
  name: "Piyushraj Bista",
  role: "Full Stack Developer",
  title: "Piyushraj Bista — Full Stack Developer",
  description:
    "Full Stack Developer in Kathmandu building reliable enterprise systems with .NET, React, Angular, SQL Server, and Azure.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? productionUrl,
  email: "piyushrajbista@outlook.com",
  location: "Kathmandu, Nepal",
  links: {
    github: "https://github.com/misterbista",
    linkedin: "https://linkedin.com/in/piyushraj-bista-a692a6260",
  },
  expertise: [
    "Full-stack development",
    ".NET",
    "ASP.NET Core",
    "React",
    "Angular",
    "Microsoft SQL Server",
    "Azure",
    "Enterprise software",
    "Production systems",
  ],
} as const;

