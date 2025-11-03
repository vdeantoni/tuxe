import { Box, Screen } from "@unblessed/node";

const screen = new Screen();

new Box({
  parent: screen,
  content: "Hello World",
  left: "center",
  top: "center",
  width: "shrink",
  height: "shrink",
  border: { type: "line" },
});

screen.key(["escape", "q", "C-c"], () => process.exit(0));

screen.render();
