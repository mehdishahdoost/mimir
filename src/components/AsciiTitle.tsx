import React from "react";
import { Box, Text } from "ink";

const TITLE_LINES = [
  "█   █ █████ █   █ █████ █████",
  "██ ██   █   ██ ██   █   █   █",
  "█ █ █   █   █ █ █   █   █████",
  "█   █   █   █   █   █   █ █  ",
  "█   █ █████ █   █ █████ █   █",
];

const ORANGE = "#e85d3b";
const GRAY = "#6b6b6b";

export function AsciiTitle() {
  return (
    <Box flexDirection="column" alignItems="center" marginTop={1}>
      {TITLE_LINES.map((line, i) => (
        <Text key={i} color={ORANGE} bold>
          {line}
        </Text>
      ))}
      <Box marginTop={1}>
        <Text color={GRAY}>AI Agent Harness</Text>
      </Box>
    </Box>
  );
}
