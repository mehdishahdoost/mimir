import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, useInput, useWindowSize } from "ink";
import { AutocompletePopup } from "./AutocompletePopup.js";
import { getSuggestions, type Suggestion } from "../commands/suggestions.js";
import type { CommandContext } from "../commands/registry.js";

const ORANGE = "#e85d3b";
const GRAY = "#6b6b6b";

interface InputBoxProps {
  onSubmit: (value: string) => void;
  commandContext?: CommandContext;
  placeholder?: string;
  disabled?: boolean;
}

export function InputBox({ onSubmit, commandContext, placeholder, disabled }: InputBoxProps) {
  const { columns } = useWindowSize();
  const [value, setValue] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const suggestions: Suggestion[] = useMemo(() => {
    if (!commandContext || !value.startsWith("/")) return [];
    return getSuggestions(value, commandContext);
  }, [value, commandContext]);

  useEffect(() => {
    if (value.startsWith("/") && suggestions.length > 0) {
      setPopupOpen(true);
      setSelectedIndex(0);
    } else {
      setPopupOpen(false);
    }
  }, [value, suggestions.length]);

  const ghostText = useMemo(() => {
    if (!popupOpen || suggestions.length === 0) return "";
    const top = suggestions[selectedIndex] || suggestions[0];
    if (!top) return "";
    if (top.text === value) return "";
    if (top.text.startsWith(value)) {
      return top.text.slice(value.length);
    }
    return "";
  }, [popupOpen, suggestions, selectedIndex, value]);

  const acceptSuggestion = (suggestion: Suggestion) => {
    setValue(suggestion.text);
    setPopupOpen(false);
    setSelectedIndex(0);
  };

  useInput((input, key) => {
    if (disabled) return;

    if (key.escape) {
      if (popupOpen) {
        setPopupOpen(false);
        return;
      }
    }

    if (key.upArrow) {
      if (popupOpen && suggestions.length > 0) {
        setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
    }

    if (key.downArrow) {
      if (popupOpen && suggestions.length > 0) {
        setSelectedIndex((i) => (i + 1) % suggestions.length);
        return;
      }
    }

    if (key.tab) {
      if (popupOpen && suggestions.length > 0) {
        acceptSuggestion(suggestions[selectedIndex]);
        return;
      }
    }

    if (key.return) {
      if (popupOpen && suggestions.length > 0) {
        acceptSuggestion(suggestions[selectedIndex]);
        return;
      }
      if (value.trim()) {
        onSubmit(value);
        setValue("");
        setPopupOpen(false);
        setSelectedIndex(0);
      }
      return;
    }

    if (key.backspace || key.delete) {
      setValue((v) => v.slice(0, -1));
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      setValue((v) => v + input);
    }
  });

  const hasValue = value.length > 0;
  const defaultPlaceholder = "Type your message... (type / for commands)";
  const inputBoxWidth = Math.max(20, columns - 4);
  const textViewportWidth = Math.max(8, inputBoxWidth - 6);
  const visibleValue =
    value.length > textViewportWidth
      ? value.slice(value.length - textViewportWidth)
      : value;
  const visibleGhost = ghostText.slice(
    0,
    Math.max(0, textViewportWidth - visibleValue.length)
  );
  const visiblePlaceholder = (placeholder || defaultPlaceholder).slice(
    0,
    textViewportWidth
  );

  return (
    <Box flexDirection="column" width="100%">
      <Box
        borderStyle="round"
        borderColor={disabled ? GRAY : ORANGE}
        paddingX={1}
        paddingY={1}
        width="100%"
      >
        <Box>
          <Text color={disabled ? GRAY : ORANGE}>▌</Text>
          {disabled ? (
            <Text color={GRAY} wrap="truncate-end">
              {visiblePlaceholder}
            </Text>
          ) : hasValue ? (
            <>
              <Text color="#e0e0e0" wrap="truncate-start">
                {visibleValue}
              </Text>
              {visibleGhost && <Text color={GRAY}>{visibleGhost}</Text>}
              <Text>{cursorVisible ? " " : ""}</Text>
            </>
          ) : placeholder ? (
            <Text color={ORANGE} wrap="truncate-end">
              {visiblePlaceholder}
              {cursorVisible ? " " : ""}
            </Text>
          ) : (
            <Text color={GRAY} wrap="truncate-end">
              {visiblePlaceholder}
              {cursorVisible ? " " : ""}
            </Text>
          )}
        </Box>
      </Box>
      {popupOpen && (
        <AutocompletePopup
          suggestions={suggestions}
          selectedIndex={selectedIndex}
        />
      )}
    </Box>
  );
}
