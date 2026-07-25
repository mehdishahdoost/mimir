## ADDED Requirements

### Requirement: MCP server configuration
The system SHALL load MCP server definitions from `.mimir/mcp-servers.json`.

#### Scenario: Valid config exists
- **WHEN** Mimir starts and `.mimir/mcp-servers.json` exists with valid entries
- **THEN** the system parses and stores the server configurations

#### Scenario: Config is missing
- **WHEN** Mimir starts and `.mimir/mcp-servers.json` does not exist
- **THEN** the system creates a default empty config

#### Scenario: Server has enabled flag
- **WHEN** a server entry has `"enabled": false`
- **THEN** the system does not include its tools in the prompt and does not spin it up

### Requirement: Per-request MCP lifecycle
The system SHALL spawn MCP server processes per-request and tear them down after.

#### Scenario: Request with enabled MCP servers
- **WHEN** a user message triggers an LLM call and MCP servers are enabled
- **THEN** the system spawns the MCP server processes before the LLM call

#### Scenario: Request completes
- **WHEN** the LLM conversation loop completes (final text response)
- **THEN** the system terminates all spawned MCP server processes

#### Scenario: Request fails
- **WHEN** the LLM call or tool execution fails
- **THEN** the system still terminates all MCP server processes

### Requirement: Tool schema injection
The system SHALL include tool schemas from enabled MCP servers in the LLM prompt.

#### Scenario: Enabled server with tools
- **WHEN** an MCP server is enabled and provides tools
- **THEN** the tool schemas are included in the LLM request's tool definitions

#### Scenario: No enabled servers
- **WHEN** no MCP servers are enabled
- **THEN** the LLM request has no tool definitions

#### Scenario: Server provides no tools
- **WHEN** an enabled MCP server responds with an empty tool list
- **THEN** that server contributes no tool schemas to the prompt

### Requirement: Tool call routing
The system SHALL route LLM tool calls to the appropriate MCP server.

#### Scenario: Tool call matches MCP server
- **WHEN** the LLM returns a tool_call for `read_file`
- **THEN** the system routes it to the filesystem MCP server and returns the result

#### Scenario: Tool call matches no server
- **WHEN** the LLM returns a tool_call for an unknown tool
- **THEN** the system returns an error to the LLM indicating the tool is unavailable

### Requirement: Tool result forwarding
The system SHALL forward MCP tool results back to the LLM for continued reasoning.

#### Scenario: Tool returns result
- **WHEN** an MCP server returns a tool result
- **THEN** the system appends it to the conversation and sends it back to the LLM

#### Scenario: Tool returns error
- **WHEN** an MCP server returns an error
- **THEN** the system formats the error as a tool result and sends it to the LLM

### Requirement: MCP server status
The system SHALL expose MCP server status via the `/mcp` slash command.

#### Scenario: List MCP servers
- **WHEN** user executes `/mcp`
- **THEN** the system shows all configured servers with their status (enabled/disabled/running)
