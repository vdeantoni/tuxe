import { createScreen } from "@unblessed/browser";
import { Box, render, Text } from "@unblessed/react";

const App = () => (
  <Box>
    <Text>Hello World</Text>
  </Box>
);

const screen = createScreen({
  parent: document.getElementById("root"),
});

render(<App />, screen);
