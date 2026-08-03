## Context

The Mimir CLI app uses Ink (React for terminals) with a simple vertical layout in `AgentApp.tsx`. Messages are rendered via `MessageList.tsx` which grows unbounded, pushing the input box down. For long conversations, the input disappears off-screen.

Selection commands (`/model`, `/connect template`) use text-based lists or the `AutocompletePopup` component which renders inline — not as a centered modal dialog.

**Current layout structure** (AgentApp.tsx:169-204):
```
<Box flexDirection="column" height="100%" padding={2}>
  <AsciiTitle />
  <Box flexDirection="column" maxWidth={60}>
    <MessageList />         ← grows unbounded
    <InputBox />            ← gets pushed down
    <ModeIndicator />
  </Box>
  <ShortcutBar />
</Box>
```

**Constraints**:
- Ink doesn't have built-in scroll containers — must calculate visible area manually
- Terminal height is dynamic (user can resize) — need `useStdoutDimensions()` hook
- Must preserve existing command-intellisense behavior (popup stays inline, only selection flows use modal)

## Goals / Non-Goals

**Goals:**
- Pin input box to bottom of terminal, conversation scrolls above it
- Create reusable `Dialog` component for modal selection (centered card, bordered, arrow navigation)
- Refactor `/model` and `/connect template` selection to use dialog
- Keep title and shortcut bar visible

**Non-Goals:**
- Virtual scrolling / message pagination (future enhancement)
- Custom themes or colors beyond existing palette
- Drag-to-scroll or mouse interaction
- Changing command-intellisense popup (stays inline for slash completion)

## Decisions

### Decision 1: Fixed layout with message truncation (not virtual scroll)

**Choice**: Show only the last N messages that fit in the available terminal height, with a `↑ more messages` indicator.

**Rationale**: Ink doesn't support scroll containers. Virtual scroll would require complex height calculation per message. Truncation is simple, predictable, and sufficient for MVP.

**Alternative considered**: Ink's `<ScrollView>` — doesn't exist natively. Third-party `ink-scroll` packages are unmaintained.

**Implementation**:
- Use `useStdoutDimensions()` to get terminal height
- Reserve fixed heights for: title (3), input+mode (3), shortcut bar (1), padding (4) = ~11 lines
- Available for messages = `terminalHeight - 11`
- Count message lines (wrap-aware) and show only the tail that fits
- Show `↑ N more messages` when truncated

### Decision 2: Modal dialog as overlay Box (not portal)

**Choice**: Render dialog as a centered `<Box>` with border, conditionally shown over the main content. Uses `position: absolute` if needed, or simply replaces the conversation area when active.

**Rationale**: Terminal UIs don't have z-index or layering. Simplest approach: when dialog is active, hide the conversation and show the dialog in its place. InputBox stays visible for keyboard input.

**Alternative considered**: Render dialog below input (current AutocompletePopup style) — doesn't achieve the "centered modal" feel.

**Implementation**:
- New `Dialog.tsx` component with props: `title`, `options[]`, `selectedIndex`, `onSelect`, `onCancel`
- Renders bordered box centered horizontally, with arrow key handling
- AgentApp manages dialog state: `dialogActive`, `dialogOptions`, `dialogSelectedIndex`
- When dialog is active, conversation area is replaced by dialog
- InputBox remains visible but input is routed to dialog navigation

### Decision 3: Dialog keyboard bindings

**Choice**: ↑/↓ navigate, Enter selects, Escape cancels. Same as MiMo-Code model picker pattern.

**Rationale**: Standard terminal UI conventions. Consistent with existing command-intellisense navigation.

## Risks / Trade-offs

- **[Risk] Message truncation loses context** → Mitigation: Show "↑ N more messages" indicator; users can scroll terminal history natively
- **[Risk] Dialog blocks conversation view** → Mitigation: Dialog is ephemeral (selection takes seconds); conversation resumes immediately after
- **[Trade-off] Simple truncation vs virtual scroll** → Acceptable for MVP; virtual scroll can be added later if needed
