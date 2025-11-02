import blessed from "@unblessed/core";
import { Screen } from "@unblessed/node";

const screen = new Screen();

blessed.box({
  parent: screen,
  content: "Hello World",
  left: "center",
  top: "center",
  width: "shrink",
  height: "shrink",
  border: "line",
});

screen.key(["escape", "q", "C-c"], () => process.exit(0));

screen.render();
