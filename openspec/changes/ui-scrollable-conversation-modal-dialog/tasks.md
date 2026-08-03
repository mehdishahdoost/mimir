## 1. Scrollable Conversation

- [x] 1.1 Create `ScrollableConversation.tsx` component with terminal height calculation using `useStdoutDimensions()`
- [x] 1.2 Implement message line counting (accounting for text wrapping) and truncation logic
- [x] 1.3 Add `↑ N more messages` truncation indicator at top of message area
- [x] 1.4 Integrate `ScrollableConversation` into `AgentApp.tsx`, replacing inline `MessageList` rendering
- [x] 1.5 Verify input box stays pinned at bottom with long conversations

## 2. Modal Dialog Component

- [x] 2.1 Create `Dialog.tsx` component with props: `title`, `options[]`, `selectedIndex`, `onSelect`, `onCancel`
- [x] 2.2 Implement centered bordered box layout with option highlighting (orange `▸` indicator)
- [x] 2.3 Add keyboard hint footer: `↑↓ navigate   Enter select   Esc cancel`
- [x] 2.4 Wire up arrow key navigation (up/down with wrap-around), Enter to select, Escape to cancel

## 3. Integrate Dialog with Commands

- [x] 3.1 Add dialog state to `AgentApp.tsx` (`dialogActive`, `dialogOptions`, `dialogSelectedIndex`, `dialogTitle`)
- [x] 3.2 Route input to dialog navigation when dialog is active (in `handleSubmit` and `useInput`)
- [x] 3.3 Refactor `/model` selection to use `Dialog` component instead of flat text list
- [x] 3.4 Refactor `/connect` template selection to use `Dialog` component

## 4. Verify & Test

- [x] 4.1 Test scrollable conversation with 50+ messages — verify input stays pinned
- [x] 4.2 Test terminal resize — verify messages reflow correctly
- [x] 4.3 Test dialog navigation — arrow keys, Enter, Escape all work
- [x] 4.4 Test `/model` and `/connect` selection flows with dialog UI
- [x] 4.5 Run `npm run build` to verify no type errors
