import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";

const ORANGE = "#e85d3b";
const GRAY = "#6b6b6b";
const SURFACE = "#141414";

interface InputBoxProps {
  onSubmit: (value: string) => void;
}

export function InputBox({ onSubmit }: InputBoxProps) {
  const [value, setValue] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  useInput((input, key) => {
    if (key.return) {
      if (value.trim()) {
        onSubmit(value);
        setValue("");
      }
    } else if (key.backspace || key.delete) {
      setValue((v) => v.slice(0, -1));
    } else if (input && !key.ctrl && !key.meta) {
      setValue((v) => v + input);
    }
  });

  const hasValue = value.length > 0;
  const placeholder = "Type your message... (type / for commands)";

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={ORANGE}
      paddingX={1}
      paddingY={1}
      width="100%"
    >
      <Box>
        <Text color={ORANGE}>▌</Text>
        {hasValue ? (
          <Text color="#e0e0e0">
            {value}
            {cursorVisible ? " " : ""}
          </Text>
        ) : (
          <Text color={GRAY}>
            {placeholder}
            {cursorVisible ? " " : ""}
          </Text>
        )}
      </Box>
    </Box>
  );
}
