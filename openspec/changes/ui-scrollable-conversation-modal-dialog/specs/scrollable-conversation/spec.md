## ADDED Requirements

### Requirement: Fixed layout with pinned input
The system SHALL render a fixed layout where the input box is pinned to the bottom of the terminal and the conversation area occupies the space above it.

#### Scenario: Input stays at bottom on long conversations
- **WHEN** user has sent 50+ messages and the conversation is longer than the terminal height
- **THEN** the input box remains visible at the bottom of the screen

#### Scenario: Title stays at top
- **WHEN** conversation is displayed
- **THEN** the ASCII title remains fixed at the top of the terminal

### Requirement: Message truncation with indicator
The system SHALL display only the most recent messages that fit in the available terminal height, showing a truncation indicator when older messages are hidden.

#### Scenario: Messages fit in terminal
- **WHEN** total message height is less than available terminal space
- **THEN** all messages are displayed without truncation

#### Scenario: Messages exceed terminal height
- **WHEN** total message height exceeds available terminal space
- **THEN** only the most recent messages that fit are displayed, and an indicator shows `↑ N more messages` at the top of the message area

#### Scenario: Truncation indicator count
- **WHEN** 12 messages are hidden due to truncation
- **THEN** the indicator displays `↑ 12 more messages`

### Requirement: Dynamic terminal resize
The system SHALL recalculate visible messages when the terminal is resized.

#### Scenario: Terminal grows taller
- **WHEN** user resizes the terminal to be taller
- **THEN** more messages become visible (truncation indicator updates or disappears)

#### Scenario: Terminal shrinks
- **WHEN** user resizes the terminal to be shorter
- **THEN** fewer messages are shown and truncation indicator updates accordingly

### Requirement: Loading indicator in scroll area
The system SHALL display the "Thinking..." indicator within the scrollable message area, positioned after the last message.

#### Scenario: Loading during message truncation
- **WHEN** user is waiting for a response and messages are truncated
- **THEN** the "Thinking..." indicator appears at the bottom of the visible message area
