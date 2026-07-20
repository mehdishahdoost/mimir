# DESIGN.md — Mimir

## 1. Objective

Mimir is a terminal-native AI assistant interface. The experience should feel like a command center — dark, dense, immediate. Every pixel earns its place. Users should feel like they're operating a tool, not using an app.

## 2. Product Context

- **What the product does:** A terminal-based AI assistant with a chat interface and extensible command system.
- **Who it's for:** Developers and power users who live in the terminal and want AI assistance without leaving it.
- **Adjacent brands (feel like these):** MiMo Code, Claude Code, Warp terminal
- **Distant brand (do not feel like this):** ChatGPT web UI (browser-bound, mouse-heavy, consumer-friendly)
- **Cultural register:** Technical, minimal, capable

## 3. Visual Foundations

### 3a. Color

- **Background:** `#0a0a0a` (near-black, not pure black)
- **Surface:** `#141414` (input box background)
- **Border/accent:** `#e85d3b` (warm orange — Mimir's signature)
- **Text primary:** `#e0e0e0` (off-white)
- **Text secondary:** `#6b6b6b` (muted gray)
- **Text accent:** `#e85d3b` (orange for highlights, mode labels)
- **Usage rules:** Orange is used sparingly — title accent, active mode indicator, cursor. Never as background fill.

### 3b. Typography

- **Display (ASCII art):** Custom block-letter rendering via terminal characters
- **Body/UI:** System monospace (`SF Mono`, `Fira Code`, `JetBrains Mono`, `Cascadia Code`, monospace)
- **Type scale:** Terminal-native — sizes controlled by terminal, not px. Hierarchy via weight and color, not size.

### 3c. Spacing & rhythm

- **Base unit:** 1 cell (character width/height)
- **Layout:** Centered vertically and horizontally within terminal viewport
- **Input box:** Full-width with padding, visually separated from background

### 3d. Component seeds

- **Input box:** Dark surface (`#141414`), orange left-border accent, placeholder text in gray, cursor in orange
- **Mode indicator:** Inline text below input — orange label + gray description
- **Shortcut bar:** Bottom-anchored, gray text with orange key hints
- **ASCII title:** Large block letters, orange + white, centered above input

## 4. Accessibility

- **Text contrast:** All text meets 4.5:1 against background
- **Focus indicators:** Orange cursor block, always visible
- **Keyboard-only:** Full navigation without mouse
- **Reduced motion:** Glitch effect is opt-in or subtle enough to not cause discomfort

## 5. Voice & Tone

- **Register:** Technical, concise
- **Sentence rhythm:** Short — status messages, not paragraphs
- **Words this brand uses:** "ready", "mode", "command"
- **Words this brand refuses:** "journey", "seamless", "delight", "unlock"
- **Address:** "you"

## 6. Implementation Practices

- **Framework:** Ink (React for CLI) with TypeScript
- **Token format:** JavaScript/TypeScript constants
- **Grid system:** Terminal grid (columns × rows)
- **Motion:** Subtle glitch effect on background (CSS animations or Ink equivalents), cursor blink

## 7. Anti-Patterns

- **No browser UI patterns.** This is terminal-native — no rounded cards, no shadows, no gradients that imply depth.
- **No mouse-first design.** Every action must have a keyboard shortcut or command.
- **No decorative elements.** If it doesn't help the user act or understand state, it doesn't exist.
- **No color for color's sake.** Orange encodes meaning (active, important, interactive) — never decoration.

## 8. Decision-Making

1. **Keyboard-first.** When in doubt, add a keyboard shortcut instead of a visual element.
2. **Density over spaciousness.** Terminal users want information density, not whitespace.
3. **State clarity.** The user must always know what mode they're in and what's active.
4. **Minimal chrome.** Borders and separators only when ambiguity would result without them.

## 9. Workflow

1. Set up Ink project with TypeScript
2. Create base App component with full-terminal layout
3. Implement ASCII art title component ("MIMIR")
4. Build input component with placeholder, cursor, and orange accent
5. Add mode indicator bar
6. Add keyboard shortcut bar
7. Wire up basic input handling (submit, clear)
8. Add glitch/background effect (optional, last)
