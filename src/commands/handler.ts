import type { ParsedCommand } from "./parser.js";
import type { ProviderRegistry } from "../providers/registry.js";
import type { SkillManager } from "../skills/manager.js";
import type { MCPManager } from "../mcp/manager.js";

export interface CommandResult {
  message: string;
  handled: boolean;
}

type CommandHandler = (
  args: string[],
  context: CommandContext
) => CommandResult | Promise<CommandResult>;

export interface CommandContext {
  providers: ProviderRegistry;
  skills: SkillManager;
  mcp: MCPManager;
}

const commands = new Map<string, CommandHandler>();

function registerCommand(name: string, handler: CommandHandler): void {
  commands.set(name, handler);
}

function helpHandler(
  _args: string[],
  _context: CommandContext
): CommandResult {
  const helpText = [
    "Available commands:",
    "  /help              Show this help message",
    "  /model             Show current provider and available providers",
    "  /model <provider>  Switch to a different provider",
    "  /skills            List all skills and their status",
    "  /skills enable <n> Enable a skill",
    "  /skills disable <n> Disable a skill",
    "  /mcp               Show MCP server status",
  ].join("\n");

  return { message: helpText, handled: true };
}

function modelHandler(
  args: string[],
  context: CommandContext
): CommandResult {
  if (args.length === 0) {
    const current = context.providers.getActiveProviderName();
    const available = context.providers.getAvailableProviders();
    const list = available
      .map((p) => (p === current ? `  * ${p} (active)` : `    ${p}`))
      .join("\n");
    return {
      message: `Current provider: ${current}\n\nAvailable providers:\n${list}`,
      handled: true,
    };
  }

  const target = args[0];
  if (!context.providers.hasProvider(target)) {
    const available = context.providers.getAvailableProviders();
    return {
      message: `Unknown provider: ${target}\nAvailable: ${available.join(", ")}`,
      handled: true,
    };
  }

  context.providers.setActiveProvider(target);
  return {
    message: `Switched to provider: ${target}`,
    handled: true,
  };
}

function skillsHandler(
  args: string[],
  context: CommandContext
): CommandResult {
  if (args.length === 0) {
    const skills = context.skills.getAllSkills();
    if (skills.length === 0) {
      return { message: "No skills found in .mimir/skills/", handled: true };
    }

    const list = skills
      .map((s) => {
        const status = s.active ? "[active]" : "[inactive]";
        const auto = s.autoLoad ? " (auto-load)" : "";
        return `  ${status} ${s.name}: ${s.description}${auto}`;
      })
      .join("\n");

    return { message: `Skills:\n${list}`, handled: true };
  }

  const subcommand = args[0];
  const skillName = args[1];

  if (!skillName) {
    return {
      message: `Usage: /skills <enable|disable> <skill-name>`,
      handled: true,
    };
  }

  if (subcommand === "enable") {
    if (context.skills.enableSkill(skillName)) {
      return { message: `Enabled skill: ${skillName}`, handled: true };
    }
    return {
      message: `Unknown skill: ${skillName}\nUse /skills to list available skills`,
      handled: true,
    };
  }

  if (subcommand === "disable") {
    if (context.skills.disableSkill(skillName)) {
      return { message: `Disabled skill: ${skillName}`, handled: true };
    }
    return {
      message: `Unknown skill: ${skillName}\nUse /skills to list available skills`,
      handled: true,
    };
  }

  return {
    message: `Unknown subcommand: ${subcommand}\nUsage: /skills <enable|disable> <skill-name>`,
    handled: true,
  };
}

function mcpHandler(
  _args: string[],
  context: CommandContext
): CommandResult {
  const status = context.mcp.getServerStatus();
  if (status.length === 0) {
    return { message: "No MCP servers configured in .mimir/mcp-servers.json", handled: true };
  }

  const list = status
    .map((s) => {
      const state = s.running ? "[running]" : s.enabled ? "[enabled]" : "[disabled]";
      return `  ${state} ${s.name}: ${s.toolCount} tools`;
    })
    .join("\n");

  return { message: `MCP Servers:\n${list}`, handled: true };
}

function connectHandler(
  _args: string[],
  _context: CommandContext
): CommandResult {
  return {
    message: "__CONNECT_FLOW__",
    handled: true,
  };
}

registerCommand("help", helpHandler);
registerCommand("model", modelHandler);
registerCommand("skills", skillsHandler);
registerCommand("mcp", mcpHandler);
registerCommand("connect", connectHandler);

export async function executeCommand(
  parsed: ParsedCommand,
  context: CommandContext
): Promise<CommandResult> {
  const handler = commands.get(parsed.command);
  if (!handler) {
    return {
      message: `Unknown command: /${parsed.command}\nType /help for available commands`,
      handled: true,
    };
  }

  return handler(parsed.args, context);
}
