## Why

Users have to remember slash command names and their arguments. There's no discoverability — typing `/` just shows a placeholder message saying "type / for commands" but doesn't list what's available. This creates friction for new users and slows down power users who can't recall exact command syntax.

## What Changes

- Add autocomplete popup that appears when user types `/`, showing available commands
- Add ghost text (gray preview) of top suggestion after the cursor
- Support command filtering as user types (e.g., `/mo` → only `/model`)
- Support subcommand suggestions (e.g., `/skills ` → `enable`, `disable`)
- Support dynamic argument suggestions (e.g., `/skills enable ` → available skill names)
- Add keyboard navigation: arrow keys to select, Tab to accept, Escape to dismiss
- Add command registry with metadata (descriptions, subcommands) for suggestion source

## Capabilities

### New Capabilities

- `command-intellisense`: Autocomplete popup, ghost text, suggestion filtering, keyboard navigation for slash commands and their arguments

### Modified Capabilities

- `command-system`: Commands need to expose metadata (description, subcommands, dynamic arg providers) for the intellisense registry

## Impact

- **New code**: Suggestion engine, autocomplete popup component, command registry with metadata
- **Modified code**: InputBox component (key routing, ghost text), command handler (expose metadata), AgentApp (popup state management)
- **UI behavior**: InputBox now shows popup below when `/` is typed, handles arrow keys differently
