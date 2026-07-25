import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { MCPServersConfig, Tool, ToolCall, ToolResult } from "../types/index.js";

const DEFAULT_CONFIG: MCPServersConfig = { servers: {} };

interface RunningServer {
  name: string;
  client: Client;
  transport: StdioClientTransport;
  tools: Tool[];
}

export class MCPManager {
  private config: MCPServersConfig;
  private runningServers: Map<string, RunningServer> = new Map();
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.config = this.loadConfig();
  }

  private loadConfig(): MCPServersConfig {
    const configPath = join(this.projectRoot, ".mimir", "mcp-servers.json");

    if (!existsSync(configPath)) {
      writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return DEFAULT_CONFIG;
    }

    try {
      const raw = readFileSync(configPath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  getEnabledServers(): Record<string, MCPServersConfig["servers"][string]> {
    const enabled: Record<string, MCPServersConfig["servers"][string]> = {};
    for (const [name, config] of Object.entries(this.config.servers)) {
      if (config.enabled !== false) {
        enabled[name] = config;
      }
    }
    return enabled;
  }

  async startAllEnabled(): Promise<void> {
    const enabled = this.getEnabledServers();

    const startPromises = Object.entries(enabled).map(async ([name, config]) => {
      try {
        await this.startServer(name, config);
      } catch (err) {
        console.warn(`Failed to start MCP server ${name}: ${(err as Error).message}`);
      }
    });

    await Promise.all(startPromises);
  }

  private async startServer(
    name: string,
    config: MCPServersConfig["servers"][string]
  ): Promise<void> {
    const env: Record<string, string> = {};
    if (config.env) {
      for (const [key, value] of Object.entries(config.env)) {
        if (value.startsWith("env:")) {
          const envVar = value.slice(4);
          env[key] = process.env[envVar] || "";
        } else {
          env[key] = value;
        }
      }
    }

    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: { ...process.env, ...env } as Record<string, string>,
    });

    const client = new Client(
      { name: "mimir", version: "0.1.0" },
      { capabilities: {} }
    );

    await client.connect(transport);

    const toolsResult = await client.listTools();
    const tools: Tool[] = toolsResult.tools.map((t) => ({
      name: t.name,
      description: t.description || "",
      input_schema: t.inputSchema as Record<string, unknown>,
    }));

    this.runningServers.set(name, { name, client, transport, tools });
  }

  async stopAll(): Promise<void> {
    const stopPromises = Array.from(this.runningServers.values()).map(
      async (server) => {
        try {
          await server.client.close();
        } catch {
          // Ignore close errors
        }
      }
    );

    await Promise.all(stopPromises);
    this.runningServers.clear();
  }

  getAllTools(): Tool[] {
    const tools: Tool[] = [];
    for (const server of this.runningServers.values()) {
      tools.push(...server.tools);
    }
    return tools;
  }

  async executeTool(call: ToolCall): Promise<ToolResult> {
    for (const server of this.runningServers.values()) {
      const tool = server.tools.find((t) => t.name === call.name);
      if (tool) {
        try {
          const result = await server.client.callTool({
            name: call.name,
            arguments: call.arguments,
          });
          return {
            tool_call_id: call.id,
            content: JSON.stringify(result.content),
            isError: result.isError as boolean | undefined,
          };
        } catch (err) {
          return {
            tool_call_id: call.id,
            content: `Error executing tool ${call.name}: ${(err as Error).message}`,
            isError: true,
          };
        }
      }
    }

    return {
      tool_call_id: call.id,
      content: `Tool ${call.name} not found in any MCP server`,
      isError: true,
    };
  }

  getServerStatus(): Array<{ name: string; enabled: boolean; running: boolean; toolCount: number }> {
    const status: Array<{ name: string; enabled: boolean; running: boolean; toolCount: number }> = [];

    for (const [name, config] of Object.entries(this.config.servers)) {
      const running = this.runningServers.has(name);
      status.push({
        name,
        enabled: config.enabled !== false,
        running,
        toolCount: running ? this.runningServers.get(name)!.tools.length : 0,
      });
    }

    return status;
  }
}
