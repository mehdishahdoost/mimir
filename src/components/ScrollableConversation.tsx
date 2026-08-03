import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, useInput, useWindowSize } from "ink";

const ORANGE = "#e85d3b";
const GRAY = "#6b6b6b";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ScrollableConversationProps {
  messages: Message[];
  isLoading?: boolean;
  height?: number;
}

interface ConversationLine {
  text: string;
  color?: string;
}

interface ScrollbarProps {
  height: number;
  totalLines: number;
  visibleLines: number;
  startLine: number;
}

function Scrollbar({
  height,
  totalLines,
  visibleLines,
  startLine,
}: ScrollbarProps) {
  const thumbHeight = Math.max(
    1,
    Math.min(height, Math.round((visibleLines / totalLines) * height))
  );
  const scrollRange = Math.max(1, totalLines - visibleLines);
  const thumbRange = Math.max(0, height - thumbHeight);
  const thumbStart = Math.round((startLine / scrollRange) * thumbRange);

  return (
    <Box flexDirection="column" width={1} height={height}>
      {Array.from({ length: height }, (_, index) => {
        const isThumb = index >= thumbStart && index < thumbStart + thumbHeight;
        return (
          <Text key={index} color={isThumb ? ORANGE : GRAY}>
            {isThumb ? "┃" : "│"}
          </Text>
        );
      })}
    </Box>
  );
}

function wrapLine(line: string, maxWidth: number): string[] {
  if (line.length === 0) return [""];

  const wrapped: string[] = [];
  for (let i = 0; i < line.length; i += maxWidth) {
    wrapped.push(line.slice(i, i + maxWidth));
  }
  return wrapped;
}

function contentLines(content: string, maxWidth: number): string[] {
  return content
    .split("\n")
    .flatMap((line) => wrapLine(line, Math.max(1, maxWidth)));
}

export function ScrollableConversation({
  messages,
  isLoading,
  height,
}: ScrollableConversationProps) {
  const { columns, rows } = useWindowSize();
  const [scrollOffset, setScrollOffset] = useState(0);

  // Used only when a parent does not provide an explicit viewport height.
  const FIXED_LINES = 18;
  const availableLines = Math.max(3, height ?? rows - FIXED_LINES);
  const contentWidth = Math.max(10, columns - 8);
  const lines = useMemo<ConversationLine[]>(() => {
    const rendered: ConversationLine[] = [];

    messages.forEach((msg, index) => {
      if (index > 0) {
        rendered.push({ text: " " });
      }

      rendered.push({
        text: `${msg.role === "user" ? "You" : "Mimir"}:`,
        color: msg.role === "user" ? ORANGE : GRAY,
      });

      for (const line of contentLines(msg.content, contentWidth - 2)) {
        rendered.push({ text: `  ${line}`, color: "#e0e0e0" });
      }
    });

    if (isLoading) {
      if (rendered.length > 0) {
        rendered.push({ text: " " });
      }
      rendered.push({ text: "Thinking...", color: GRAY });
    }

    return rendered;
  }, [contentWidth, isLoading, messages]);

  const visibleCount = Math.min(lines.length, availableLines);
  const isScrollable = lines.length > visibleCount;
  const maxScrollOffset = Math.max(0, lines.length - visibleCount);

  useEffect(() => {
    setScrollOffset(0);
  }, [messages.length, isLoading]);

  useEffect(() => {
    setScrollOffset((current) => Math.min(current, maxScrollOffset));
  }, [maxScrollOffset]);

  useInput((_input, key) => {
    if (maxScrollOffset === 0) return;

    if (key.upArrow) {
      setScrollOffset((current) => Math.min(maxScrollOffset, current + 1));
      return;
    }

    if (key.downArrow) {
      setScrollOffset((current) => Math.max(0, current - 1));
      return;
    }

    if (key.pageUp) {
      setScrollOffset((current) =>
        Math.min(maxScrollOffset, current + Math.max(1, availableLines - 1))
      );
      return;
    }

    if (key.pageDown) {
      setScrollOffset((current) =>
        Math.max(0, current - Math.max(1, availableLines - 1))
      );
      return;
    }

    if (key.home) {
      setScrollOffset(maxScrollOffset);
      return;
    }

    if (key.end) {
      setScrollOffset(0);
    }
  });

  const start = Math.max(0, maxScrollOffset - scrollOffset);
  const visibleLines = lines.slice(start, start + visibleCount);

  if (messages.length === 0 && !isLoading) {
    return <Box width="100%" />;
  }

  return (
    <Box
      flexDirection="row"
      width="100%"
      height={isScrollable ? availableLines : undefined}
    >
      <Box flexDirection="column" flexGrow={1}>
        {visibleLines.map((line, i) => (
          <Text key={`${start}-${i}`} color={line.color} wrap="truncate-end">
            {line.text}
          </Text>
        ))}
      </Box>
      {isScrollable && (
        <Box marginLeft={1}>
          <Scrollbar
            height={availableLines}
            totalLines={lines.length}
            visibleLines={visibleCount}
            startLine={start}
          />
        </Box>
      )}
    </Box>
  );
}
