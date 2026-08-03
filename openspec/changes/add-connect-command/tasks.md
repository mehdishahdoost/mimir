## 1. Template Fetching

- [x] 1.1 Create `src/connect/fetcher.ts` with GitHub API fetch functions
- [x] 1.2 Implement listing `.json` files from repo root via GitHub API
- [x] 1.3 Implement fetching and parsing individual template files
- [x] 1.4 Handle network errors and empty repo gracefully

## 2. Connector Selection

- [x] 2.1 Create `src/connect/types.ts` with ConnectorTemplate interface
- [x] 2.2 Create connector selection UI (reuse or adapt AutocompletePopup)
- [x] 2.3 Auto-select if only one connector exists

## 3. Variable Collection

- [x] 3.1 Create `src/connect/collector.ts` with variable prompt logic
- [x] 3.2 Implement sequential variable prompts in chat view
- [x] 3.3 Open URL in browser when variable has `url` field
- [x] 3.4 Show URL as hint alongside prompt

## 4. Command Execution

- [x] 4.1 Create `src/connect/runner.ts` with command execution logic
- [x] 4.2 Implement sequential command execution with child_process
- [x] 4.3 Show "Press Enter to continue..." after each command
- [x] 4.4 Handle command failures with continue/abort prompt

## 5. Config Generation

- [x] 5.1 Create `src/connect/config.ts` with MCP config writer
- [x] 5.2 Implement `<<id>>` placeholder replacement with collected values
- [x] 5.3 Implement merge with existing `.mimir/mcp-servers.json`
- [x] 5.4 Create file if it doesn't exist

## 6. Command Integration

- [x] 6.1 Register `/connect` in command handler
- [x] 6.2 Wire up the full flow: fetch → select → collect → execute → configure
- [x] 6.3 Add `/connect` to intellisense registry with description
