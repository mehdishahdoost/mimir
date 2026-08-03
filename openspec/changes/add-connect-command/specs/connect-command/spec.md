## ADDED Requirements

### Requirement: Template fetching
The system SHALL fetch connector templates from `https://github.com/mehdishahdoost/mimir-connector-template` when `/connect` is executed.

#### Scenario: Successful fetch
- **WHEN** user executes `/connect` and GitHub is reachable
- **THEN** the system fetches all `.json` files from the repository root and parses them as templates

#### Scenario: GitHub unreachable
- **WHEN** user executes `/connect` and GitHub is not reachable
- **THEN** the system displays an error message "Failed to fetch templates from GitHub"

#### Scenario: No templates found
- **WHEN** the repository contains no `.json` files
- **THEN** the system displays "No connector templates available"

### Requirement: Connector selection
The system SHALL display available connectors for user selection.

#### Scenario: Multiple connectors available
- **WHEN** templates are fetched and multiple connectors exist
- **THEN** the system shows a list with connector name and description for each

#### Scenario: Single connector available
- **WHEN** only one template exists
- **THEN** the system selects it automatically and proceeds to variable collection

### Requirement: Variable collection
The system SHALL prompt the user for each variable defined in the template's `metadata.variables` array.

#### Scenario: Variable with url field
- **WHEN** a variable has a `url` field
- **THEN** the system opens the URL in the browser AND displays it as a hint alongside the prompt

#### Scenario: Variable without url field
- **WHEN** a variable has no `url` field
- **THEN** the system shows a plain prompt with the variable name and description

#### Scenario: User provides value
- **WHEN** user types a value and presses Enter
- **THEN** the value is stored for later substitution

### Requirement: Command execution
The system SHALL run each command in `metadata.commands` sequentially.

#### Scenario: Normal command
- **WHEN** a command is not the last command (typically auth/start)
- **THEN** the system executes it and shows "Press Enter to continue..." after completion

#### Scenario: OAuth command (opens browser)
- **WHEN** a command opens a browser for OAuth flow
- **THEN** the system shows "Press Enter when you have completed the authorization"

#### Scenario: Command fails
- **WHEN** a command returns a non-zero exit code
- **THEN** the system displays the error and asks user whether to continue or abort

### Requirement: MCP config generation
The system SHALL generate the MCP server configuration and write it to `.mimir/mcp-servers.json`.

#### Scenario: Placeholder replacement
- **WHEN** the `mcp-server` block contains `<<id>>` placeholders
- **THEN** the system replaces each `<<id>>` with the corresponding variable value collected from the user

#### Scenario: Config merge
- **WHEN** `.mimir/mcp-servers.json` already contains other servers
- **THEN** the system appends the new server without removing existing entries

#### Scenario: Config creation
- **WHEN** `.mimir/mcp-servers.json` does not exist
- **THEN** the system creates it with the new server entry

### Requirement: Completion feedback
The system SHALL display a summary after successful connector setup.

#### Scenario: Setup complete
- **WHEN** all commands run and config is written
- **THEN** the system displays "Connector <name> installed and configured successfully"
