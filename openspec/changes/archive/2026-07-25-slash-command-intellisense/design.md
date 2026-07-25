## Context

Mimir has a working slash command system with four commands (`/help`, `/model`, `/skills`, `/mcp`). Commands are parsed from raw input and executed immediately. There is no autocomplete, no suggestions, and no visual feedback during typing. Users must memorize command names and argument syntax.

The InputBox component uses Ink's `useInput` hook which captures all keystrokes. Arrow keys, Tab, and Escape are currently unused — they just pass through as regular characters.

## Goals / Non-Goals

**Goals:**
- Show autocomplete popup when user types `/`
- Filter suggestions as user types more characters
- Show ghost text (gray preview) of top suggestion after cursor
- Support subcommand suggestions (`/skills ` → `enable`, `disable`)
- Support dynamic argument suggestions (`/skills enable ` → available skill names)
- Navigate with arrow keys, accept with Tab, dismiss with Escape

**Non-Goals:**
- Mouse-based selection (terminal-native, keyboard only)
- Fuzzy matching (prefix matching is sufficient for 4 commands)
- History-based suggestions (command history exists but not surfaced in intellisense)
- Intellisense for non-slash input (only triggers on `/`)

## Decisions

### 1. Command Registry as data source

**Decision**: Create a `CommandRegistry` that maps command names to metadata (description, subcommand providers, dynamic arg providers).

**Why**: The current `commands` Map in `handler.ts` only stores handlers. We need a parallel data structure for suggestions. Keeping it separate avoids coupling handler logic with UI metadata.

**Structure:**
```typescript
interface CommandMeta {
  name: string;
  description: string;
  subcommands?: SubcommandMeta[];
  dynamicArgs?: (context: CommandContext) => string[];
}

interface SubcommandMeta {
  name: string;
  description: string;
  dynamicArgs?: (context: CommandContext) => string[];
}
```

**Alternatives considered**:
- Annotate existing handlers with metadata: Couples execution with presentation
- Separate registry file: Chosen — cleaner separation

### 2. Popup + Ghost text dual mode

**Decision**: Show both a popup list and ghost text simultaneously.

**Why**: Popup is discoverable (shows all options). Ghost text is fast (accept with one keypress). Together they serve both new users (browse) and power users (type and tab).

**Popup**: Renders below InputBox, shows filtered list with highlight on selected item.
**Ghost text**: Renders after cursor in gray, shows the top (or selected) suggestion's completion text.

### 3. Key routing in InputBox

**Decision**: InputBox manages popup state internally. When popup is open, arrow keys navigate instead of being ignored.

**Why**: Keeping popup logic in InputBox avoids prop-drilling through AgentApp. The popup is a local UI concern — it doesn't affect the command execution pipeline.

**Key behavior:**
- `↑` / `↓` → move selection (when popup open)
- `Tab` → accept suggestion, advance cursor
- `Enter` → accept + execute (if exact match) or just accept
- `Escape` → close popup, keep typed text
- Any other key → type character, re-filter suggestions

### 4. Suggestion resolution

**Decision**: Suggestions are computed on each keystroke using prefix matching.

**Why**: Simple, fast, predictable. With only 4 commands, performance is not a concern. Dynamic suggestions (skill names, provider names) are resolved live from their respective managers.

**Algorithm:**
1. If input starts with `/`, enter intellisense mode
2. Parse current input to determine phase (command / subcommand / arg)
3. Filter available suggestions by prefix
4. If suggestions exist, show popup + ghost text

### 5. State management

**Decision**: `popupOpen`, `selectedIndex`, and `suggestions` are state in InputBox.

**Why**: These are purely visual state. They reset when the input is cleared or submitted. No need to lift to AgentApp.

## Risks / Trade-offs

**[Risk] Ink key handling quirks** → Arrow keys and Tab may have different escape sequences across terminals. Mitigation: Test on common terminals, fall back gracefully.

**[Risk] Popup height overflow** → With many suggestions, popup could exceed terminal height. Mitigation: Cap at 6 visible items with scroll indicator.

**[Trade-off] Prefix vs fuzzy** → Prefix matching is simpler but less forgiving. Users must type in order. Acceptable for 4 commands.
