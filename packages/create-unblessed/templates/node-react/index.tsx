import { Screen } from "@unblessed/node";
import { Box, render, Text } from "@unblessed/react";

const App = () => (
  <Box>
    <Text>Hello World</Text>
  </Box>
);

render(<App />, new Screen());
