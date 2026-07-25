## Context

Mimir is a terminal-native AI assistant built with Ink (React for CLI). The UI layer exists — ASCII title, input box, mode indicator, shortcut bar — but the AI integration is a stub. The `handleSubmit` function contains only a comment: "Future: process command or send to AI."

We need to add an agent harness that connects the UI to LLM providers, loads skills, and routes tool calls through MCP servers. The user has a working UI and wants to start having real conversations with the AI.

## Goals / Non-Goals

**Goals:**
- Connect Mimir to multiple AI providers (Anthropic, OpenAI) with runtime switching
- Load skill files from `.mimir/skills/` in markdown format (Claude-compatible)
- Integrate MCP servers for tool access with per-request lifecycle
- Implement a slash command system for user control
- Build an LLM conversation loop with tool-call dispatch

**Non-Goals:**
- Streaming responses (can be added later, start with full responses)
- Multi-user or session persistence (single session for now)
- Custom model fine-tuning
- Authentication/authorization (local tool only)
- Plugin marketplace or distribution system

## Decisions

### 1. Provider abstraction: Interface-based with dynamic loading

**Decision**: Define a `Provider` interface, implement per-provider adapters, load based on config.

```
interface Provider {
  chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse>
  name: string
}
```

**Why**: Allows adding providers without changing core code. Each provider handles its own API quirks (Anthropic tool_use vs OpenAI function_call).

**Alternatives considered**:
- OpenAI-compatible API only: Too limiting, Anthropic has different message format
- SDK-per-provider without abstraction: Tight coupling, harder to swap

### 2. Skill format: Markdown with YAML frontmatter

**Decision**: Skills are `.md` files with frontmatter, compatible with Claude's skill format.

```markdown
---
name: git
description: Git operations and workflows
autoLoad: true
---

# Git Skill

When working with git, follow these conventions...
```

**Why**: De-facto standard, human-readable, Claude-compatible means users can share skills. Auto-load flag controls whether it goes into system prompt by default.

**Alternatives considered**:
- JSON: Less readable, not Claude-compatible
- YAML only: Harder to write instructions in pure YAML
- TOML: Not standard for skills

### 3. MCP lifecycle: Per-request spin-up/teardown

**Decision**: MCP servers spawn when a request comes in, serve tool calls, then terminate.

```
Request → spawn MCP servers → call LLM → handle tool_calls → tear down
```

**Why**: Clean state each time, no resource leaks, no stale connections. Latency (~1-2s) is acceptable for correctness.

**Alternatives considered**:
- Persistent daemon: Faster but risk of state leakage, harder to manage
- Lazy startup with timeout: Complexity for marginal gain

### 4. Context management: Descriptions always, content on-demand

**Decision**: System prompt includes skill descriptions + MCP tool schemas. Full skill text loaded when LLM requests it or user enables it.

```
Always in prompt:
  - Base system prompt
  - Skill descriptions (1-2 lines each)
  - MCP tool schemas (enabled servers only)

On-demand:
  - Full skill text (injected when relevant)
```

**Why**: Balances context budget. Descriptions let LLM know what's available without bloating the prompt. MCP tools need schemas in prompt so LLM can call them.

### 5. Slash commands: Parser-first design

**Decision**: Parse `/command args` before sending to LLM. Commands are handled synchronously, not sent to AI.

```
/model openai    → handled locally
/model           → handled locally
/help            → handled locally
normal message   → sent to LLM
```

**Why**: Commands are user intent, not AI intent. Local handling is instant and reliable.

**Alternatives considered**:
- Let LLM handle slash commands: Unreliable, adds latency
- Hybrid (some local, some AI): Confusing UX

### 6. Agent loop: Tool-call dispatch with MCP routing

**Decision**: Standard LLM tool-call loop with MCP as the tool backend.

```
while (response has tool_calls):
  for each tool_call:
    route to appropriate MCP server
    execute tool
    collect result
  send results back to LLM
return final text response
```

**Why**: Standard pattern, works with all providers, MCP provides the tool abstraction layer.

## Risks / Trade-offs

**[Risk] MCP startup latency** → Each request spawns MCP server processes. Mitigation: Cache server binaries, parallel startup, consider persistent mode as future option.

**[Risk] Skill loading complexity** → Multiple skills with dependencies could conflict. Mitigation: Start with flat skill loading (no dependencies), add skill composition later.

**[Risk] Provider API differences** → Anthropic and OpenAI have different tool-call formats. Mitigation: Abstract differences into provider adapters, test each provider separately.

**[Risk] Context overflow** → Too many skills/tools could exceed model context window. Mitigation: Aggressive description truncation, skill priority system, user controls via `/skills disable`.

**[Trade-off] Per-request MCP vs persistent** → Choosing correctness over speed. Users with many tool calls per conversation will feel the startup cost. Can optimize later.

**[Trade-off] No streaming** → First version returns complete responses. Users may perceive slowness on long responses. Streaming can be added as a follow-up without architectural changes.
