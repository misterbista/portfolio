export const TIMING = Object.freeze({
  typingFast: 5,
  typingMedium: 14,
  typingSlow: 28,
  typingVariance: 6,
  commandDelay: 100,
  lineDelay: 200,
  thinkPauseMin: 400,
  thinkPauseMax: 700,
  typoPause: 300,
  backspaceSpeed: 60,
  tabCompletePause: 180,
  scrollIndicatorTimeout: 1500,
  blinkDuration: 150,
  blinkDelayMin: 3000,
  blinkDelayMax: 8000,
  pupilResetDelay: 500,
  spinnerInterval: 80,
  loadingFadeDuration: 600,
  progressFinalizeDelay: 120,
  progressStartDelay: 100,
  typeStartDelay: 30,
  typoCorrectionDelay: 150,
  loadingHideDelayAfterAnimation: 800,
  animationStartDelay: 100,
});

export const SPINNER_FRAMES = [
  "⠋",
  "⠙",
  "⠹",
  "⠸",
  "⠼",
  "⠴",
  "⠦",
  "⠧",
  "⠇",
  "⠏",
];

type OutputLine = {
  text: string;
  cls?: string;
  delay?: number;
  type?: "progress" | "spinner";
  total?: number;
  speed?: number;
  duration?: number;
};

export type TerminalStep = {
  cmd: string;
  output: OutputLine[];
  typo?: { wrongText: string; deleteCount: number; correction: string };
  tabComplete?: { typed: string; completed: string };
  changeDir?: boolean;
};

export const TERMINAL_STEPS: TerminalStep[] = [
  {
    cmd: "git clone https://github.com/misterbista/portfolio.git",
    typo: {
      wrongText: "git clone https://github.com/misterbitsa",
      deleteCount: 5,
      correction: "bista/portfolio.git",
    },
    output: [
      { text: "Cloning into 'portfolio'...", cls: "dim", delay: 350 },
      {
        text: "remote: Enumerating objects: 47, done.",
        cls: "dim",
        delay: 160,
      },
      {
        text: "remote: Counting objects: 100% (47/47), done.",
        cls: "dim",
        delay: 120,
      },
      {
        text: "remote: Compressing objects: 100% (31/31), done.",
        cls: "dim",
        delay: 200,
      },
      {
        type: "progress",
        text: "Receiving objects:",
        total: 47,
        speed: 30,
        cls: "dim",
      },
      {
        text: "Resolving deltas: 100% (12/12), done.",
        cls: "dim",
        delay: 220,
      },
    ],
  },
  {
    cmd: "cd portfolio",
    tabComplete: { typed: "cd por", completed: "tfolio" },
    output: [],
    changeDir: true,
  },
  {
    cmd: "npm i && npm run dev",
    output: [
      {
        type: "spinner",
        text: "installing dependencies...",
        duration: 1400,
        cls: "dim",
      },
      { text: "added 187 packages in 2.1s", cls: "success", delay: 200 },
      { text: "", cls: "blank", delay: 80 },
      { text: "  VITE v5.4.2  ready in 287 ms", cls: "vite", delay: 220 },
      { text: "", cls: "blank", delay: 50 },
      {
        text: "  ➜  Remote:  https://piyushrajbista.com.np",
        cls: "url",
        delay: 130,
      },
    ],
  },
];

export const ALLOWED_GITHUB_USER =
  process.env.NEXT_PUBLIC_ALLOWED_GITHUB_USER || "";
