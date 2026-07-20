import React from "react";
import { Box, Text } from "ink";
import { AsciiTitle } from "./components/AsciiTitle.js";
import { InputBox } from "./components/InputBox.js";
import { ModeIndicator } from "./components/ModeIndicator.js";
import { ShortcutBar } from "./components/ShortcutBar.js";

interface AppProps {
  isRawModeSupported?: boolean;
}

export function App({ isRawModeSupported = true }: AppProps) {
  const handleSubmit = (value: string) => {
    // Future: process command or send to AI
  };

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
      <Box width="100%" maxWidth={60} marginTop={2} flexDirection="column">
        <InputBox onSubmit={handleSubmit} />
        <ModeIndicator />
      </Box>
      <ShortcutBar />
    </Box>
  );
}
