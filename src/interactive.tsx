import React from "react";
import { Box } from "ink";
import { AsciiTitle } from "./components/AsciiTitle.js";
import { InputBox } from "./components/InputBox.js";
import { ModeIndicator } from "./components/ModeIndicator.js";
import { ShortcutBar } from "./components/ShortcutBar.js";

export function InteractiveApp() {
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
      <Box width="100%" marginTop={2} flexDirection="column">
        <InputBox onSubmit={handleSubmit} />
        <ModeIndicator />
      </Box>
      <ShortcutBar />
    </Box>
  );
}
