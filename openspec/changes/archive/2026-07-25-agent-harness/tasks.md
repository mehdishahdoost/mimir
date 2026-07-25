## 1. Setup & Config

- [x] 1.1 Create `.mimir/` directory structure with default config files
- [x] 1.2 Add `@modelcontextprotocol/sdk` and provider SDK dependencies to package.json
- [x] 1.3 Define TypeScript interfaces for Provider, Skill, MCPConfig, and AgentState

## 2. Provider System

- [x] 2.1 Create `providers.json` default config with provider schema
- [x] 2.2 Implement Provider interface and base adapter class
- [x] 2.3 Implement Anthropic provider adapter (messages API, tool_use format)
- [x] 2.4 Implement OpenAI provider adapter (chat completions, function_call format)
- [x] 2.5 Implement provider loading from config with API key resolution (env vars)
- [x] 2.6 Implement provider registry and runtime switching

## 3. Skill System

- [x] 3.1 Create `.mimir/skills/` directory structure
- [x] 3.2 Implement SKILL.md parser (YAML frontmatter + markdown body)
- [x] 3.3 Implement skill discovery — scan `.mimir/skills/*/SKILL.md` at startup
- [x] 3.4 Implement auto-load logic based on `autoLoad` frontmatter field
- [x] 3.5 Implement skill context injection into system prompt
- [x] 3.6 Implement runtime enable/disable with state persistence

## 4. MCP Integration

- [x] 4.1 Create `mcp-servers.json` default config with server schema
- [x] 4.2 Implement MCP server process spawning (child process management)
- [x] 4.3 Implement MCP client initialization and tool schema discovery
- [x] 4.4 Implement tool schema injection into LLM prompt
- [x] 4.5 Implement tool call routing — dispatch LLM tool_calls to MCP servers
- [x] 4.6 Implement MCP server teardown after request completion
- [x] 4.7 Implement `/mcp` command to show server status

## 5. Command System

- [x] 5.1 Implement slash command parser (`/command args` → command + args)
- [x] 5.2 Implement `/help` command — list all available commands
- [x] 5.3 Implement `/model` command — show/switch providers
- [x] 5.4 Implement `/skills` command — list/enable/disable skills
- [x] 5.5 Implement command feedback display in terminal

## 6. Agent Loop

- [x] 6.1 Implement prompt assembler — combine base prompt + skills + tool schemas
- [x] 6.2 Implement conversation history management
- [x] 6.3 Implement LLM request execution via provider adapter
- [x] 6.4 Implement tool-call loop — execute tools, append results, re-call LLM
- [x] 6.5 Implement tool-call limit (10 max per request)
- [x] 6.6 Implement request cancellation (Escape key)
- [x] 6.7 Implement response display in conversation view

## 7. UI Integration

- [x] 7.1 Update InputBox to route slash commands vs normal messages
- [x] 7.2 Add conversation message list component
- [x] 7.3 Update App to display streaming/full responses
- [x] 7.4 Wire up agent loop to UI input/output
