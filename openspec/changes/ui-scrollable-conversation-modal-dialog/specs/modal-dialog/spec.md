## ADDED Requirements

### Requirement: Modal dialog for selection
The system SHALL display a centered, bordered modal dialog when the user needs to make a selection from a list of options (e.g., `/model` provider selection, `/connect` template selection).

#### Scenario: Dialog appears centered
- **WHEN** user triggers a selection command (e.g., `/model`)
- **THEN** a bordered dialog box appears centered horizontally in the terminal, displaying the title and list of options

#### Scenario: Dialog replaces conversation view
- **WHEN** dialog is active
- **THEN** the conversation area is replaced by the dialog (input box remains visible)

### Requirement: Dialog content layout
The system SHALL render the dialog with a title, bordered option list, and keyboard hint footer.

#### Scenario: Dialog structure
- **WHEN** dialog is displayed
- **THEN** it shows: title text, a bordered box containing options with arrow indicator (▸) for selected item, and a footer with `↑↓ navigate   Enter select   Esc cancel`

#### Scenario: Option display
- **WHEN** dialog shows 3 options
- **THEN** each option displays its label and optional description, with the selected option highlighted in orange

### Requirement: Keyboard navigation in dialog
The system SHALL support arrow key navigation, Enter to select, and Escape to cancel in the dialog.

#### Scenario: Arrow down moves selection
- **WHEN** dialog is open and user presses Down arrow
- **THEN** the selection moves to the next option

#### Scenario: Arrow up moves selection
- **WHEN** dialog is open and user presses Up arrow
- **THEN** the selection moves to the previous option

#### Scenario: Wrap around navigation
- **WHEN** selection is at the last option and user presses Down
- **THEN** the selection wraps to the first option

#### Scenario: Enter selects option
- **WHEN** dialog is open and user presses Enter
- **THEN** the selected option is returned to the caller and the dialog closes

#### Scenario: Escape cancels selection
- **WHEN** dialog is open and user presses Escape
- **THEN** the dialog closes with no selection (null result)

### Requirement: Dialog dismissal after selection
The system SHALL close the dialog and resume normal operation after a selection is made or cancelled.

#### Scenario: After selection
- **WHEN** user selects an option in the dialog
- **THEN** the dialog closes and the conversation view is restored

#### Scenario: After cancellation
- **WHEN** user presses Escape in the dialog
- **THEN** the dialog closes and the conversation view is restored
