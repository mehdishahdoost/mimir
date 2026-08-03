## Why

Two UX issues degrade the terminal experience as conversations grow longer:

1. **Scrolling issue**: Messages push the input box down as the conversation grows, forcing users to scroll through terminal history to reach the input. This is jarring in long conversations.

2. **Selection UI**: Commands like `/model` and `/connect` present flat text lists for selection. Users expect a more polished, centered modal dialog with clear visual hierarchy (similar to VS Code command palette or MiMo-Code model picker).

## What Changes

- **Scrollable conversation pane**: Implement a fixed layout where the conversation area scrolls (showing the most recent messages that fit) while the input stays pinned at the bottom
- **Modal dialog component**: Create a reusable `Dialog` component that renders as a centered, bordered card with arrow-key navigation, replacing flat text lists for selection flows
- **Refactor `/model` selection**: Update model selection to use the new dialog component
- **Refactor `/connect` template selection**: Update connect flow template chooser to use the new dialog component

## Capabilities

### New Capabilities

- `scrollable-conversation`: Fixed-layout conversation view with scrollable message area and pinned input
- `modal-dialog`: Reusable modal dialog component for interactive selection flows

### Modified Capabilities

- `command-intellisense`: Minor updates to selection UI (dialog replaces flat lists for `/model`, `/connect`)

## Impact

- **Components affected**: `MessageList.tsx`, `AgentApp.tsx`, `InputBox.tsx`, `AutocompletePopup.tsx`
- **New components**: `Dialog.tsx`, `ScrollableConversation.tsx` (or refactor existing)
- **Commands affected**: `/model` (selection UI), `/connect` (template selection)
- **Dependencies**: None added — uses existing Ink primitives (`Box`, `Text`)
- **Layout**: AgentApp.tsx layout structure changes from vertical-grow to fixed-height scrollable
