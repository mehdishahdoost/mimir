import React from "react";
import { Box, Text } from "ink";

const ORANGE = "#e85d3b";
const GRAY = "#6b6b6b";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Box flexDirection="column" width="100%" gap={1}>
      {messages.map((msg, i) => (
        <Box key={i} flexDirection="column">
          <Box>
            <Text color={msg.role === "user" ? ORANGE : "#6b6b6b"}>
              {msg.role === "user" ? "You" : "Mimir"}
            </Text>
            <Text color={GRAY}>:</Text>
          </Box>
          <Box paddingLeft={2}>
            <Text color="#e0e0e0" wrap="wrap">
              {msg.content}
            </Text>
          </Box>
        </Box>
      ))}
      {isLoading && (
        <Box>
          <Text color={GRAY}>Thinking...</Text>
        </Box>
      )}
    </Box>
  );
}
