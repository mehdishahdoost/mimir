import React from "react";
import { Box, Text } from "ink";
import type { Suggestion } from "../commands/suggestions.js";

const ORANGE = "#e85d3b";
const GRAY = "#6b6b6b";
const MAX_VISIBLE = 6;

interface AutocompletePopupProps {
  suggestions: Suggestion[];
  selectedIndex: number;
}

export function AutocompletePopup({
  suggestions,
  selectedIndex,
}: AutocompletePopupProps) {
  if (suggestions.length === 0) return null;

  const visibleSuggestions = suggestions.slice(0, MAX_VISIBLE);
  const hasMore = suggestions.length > MAX_VISIBLE;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={GRAY} paddingX={1}>
      {visibleSuggestions.map((suggestion, i) => (
        <Box key={i}>
          <Text color={i === selectedIndex ? ORANGE : GRAY}>
            {i === selectedIndex ? "▸ " : "  "}
          </Text>
          <Text color={i === selectedIndex ? ORANGE : "#e0e0e0"}>
            {suggestion.text}
          </Text>
          {suggestion.description && (
            <Text color={GRAY}>  {suggestion.description}</Text>
          )}
        </Box>
      ))}
      {hasMore && (
        <Box>
          <Text color={GRAY}>  ... and {suggestions.length - MAX_VISIBLE} more</Text>
        </Box>
      )}
    </Box>
  );
}
