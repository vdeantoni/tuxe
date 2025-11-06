export interface CodeExample {
  id: string;
  title: string;
  description: string;
  code: string;
}

export const CODE_EXAMPLES: CodeExample[] = [
  {
    id: "simple-box",
    title: "Simple Box",
    description: "A basic centered box with styled content and borders",
    code: `import { Box } from "@unblessed/browser";

// Simple centered box
const box = new Box({
  parent: screen,
  top: "center",
  left: "center",
  width: "50%",
  height: "50%",
  content:
    "{bold}{cyan-fg}Hello unblessed!{/cyan-fg}{/bold}\\n\\n" +
    "This is unblessed running in your browser.\\n\\n" +
    "Try editing the code!",
  tags: true,
  border: { type: "line" },
  style: {
    fg: "white",
    bg: "black",
    border: { fg: "cyan" },
  },
});
`,
  },
];
