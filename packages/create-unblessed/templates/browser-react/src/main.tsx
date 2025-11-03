import { Screen } from "@unblessed/browser";
import { Box, render, Text } from "@unblessed/react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const App = () => (
  <Box>
    <Text>Hello World</Text>
  </Box>
);

// Create XTerm terminal
const term = new Terminal({
  cursorBlink: true,
  cols: 80,
  rows: 24,
});
term.open(document.getElementById("root")!);

// Create screen with XTerm
const screen = new Screen({ terminal: term });

render(<App />, screen);
