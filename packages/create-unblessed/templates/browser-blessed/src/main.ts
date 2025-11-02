import { createScreen } from "@unblessed/browser";
import blessed from "@unblessed/core";

const screen = createScreen({
  parent: document.getElementById("root"),
});

blessed.box({
  parent: screen,
  content: "Hello World",
  left: "center",
  top: "center",
  width: "shrink",
  height: "shrink",
  border: "line",
});

screen.render();
