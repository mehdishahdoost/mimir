## Why

Mimir has MCP server support, but users must manually configure `.mimir/mcp-servers.json` with the right command, args, and env vars. This is error-prone and requires knowledge of each server's setup. A `/connect` command lets users browse a catalog of pre-configured connectors, fill in their credentials, and have Mimir handle the installation and configuration automatically.

## What Changes

- Add `/connect` slash command that fetches connector templates from `https://github.com/mehdishahdoost/mimir-connector-template`
- Show available connectors in a selection popup (reusing autocomplete-style UI)
- Collect user-provided variables (API keys, OAuth credentials) one by one with prompts
- Open documentation URLs in the browser when variables have a `url` field
- Run setup commands sequentially (install, auth, start) with "Press Enter when done" for OAuth flows
- Replace `<<id>>` placeholders in the MCP server config with collected variable values
- Write the final MCP server configuration to `.mimir/mcp-servers.json`

## Capabilities

### New Capabilities

- `connect-command`: `/connect` command — template fetching, variable collection, command execution, MCP config generation

### Modified Capabilities

(none)

## Impact

- **New code**: Template fetcher, variable collection prompts, command runner, MCP config writer
- **New component**: Connector selection popup (or reuse AutocompletePopup)
- **UI changes**: Multi-step interactive flow within the command system
- **External dependency**: GitHub API for fetching templates (raw.githubusercontent.com)
