## ADDED Requirements

### Requirement: Prompt assembly
The system SHALL assemble the LLM prompt from base prompt, active skills, and MCP tool schemas.

#### Scenario: Prompt with auto-loaded skills
- **WHEN** the system assembles a prompt and skills are auto-loaded
- **THEN** the prompt contains the base system prompt followed by skill content

#### Scenario: Prompt with MCP tools
- **WHEN** the system assembles a prompt and MCP servers are enabled
- **THEN** the prompt includes MCP tool schemas in the tools parameter

#### Scenario: Prompt with conversation history
- **WHEN** the system assembles a prompt for a multi-turn conversation
- **THEN** the prompt includes the full conversation history

### Requirement: LLM request execution
The system SHALL send assembled prompts to the active provider and receive responses.

#### Scenario: Provider is configured
- **WHEN** the system sends a request and a provider is active
- **THEN** the request is sent to the provider's API endpoint

#### Scenario: Provider is not configured
- **WHEN** the system sends a request and no provider is active
- **THEN** the system displays an error asking the user to configure a provider with /model

#### Scenario: API request fails
- **WHEN** the provider API returns an error
- **THEN** the system displays the error message and does not crash

### Requirement: Tool call loop
The system SHALL handle multi-step tool calls in a loop until the LLM provides a final text response.

#### Scenario: LLM returns tool calls
- **WHEN** the LLM response contains tool_calls
- **THEN** the system executes the tool calls, appends results, and calls the LLM again

#### Scenario: LLM returns final text
- **WHEN** the LLM response contains only text (no tool_calls)
- **THEN** the system displays the response to the user and ends the loop

#### Scenario: Tool call limit reached
- **WHEN** the system has executed more than 10 tool calls in a single request
- **THEN** the system stops the loop and displays a warning

### Requirement: Response display
The system SHALL display LLM responses in the terminal conversation view.

#### Scenario: Text response
- **WHEN** the LLM returns a text response
- **THEN** the system renders it in the message list component

#### Scenario: Response with markdown
- **WHEN** the LLM response contains markdown formatting
- **THEN** the system renders it with appropriate terminal formatting (code blocks, lists)

### Requirement: Request cancellation
The system SHALL allow users to cancel an in-progress LLM request.

#### Scenario: User presses escape during request
- **WHEN** the system is waiting for an LLM response and user presses Escape
- **THEN** the system cancels the request and returns to input state

### Requirement: Conversation state
The system SHALL maintain conversation history within a session.

#### Scenario: Multi-turn conversation
- **WHEN** the user sends multiple messages
- **THEN** the system includes previous messages in subsequent LLM requests

#### Scenario: New session
- **WHEN** the user starts Mimir fresh
- **THEN** the conversation history is empty
