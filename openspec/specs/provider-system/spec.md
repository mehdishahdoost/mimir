## ADDED Requirements

### Requirement: Provider configuration loading
The system SHALL load provider configurations from `.mimir/providers.json` at startup.

#### Scenario: Valid providers.json exists
- **WHEN** Mimir starts and `.mimir/providers.json` exists
- **THEN** the system parses the file and registers all configured providers

#### Scenario: providers.json is missing
- **WHEN** Mimir starts and `.mimir/providers.json` does not exist
- **THEN** the system creates a default config with empty provider entries

#### Scenario: providers.json has invalid JSON
- **WHEN** Mimir starts and `.mimir/providers.json` contains invalid JSON
- **THEN** the system logs an error and uses default empty configuration

### Requirement: Default provider selection
The system SHALL use a default provider specified in `providers.json` or fall back to the first configured provider.

#### Scenario: Default provider is set
- **WHEN** `providers.json` has `"default": "anthropic"` and anthropic is configured
- **THEN** the system uses anthropic as the active provider on startup

#### Scenario: No default provider
- **WHEN** `providers.json` has no `"default"` field
- **THEN** the system uses the first provider in the providers object

### Requirement: Runtime provider switching
The system SHALL allow switching providers at runtime via the `/model` slash command.

#### Scenario: Switch to valid provider
- **WHEN** user executes `/model openai`
- **THEN** the system sets openai as the active provider and confirms the switch

#### Scenario: Switch to invalid provider
- **WHEN** user executes `/model nonexistent`
- **THEN** the system displays an error listing available providers

#### Scenario: List providers
- **WHEN** user executes `/model` without arguments
- **THEN** the system shows the current provider and lists all available providers

### Requirement: API key resolution
The system SHALL resolve API keys from environment variables referenced in `providers.json`.

#### Scenario: API key with env reference
- **WHEN** provider config has `"apiKey": "env:ANTHROPIC_API_KEY"`
- **THEN** the system reads the value from the `ANTHROPIC_API_KEY` environment variable

#### Scenario: API key is direct value
- **WHEN** provider config has `"apiKey": "sk-abc123"`
- **THEN** the system uses the value directly

#### Scenario: API key environment variable is missing
- **WHEN** provider config references an env var that is not set
- **THEN** the system logs a warning and marks the provider as unavailable

### Requirement: Provider interface
The system SHALL define a common Provider interface that all provider adapters implement.

#### Scenario: Provider implements interface
- **WHEN** a provider adapter is loaded
- **THEN** it exposes `name`, `chat(messages, tools?)`, and returns a standardized response format

#### Scenario: Provider handles tool calls
- **WHEN** the LLM returns tool calls in its response
- **THEN** the provider adapter formats them into a common `ToolCall` structure
