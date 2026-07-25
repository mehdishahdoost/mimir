## MODIFIED Requirements

### Requirement: Built-in commands
The system SHALL support the following built-in slash commands with associated metadata for intellisense.

#### Scenario: /model command
- **WHEN** user executes `/model` or `/model [provider]`
- **THEN** the system shows available providers or switches to the specified provider

#### Scenario: /skills command
- **WHEN** user executes `/skills`, `/skills enable [name]`, or `/skills disable [name]`
- **THEN** the system lists skills or enables/disables the specified skill

#### Scenario: /mcp command
- **WHEN** user executes `/mcp`
- **THEN** the system shows MCP server status

#### Scenario: /help command
- **WHEN** user executes `/help`
- **THEN** the system displays all available slash commands with descriptions
