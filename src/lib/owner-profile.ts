/**
 * Peerly App Owner & Creator Data Configuration
 * Centralized typed data source for Shariyer Shazan's developer profile.
 */

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface SocialLink {
  label: string;
  url: string;
  icon: string; // Icon key identifier for Lucide/SVG mapping
  displayValue?: string;
  isEmail?: boolean;
}

export interface OwnerProfile {
  name: string;
  role: string;
  profileImage: string;
  imageAlt: string;
  conciseSummary: string;
  fullSummary: string;
  skills: SkillCategory[];
  education: {
    institution: string;
    degree: string;
  };
  openSource: {
    description: string;
    githubUrl: string;
  };
  peerlyInfo: {
    projectName: string;
    description: string;
    creatorStatement: string;
  };
  socialLinks: SocialLink[];
}

export const OWNER_PROFILE: OwnerProfile = {
  name: "Shariyer Shazan",
  role: "Backend Engineer & Full-Stack Developer",
  profileImage: "/shariyer-shazan.jpg",
  imageAlt: "Shariyer Shazan — Backend Engineer",
  conciseSummary:
    "Backend Engineer specializing in scalable APIs, distributed systems, event-driven microservices, and AI-integrated software.",
  fullSummary:
    "Backend Engineer specializing in Node.js, NestJS, and event-driven microservices with Kafka, gRPC, and Redis, with hands-on experience building LLM-integrated systems using OpenAI, LangChain, and the Model Context Protocol (MCP). Focused on scalable API design, distributed database architecture, AI-integrated systems, and reliable production-grade backend solutions.",
  skills: [
    {
      category: "Backend",
      skills: ["Node.js", "TypeScript", "NestJS", "Express.js"],
    },
    {
      category: "Distributed Systems",
      skills: [
        "Kafka",
        "gRPC",
        "Redis",
        "Event-Driven Architecture",
        "Microservices",
        "System Design",
      ],
    },
    {
      category: "Databases",
      skills: ["PostgreSQL", "MongoDB", "Prisma"],
    },
    {
      category: "DevOps / Infrastructure",
      skills: ["Docker", "Linux", "Git", "GitHub Actions", "AWS"],
    },
    {
      category: "AI / LLM",
      skills: [
        "OpenAI",
        "LangChain",
        "MCP",
        "LLM Integration",
        "AI Agents",
        "Agentic AI",
      ],
    },
  ],
  education: {
    institution: "Southeast University",
    degree: "B.Sc. in Computer Science & Engineering",
  },
  openSource: {
    description:
      "Active contributor to open-source software with experience working across the Node.js and NestJS ecosystems to build modular, maintainable tools for developers.",
    githubUrl: "https://github.com/shariyerShazan",
  },
  peerlyInfo: {
    projectName: "Peerly",
    description:
      "Peerly is a private, backendless peer-to-peer communication application designed for secure chat, audio/video calls, and direct file sharing without accounts, application databases, or a traditional communication backend.",
    creatorStatement:
      "Built by Shariyer Shazan as an exploration of secure, browser-native peer-to-peer communication using WebRTC, Web Crypto, and modern web technologies.",
  },
  socialLinks: [
    {
      label: "Email",
      url: "mailto:shariyershazan1@gmail.com",
      icon: "Mail",
      displayValue: "shariyershazan1@gmail.com",
      isEmail: true,
    },
    {
      label: "GitHub",
      url: "https://github.com/shariyerShazan",
      icon: "Github",
      displayValue: "github.com/shariyerShazan",
    },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/md-shariyerShazan",
      icon: "Linkedin",
      displayValue: "linkedin.com/in/md-shariyerShazan",
    },
    {
      label: "Facebook",
      url: "https://www.facebook.com/darling.shazan",
      icon: "Facebook",
      displayValue: "facebook.com/darling.shazan",
    },
    {
      label: "Instagram",
      url: "https://instagram.com/shariyer.shazan",
      icon: "Instagram",
      displayValue: "instagram.com/shariyer.shazan",
    },
    {
      label: "X / Twitter",
      url: "https://x.com/SJan_1293",
      icon: "Twitter",
      displayValue: "x.com/SJan_1293",
    },
  ],
};
