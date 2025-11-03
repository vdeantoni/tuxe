import { Box, Screen } from "@unblessed/browser";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

// Create XTerm terminal
const term = new Terminal({
  cursorBlink: true,
  cols: 80,
  rows: 24,
});
term.open(document.getElementById("root")!);

// Create screen with XTerm
const screen = new Screen({ terminal: term });

// Create a box widget
new Box({
  parent: screen,
  content: "Hello World",
  left: "center",
  top: "center",
  width: "shrink",
  height: "shrink",
  border: { type: "line" },
});

screen.render();
