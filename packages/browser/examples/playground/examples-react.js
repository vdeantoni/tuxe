/**
 * React-based playground examples
 * These use @unblessed/react with proper JSX components
 */

export const examplesReact = {
  "Simple Box": `// Simple centered box with React
const { useState } = React;
const { Box, Text, render } = tui;

const App = () => {
  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
      gap={2}
    >
      <Box
        border={1}
        borderStyle="single"
        borderColor="cyan"
        padding={2}
        minWidth={40}
        minHeight={10}
      >
        <Text color="cyan" bold>Hello unblessed!</Text>
        <Text>This is React + unblessed running in your browser.</Text>
        <Text>Try the other examples!</Text>
      </Box>
    </Box>
  );
};

// Pass BOTH runtime and screen to render
render(<App />, { runtime: new tui.BrowserRuntime(), screen });`,

  "Interactive Counter": `// Interactive counter with buttons
const { useState } = React;
const { Box, Text, Button, render, BrowserRuntime } = tui;

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
      gap={2}
    >
      <Box
        border={1}
        borderStyle="single"
        borderColor="cyan"
        padding={2}
        minWidth={40}
      >
        <Text bold>Count: {count}</Text>
      </Box>

      <Box flexDirection="row" gap={2}>
        <Button
          border={1}
          borderStyle="single"
          padding={1}
          hover={{ backgroundColor: 'green', color: 'black' }}
          focus={{ borderColor: 'yellow' }}
          onPress={() => setCount(c => c + 1)}
        >
          <Text>➕ Add</Text>
        </Button>

        <Button
          border={1}
          borderStyle="single"
          padding={1}
          hover={{ backgroundColor: 'red', color: 'black' }}
          focus={{ borderColor: 'yellow' }}
          onPress={() => setCount(c => c - 1)}
        >
          <Text>➖ Sub</Text>
        </Button>
      </Box>
    </Box>
  );
};

// Pass screen to render (runtime is already set globally by playground)
render(<App />, { runtime: new BrowserRuntime(), screen });`,

  "Form Input": `// Form with text input
const { useState } = React;
const { Box, Text, Input, Button, render, BrowserRuntime } = tui;

const App = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
    >
      <Box
        border={1}
        borderStyle="single"
        borderColor="cyan"
        padding={2}
        minWidth={50}
        flexDirection="column"
        gap={2}
      >
        <Text bold color="cyan">Form Demo</Text>

        <Box flexDirection="row" gap={2} alignItems="center">
          <Text minWidth={8}>Name:</Text>
          <Input
            width={30}
            border={1}
            borderColor="blue"
            defaultValue={name}
            onSubmit={(val) => setName(val)}
          />
        </Box>

        <Box flexDirection="row" gap={2} alignItems="center">
          <Text minWidth={8}>Email:</Text>
          <Input
            width={30}
            border={1}
            borderColor="blue"
            defaultValue={email}
            onSubmit={(val) => setEmail(val)}
          />
        </Box>

        <Button
          border={1}
          borderStyle="single"
          padding={1}
          hover={{ backgroundColor: 'green' }}
          focus={{ borderColor: 'yellow' }}
          onPress={() => setSubmitted(true)}
        >
          <Text>Submit</Text>
        </Button>

        {submitted && (
          <Box
            border={1}
            borderStyle="single"
            borderColor="green"
            padding={1}
            marginTop={1}
          >
            <Text color="green" bold>Submitted!</Text>
            <Text>Name: {name}</Text>
            <Text>Email: {email}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Pass screen to render (runtime is already set globally by playground)
render(<App />, { runtime: new BrowserRuntime(), screen });`,

  "Interactive List": `// Interactive list with selection
const { useState } = React;
const { Box, Text, List, render, BrowserRuntime } = tui;

const App = () => {
  const [selected, setSelected] = useState('None');

  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
      gap={2}
    >
      <Box
        border={1}
        borderStyle="single"
        borderColor="yellow"
        padding={1}
        minWidth={40}
      >
        <Text color="yellow">Selected: {selected}</Text>
      </Box>

      <List
        border={1}
        borderStyle="single"
        borderColor="cyan"
        minWidth={40}
        minHeight={15}
        items={[
          'Option 1',
          'Option 2',
          'Option 3',
          'Option 4',
          'Option 5'
        ]}
        itemStyle={{ color: 'white' }}
        itemSelected={{ backgroundColor: 'cyan', color: 'black' }}
        itemHover={{ backgroundColor: 'gray' }}
        onSelect={(item, index) => setSelected(\`\${item} (index: \${index})\`)}
      />
    </Box>
  );
};

// Pass screen to render (runtime is already set globally by playground)
render(<App />, { runtime: new BrowserRuntime(), screen });`,

  "Layout Demo": `// Multi-pane layout
const { useState } = React;
const { Box, Text, List, render, BrowserRuntime } = tui;

const App = () => {
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');

  return (
    <Box
      flexDirection="column"
      width="100%"
      height="100%"
    >
      {/* Header */}
      <Box
        backgroundColor="blue"
        padding={1}
        minHeight={3}
      >
        <Text color="white" bold>unblessed React Layout Demo</Text>
      </Box>

      {/* Main content */}
      <Box flexDirection="row" flexGrow={1}>
        {/* Sidebar */}
        <Box
          width={25}
          border={1}
          borderStyle="single"
          borderColor="cyan"
        >
          <List
            items={['Dashboard', 'Users', 'Settings', 'Reports', 'Help']}
            itemStyle={{ color: 'white' }}
            itemSelected={{ backgroundColor: 'cyan', color: 'black' }}
            onSelect={(item) => setSelectedMenu(item)}
          />
        </Box>

        {/* Content area */}
        <Box
          flexGrow={1}
          border={1}
          borderStyle="single"
          borderColor="cyan"
          padding={1}
          flexDirection="column"
          gap={1}
        >
          <Text bold>{selectedMenu}</Text>
          <Text>This is the {selectedMenu} page.</Text>
          <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        backgroundColor="blue"
        padding={1}
        minHeight={3}
      >
        <Text color="white">Press q to quit | Use arrow keys or mouse to navigate</Text>
      </Box>
    </Box>
  );
};

// Pass screen to render (runtime is already set globally by playground)
render(<App />, { runtime: new BrowserRuntime(), screen });`,

  Animation: `// Animated progress bar
const { useState, useEffect } = React;
const { Box, Text, render, BrowserRuntime } = tui;

const App = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Starting...');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;

        if (next < 33) {
          setStatus('Loading resources...');
        } else if (next < 66) {
          setStatus('Processing data...');
        } else if (next < 100) {
          setStatus('Almost done...');
        } else {
          setStatus('Complete!');
          clearInterval(interval);
        }

        return next > 100 ? 100 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100%"
    >
      <Box
        border={1}
        borderStyle="single"
        borderColor="cyan"
        padding={2}
        minWidth={50}
        flexDirection="column"
        gap={2}
      >
        <Text bold color="cyan">Loading Animation</Text>

        <Box
          border={1}
          borderStyle="single"
          minHeight={3}
          position="relative"
        >
          <Box
            width={\`\${progress}%\`}
            height="100%"
            backgroundColor="cyan"
          />
        </Box>

        <Text
          color={progress === 100 ? 'green' : 'yellow'}
          bold={progress === 100}
        >
          {status} ({progress}%)
        </Text>
      </Box>
    </Box>
  );
};

// Pass screen to render (runtime is already set globally by playground)
render(<App />, { runtime: new BrowserRuntime(), screen });`,

  "Full Demo": `// Complete interactive demo
const { useState, useEffect } = React;
const { Box, Text, List, Button, render, BrowserRuntime } = tui;

const DemoContent = ({ demoIndex }) => {
  const [counter, setCounter] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];

  useEffect(() => {
    if (demoIndex === 0) {
      const interval = setInterval(() => {
        setColorIndex((prev) => (prev + 1) % colors.length);
      }, 1000);
      return () => clearInterval(interval);
    } else if (demoIndex === 1) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [demoIndex]);

  if (demoIndex === 0) {
    return (
      <Box
        border={1}
        borderStyle="single"
        borderColor={colors[colorIndex]}
        backgroundColor="black"
        padding={2}
        flexGrow={1}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Text bold>🌈 Rainbow Box 🌈</Text>
        <Text>Colors cycle every second!</Text>
      </Box>
    );
  } else if (demoIndex === 1) {
    return (
      <Box flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
        <Text bold>⚡ Loading Progress ⚡</Text>
        <Box
          border={1}
          borderStyle="single"
          borderColor="blue"
          minWidth={30}
          minHeight={3}
        >
          <Box
            width={\`\${progress}%\`}
            height="100%"
            backgroundColor="green"
          />
        </Box>
        <Text bold>{progress}%</Text>
      </Box>
    );
  } else if (demoIndex === 2) {
    return (
      <Box flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
        <Box
          border={1}
          borderStyle="single"
          borderColor="cyan"
          padding={2}
          minWidth={25}
        >
          <Text bold>Counter: {counter}</Text>
        </Box>
        <Box flexDirection="row" gap={2}>
          <Button
            border={1}
            borderStyle="single"
            padding={1}
            focus={{ backgroundColor: 'green', color: 'black' }}
            onPress={() => setCounter((c) => c + 1)}
          >
            <Text>➕ Add</Text>
          </Button>
          <Button
            border={1}
            borderStyle="single"
            padding={1}
            focus={{ backgroundColor: 'red', color: 'black' }}
            onPress={() => setCounter((c) => c - 1)}
          >
            <Text>➖ Sub</Text>
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center">
      <Text bold>Demo {demoIndex + 1}</Text>
      <Text>Coming soon...</Text>
    </Box>
  );
};

const App = () => {
  const [selectedDemo, setSelectedDemo] = useState(0);

  const demos = [
    '🎨 Colorful Box',
    '📊 Progress Bar',
    '🔘 Buttons',
  ];

  return (
    <Box width="100%" height="100%" flexDirection="column">
      {/* Header */}
      <Box backgroundColor="blue" padding={1} minHeight={3}>
        <Text color="white" bold>🎨 Interactive Demo 🎨</Text>
      </Box>

      <Box flexDirection="row" flexGrow={1}>
        {/* Left Panel */}
        <Box
          width={30}
          border={1}
          borderStyle="single"
          borderColor="cyan"
        >
          <List
            items={demos}
            itemStyle={{ color: 'white' }}
            itemSelected={{ backgroundColor: 'blue', color: 'white', bold: true }}
            onSelect={(item, index) => setSelectedDemo(index)}
          />
        </Box>

        {/* Demo Area */}
        <Box
          flexGrow={1}
          border={1}
          borderStyle="single"
          borderColor="yellow"
        >
          <DemoContent demoIndex={selectedDemo} />
        </Box>
      </Box>

      {/* Footer */}
      <Box backgroundColor="blue" padding={1} minHeight={3}>
        <Text color="white">Arrow Keys: Navigate | Enter: Select | ESC/q: Quit</Text>
      </Box>
    </Box>
  );
};

// Pass screen to render (runtime is already set globally by playground)
render(<App />, { runtime: new BrowserRuntime(), screen });`,
};

export default examplesReact;
