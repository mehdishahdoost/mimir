## ADDED Requirements

### Requirement: Slash command parsing
The system SHALL parse user input for slash commands before sending to the LLM.

#### Scenario: Input starts with /
- **WHEN** user types `/model openai`
- **THEN** the system parses it as command "model" with argument "openai"

#### Scenario: Input does not start with /
- **WHEN** user types "hello, how are you?"
- **THEN** the system sends it to the LLM as a normal message

#### Scenario: Multiple word arguments
- **WHEN** user types `/skills enable code-review`
- **THEN** the system parses command "skills" with subcommand "enable" and argument "code-review"

### Requirement: Built-in commands
The system SHALL support the following built-in slash commands.

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

### Requirement: Command feedback
The system SHALL display command results immediately in the terminal.

#### Scenario: Successful command
- **WHEN** a command executes successfully
- **THEN** the system displays a confirmation message with relevant details

#### Scenario: Failed command
- **WHEN** a command fails (invalid arguments, missing resource)
- **THEN** the system displays an error message with usage hints

### Requirement: Command history
The system SHALL track recently executed commands for potential future use.

#### Scenario: Command is executed
- **WHEN** a slash command is successfully executed
- **THEN** the command and its arguments are recorded in state
