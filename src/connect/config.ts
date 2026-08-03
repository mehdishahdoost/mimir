import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import type { ConnectorMcpServer } from "./types.js";
import type { CollectedVariable } from "./collector.js";

interface McpServersConfig {
  servers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
    enabled?: boolean;
  }>;
}

export function replacePlaceholders(
  mcpServer: ConnectorMcpServer,
  variables: CollectedVariable[]
): ConnectorMcpServer {
  const result: ConnectorMcpServer = {};

  for (const [serverName, config] of Object.entries(mcpServer)) {
    const newEnv: Record<string, string> = {};

    if (config.env) {
      for (const [key, value] of Object.entries(config.env)) {
        if (typeof value === "string") {
          let replaced = value;
          for (const collected of variables) {
            const placeholder = `__PLACEHOLDER_${collected.variable.id}__`;
            replaced = replaced.replace(placeholder, collected.value);
          }
          newEnv[key] = replaced;
        }
      }
    }

    result[serverName] = {
      command: config.command,
      args: config.args,
      env: Object.keys(newEnv).length > 0 ? newEnv : undefined,
    };
  }

  return result;
}

export function writeMcpConfig(
  projectRoot: string,
  mcpServer: ConnectorMcpServer
): void {
  const configPath = join(projectRoot, ".mimir", "mcp-servers.json");

  let config: McpServersConfig;

  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf-8"));
    } catch {
      config = { servers: {} };
    }
  } else {
    config = { servers: {} };
    const dir = dirname(configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  for (const [serverName, serverConfig] of Object.entries(mcpServer)) {
    config.servers[serverName] = {
      ...serverConfig,
      enabled: true,
    };
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2));
}
