import React from "react";
import { Box, Text } from "ink";

const ORANGE = "#e85d3b";
const GRAY = "#6b6b6b";

export function ModeIndicator() {
  return (
    <Box marginTop={1} paddingLeft={2}>
      <Text color={ORANGE}>Build</Text>
      <Text color={GRAY}> · </Text>
      <Text color="#e0e0e0">Mimir Auto</Text>
    </Box>
  );
}
