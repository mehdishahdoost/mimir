import React from "react";
import { Box, Text } from "ink";

const GRAY = "#6b6b6b";
const ORANGE = "#e85d3b";

interface Shortcut {
  key: string;
  label: string;
}

const SHORTCUTS: Shortcut[] = [
  { key: "tab", label: "switch mode" },
  { key: "ctrl+p", label: "settings" },
  { key: "/", label: "commands" },
];

export function ShortcutBar() {
  return (
    <Box justifyContent="center" gap={2} marginTop={1}>
      {SHORTCUTS.map((s, i) => (
        <React.Fragment key={i}>
          <Text color={ORANGE}>{s.key}</Text>
          <Text color={GRAY}>{s.label}</Text>
        </React.Fragment>
      ))}
    </Box>
  );
}
