import React from "react";
import { Box, Text, useInput } from "ink";

const ORANGE = "#e85d3b";
const GRAY = "#6b6b6b";

export interface DialogOption {
  label: string;
  description?: string;
}

interface DialogProps {
  title: string;
  options: DialogOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onCancel: () => void;
  onNavigate: (index: number) => void;
}

export function Dialog({
  title,
  options,
  selectedIndex,
  onSelect,
  onCancel,
  onNavigate,
}: DialogProps) {
  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.upArrow) {
      onNavigate((selectedIndex - 1 + options.length) % options.length);
      return;
    }

    if (key.downArrow) {
      onNavigate((selectedIndex + 1) % options.length);
      return;
    }

    if (key.return) {
      onSelect(selectedIndex);
      return;
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" width="100%" height="100%">
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={ORANGE}
        paddingX={4}
        paddingY={2}
        minWidth={48}
      >
        <Box marginBottom={1}>
          <Text color={ORANGE} bold>
            {title}
          </Text>
        </Box>
        <Box flexDirection="column" gap={0}>
          {options.map((option, i) => (
            <Box
              key={i}
              paddingX={1}
              paddingY={0}
            >
              <Text color={i === selectedIndex ? ORANGE : GRAY}>
                {i === selectedIndex ? "▸ " : "  "}
              </Text>
              <Text
                bold={i === selectedIndex}
                color={i === selectedIndex ? ORANGE : "#e0e0e0"}
              >
                {option.label}
              </Text>
              {option.description && (
                <Text color={GRAY}>  {option.description}</Text>
              )}
            </Box>
          ))}
        </Box>
        <Box marginTop={1}>
          <Text color={GRAY}>
            ↑↓ navigate   Enter select   Esc cancel
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
