#!/usr/bin/env node
import React from "react";
import { render, Box, Text } from "ink";
import { AsciiTitle } from "./components/AsciiTitle.js";
import { ModeIndicator } from "./components/ModeIndicator.js";
import { ShortcutBar } from "./components/ShortcutBar.js";

const GRAY = "#6b6b6b";
const ORANGE = "#e85d3b";

function StaticApp() {
  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
      padding={2}
    >
      <AsciiTitle />
      <Box
        width="100%"
        marginTop={2}
        flexDirection="column"
        borderStyle="round"
        borderColor={ORANGE}
        paddingX={1}
        paddingY={1}
      >
        <Box>
          <Text color={ORANGE}>▌</Text>
          <Text color={GRAY}>Type your message... (type / for commands)</Text>
        </Box>
      </Box>
      <ModeIndicator />
      <ShortcutBar />
    </Box>
  );
}

// Check if we can run in interactive mode
if (process.stdin?.isTTY) {
  // Dynamic import for interactive mode
  import("./AgentApp.js").then(({ AgentApp }) => {
    render(React.createElement(AgentApp));
  });
} else {
  // Static preview mode
  render(React.createElement(StaticApp));
}
