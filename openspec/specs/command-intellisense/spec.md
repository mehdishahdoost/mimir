## ADDED Requirements

### Requirement: Autocomplete popup on slash
The system SHALL display an autocomplete popup when the user types `/` as the first character.

#### Scenario: Popup appears on slash
- **WHEN** user types `/`
- **THEN** the system shows a popup listing all available commands with descriptions

#### Scenario: Popup shows after existing text
- **WHEN** user has typed `hello /`
- **THEN** the system does NOT show the popup (only triggers at start of input)

### Requirement: Command filtering
The system SHALL filter popup suggestions as the user types more characters.

#### Scenario: Partial match filters list
- **WHEN** user types `/mo`
- **THEN** the popup shows only commands matching the prefix `mo` (e.g., `/model`)

#### Scenario: No matches
- **WHEN** user types `/xyz`
- **THEN** the popup shows no suggestions and is hidden

### Requirement: Ghost text preview
The system SHALL display a gray preview of the top suggestion after the cursor.

#### Scenario: Ghost text visible
- **WHEN** user types `/mo` and popup shows `/model`
- **THEN** the text `del` appears in gray after the cursor (completing `/model`)

#### Scenario: Ghost text updates on typing
- **WHEN** user types `/model` (exact match)
- **THEN** the ghost text disappears (nothing left to complete)

### Requirement: Subcommand suggestions
The system SHALL suggest subcommands after a command name and space.

#### Scenario: Subcommands for /skills
- **WHEN** user types `/skills `
- **THEN** the popup shows `enable` and `disable` with descriptions

#### Scenario: Subcommands for /model
- **WHEN** user types `/model `
- **THEN** the popup shows available provider names

### Requirement: Dynamic argument suggestions
The system SHALL suggest dynamic arguments based on available resources.

#### Scenario: Skill names for /skills enable
- **WHEN** user types `/skills enable `
- **THEN** the popup shows available skill names from `.mimir/skills/`

#### Scenario: Provider names for /model
- **WHEN** user types `/model `
- **THEN** the popup shows provider names from providers.json

### Requirement: Keyboard navigation
The system SHALL support arrow key navigation in the popup.

#### Scenario: Arrow down moves selection
- **WHEN** popup is open and user presses Down arrow
- **THEN** the selection moves to the next item in the list

#### Scenario: Arrow up moves selection
- **WHEN** popup is open and user presses Up arrow
- **THEN** the selection moves to the previous item in the list

#### Scenario: Wrap around
- **WHEN** selection is at the last item and user presses Down
- **THEN** the selection wraps to the first item

### Requirement: Tab acceptance
The system SHALL accept the selected suggestion when Tab is pressed.

#### Scenario: Tab completes suggestion
- **WHEN** popup is open and user presses Tab
- **THEN** the selected suggestion text replaces the current input and the popup closes

#### Scenario: Tab with partial input
- **WHEN** user types `/mo` and presses Tab
- **THEN** the input becomes `/model ` (with trailing space for arguments)

### Requirement: Escape dismiss
The system SHALL close the popup when Escape is pressed.

#### Scenario: Escape closes popup
- **WHEN** popup is open and user presses Escape
- **THEN** the popup closes and the typed text remains unchanged

### Requirement: Enter behavior
The system SHALL handle Enter based on popup state.

#### Scenario: Enter with popup open selects
- **WHEN** popup is open and user presses Enter
- **THEN** the selected suggestion is accepted (same as Tab)

#### Scenario: Enter without popup executes
- **WHEN** popup is closed and user presses Enter
- **THEN** the command executes normally (existing behavior)
