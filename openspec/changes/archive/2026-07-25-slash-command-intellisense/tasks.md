## 1. Command Registry

- [x] 1.1 Create `src/commands/registry.ts` with CommandMeta and SubcommandMeta interfaces
- [x] 1.2 Register static command metadata (name, description, subcommands) for /help, /model, /skills, /mcp
- [x] 1.3 Add dynamic arg provider functions for /model (provider names) and /skills (skill names)

## 2. Suggestion Engine

- [x] 2.1 Create `src/commands/suggestions.ts` with getSuggestions function
- [x] 2.2 Implement prefix matching for command names
- [x] 2.3 Implement subcommand suggestion resolution
- [x] 2.4 Implement dynamic argument suggestion resolution using CommandContext

## 3. AutocompletePopup Component

- [x] 3.1 Create `src/components/AutocompletePopup.tsx` with suggestion list rendering
- [x] 3.2 Implement highlight on selected item (orange accent)
- [x] 3.3 Implement description display in gray for each suggestion
- [x] 3.4 Cap popup height at 6 items with scroll indicator

## 4. Ghost Text in InputBox

- [x] 4.1 Add ghost text state to InputBox (suggestion text, visible flag)
- [x] 4.2 Render ghost text in gray after cursor position
- [x] 4.3 Update ghost text on each keystroke based on top suggestion

## 5. Key Routing

- [x] 5.1 Add popup state management to InputBox (popupOpen, selectedIndex)
- [x] 5.2 Handle Up/Down arrow keys to navigate popup when open
- [x] 5.3 Handle Tab to accept suggestion and close popup
- [x] 5.4 Handle Escape to dismiss popup without changing input
- [x] 5.5 Handle Enter: accept selection if popup open, execute if closed

## 6. Integration

- [x] 6.1 Wire CommandRegistry into InputBox via props from AgentApp
- [x] 6.2 Pass CommandContext (providers, skills, mcp) to suggestion engine
- [x] 6.3 Test popup rendering in terminal
