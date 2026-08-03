import type { ProviderRegistry } from "../providers/registry.js";
import type { SkillManager } from "../skills/manager.js";
import type { MCPManager } from "../mcp/manager.js";

export interface SubcommandMeta {
  name: string;
  description: string;
  dynamicArgs?: (context: CommandContext) => string[];
}

export interface CommandMeta {
  name: string;
  description: string;
  subcommands?: SubcommandMeta[];
  dynamicArgs?: (context: CommandContext) => string[];
}

export interface CommandContext {
  providers: ProviderRegistry;
  skills: SkillManager;
  mcp: MCPManager;
}

export const commandRegistry: CommandMeta[] = [
  {
    name: "help",
    description: "Show help message",
  },
  {
    name: "model",
    description: "Show and switch providers",
    dynamicArgs: (ctx) => ctx.providers.getAvailableProviders(),
  },
  {
    name: "skills",
    description: "List and manage skills",
    subcommands: [
      {
        name: "enable",
        description: "Activate a skill",
        dynamicArgs: (ctx) => ctx.skills.getAllSkills().map((s) => s.name),
      },
      {
        name: "disable",
        description: "Deactivate a skill",
        dynamicArgs: (ctx) => ctx.skills.getAllSkills().map((s) => s.name),
      },
    ],
  },
  {
    name: "mcp",
    description: "Show MCP server status",
  },
  {
    name: "connect",
    description: "Install and configure MCP connectors",
  },
];
