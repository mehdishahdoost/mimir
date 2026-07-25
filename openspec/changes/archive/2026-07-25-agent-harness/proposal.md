## Why

Mimir has a terminal UI but no brain. The `handleSubmit` function is a stub with a comment saying "Future: process command or send to AI." We need to connect the UI to an AI API layer and give users extensible skills and tool access through MCP servers. Without this, Mimir is just a pretty terminal prompt.

## What Changes

- Add AI provider abstraction with runtime switching via `/model` command
- Add skill system: markdown files in `.mimir/skills/` with YAML frontmatter, compatible with Claude skill format
- Add MCP server integration: config-driven, per-request lifecycle, tool schemas injected into LLM context
- Add slash command system (`/model`, `/skills`, `/mcp`, `/help`)
- Implement LLM conversation loop with tool-call dispatch
- Add context management: descriptions always loaded, full content on-demand

## Capabilities

### New Capabilities

- `provider-system`: AI provider management — loading provider configs, runtime switching, API key handling
- `skill-system`: Skill file loading, parsing, auto-load vs manual activation, Claude-compatible format support
- `mcp-integration`: MCP server lifecycle (spawn/teardown per request), tool schema injection, tool-call routing
- `command-system`: Slash command parsing, dispatch, and execution
- `agent-loop`: Core LLM conversation loop — prompt assembly, API calls, tool-call handling, response streaming

### Modified Capabilities

(none — this is all new)

## Impact

- **New code**: Agent harness core (provider layer, skill loader, MCP client, command parser, agent loop)
- **Config files**: `.mimir/config.json`, `.mimir/providers.json`, `.mimir/mcp-servers.json`, `.mimir/state.json`
- **Dependencies**: `@modelcontextprotocol/sdk` (MCP client), `@anthropic-ai/sdk` or `openai` (AI API clients)
- **UI changes**: InputBox needs to route slash commands, App needs to display streaming responses, new conversation message components
