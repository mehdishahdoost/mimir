## Context

Mimir has MCP server support configured via `.mimir/mcp-servers.json`. Users must manually write JSON config with the right command, args, and env vars. Connector templates on GitHub define a standard format for MCP server setup including metadata, variables, commands, and the final MCP config block.

Template format (from `mehdishahdoost/mimir-connector-template`):
```json
{
  "metadata": {
    "name": "mimir-gmail",
    "description": "Gmail MCP server",
    "commands": ["npm i mimir-gmail", "npx mimir-gmail auth", "npx mimir-gmail"],
    "variables": [
      { "id": 1, "name": "GOOGLE_OAUTH_CLIENT_ID", "description": "your client Id", "url": "https://console.cloud.google.com/" }
    ]
  },
  "mcp-server": {
    "gmail": {
      "command": "npx",
      "args": ["mimir-gmail"],
      "env": { "GOOGLE_OAUTH_CLIENT_ID": "<<1>>" }
    }
  }
}
```

## Goals / Non-Goals

**Goals:**
- Fetch templates live from GitHub on `/connect`
- Show connector list for user selection
- Collect variables interactively (one prompt per variable)
- Open `url` in browser and show as hint when prompting for variable values
- Run `metadata.commands` sequentially, pausing with "Press Enter when done" for each
- Replace `<<id>>` placeholders in `mcp-server` with collected values
- Write final MCP config to `.mimir/mcp-servers.json`

**Non-Goals:**
- Multiple template repos (hardcoded to `mehdishahdoost/mimir-connector-template`)
- Template caching / offline mode
- Uninstall or update connectors
- Template validation or versioning

## Decisions

### 1. Template fetching: Live HTTP

**Decision**: Fetch template list and individual templates via raw GitHub API on every `/connect`.

**Why**: Always current, no cache invalidation complexity. Network dependency is acceptable for a tool that already calls AI APIs.

**Endpoint**: `https://api.github.com/repos/mehdishahdoost/mimir-connector-template/contents/` to list files, then raw URLs for each `.json` file.

### 2. Interactive flow: Sequential prompts in command output

**Decision**: The connect flow runs as a series of messages in the chat view — not a separate modal. Each step prints its prompt, user types the value, next step prints.

```
> Connecting to mimir-gmail...
> Enter GOOGLE_OAUTH_CLIENT_ID (your client Id):
>   Hint: https://console.cloud.google.com/
> [user types value]
> Enter GOOGLE_OAUTH_CLIENT_SECRET (Your client secret):
> ...
```

**Why**: Fits the terminal-native model. No special UI components needed. Reuses the existing message list.

### 3. Browser opening: `open` command

**Decision**: Use `child_process.exec('open <url>')` on macOS / `xdg-open` on Linux.

**Why**: Standard approach. If it fails (headless server), the URL is still shown as text hint.

### 4. Command execution: Sequential with Enter prompt

**Decision**: Run each command in `metadata.commands` sequentially. After each command, show "Press Enter to continue..." prompt. For OAuth commands that open browser, this gives user time to complete the flow.

**Why**: Some commands require user interaction (OAuth callback). Fixed delay wouldn't work. User controls the pace.

### 5. Config merging: Append to existing

**Decision**: Read existing `.mimir/mcp-servers.json`, merge the new server entry, write back. Don't overwrite existing servers.

**Why**: Users may have manually configured servers. Preserves existing config.

### 6. Template discovery: List .json files in repo root

**Decision**: Use GitHub API to list files in repo root, filter for `.json` files, fetch each.

**Why**: Simple, no subdirectory scanning needed. Each file = one template.

## Risks / Trade-offs

**[Risk] GitHub API rate limiting** → Unauthenticated requests limited to 60/hour. Mitigation: Acceptable for interactive use. Could add optional token later.

**[Risk] Template format changes** → Breaking changes to template format could break the parser. Mitigation: Template format is under our control (our repo). Version field can be added later.

**[Risk] Network failure** → If GitHub is unreachable, `/connect` fails completely. Mitigation: Show clear error message. Could add retry.

**[Trade-off] Live fetch vs cache** → Always fresh but requires network. Acceptable for this use case.
