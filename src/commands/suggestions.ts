import { commandRegistry, type CommandContext, type CommandMeta } from "./registry.js";

export interface Suggestion {
  text: string;
  description: string;
}

export function getSuggestions(input: string, context: CommandContext): Suggestion[] {
  if (!input.startsWith("/")) {
    return [];
  }

  const parts = input.slice(1).split(/\s+/);
  const commandPart = parts[0] || "";
  const subcommandPart = parts[1] || "";
  const hasTrailingSpace = input.endsWith(" ");
  const argPart = hasTrailingSpace ? "" : parts[parts.length - 1] || "";

  if (!commandPart && !hasTrailingSpace) {
    return commandRegistry.map((cmd) => ({
      text: `/${cmd.name} `,
      description: cmd.description,
    }));
  }

  const matchedCmd = commandRegistry.find((cmd) => cmd.name === commandPart);

  if (!matchedCmd) {
    if (hasTrailingSpace) return [];
    return commandRegistry
      .filter((cmd) => cmd.name.startsWith(commandPart))
      .map((cmd) => ({
        text: `/${cmd.name} `,
        description: cmd.description,
      }));
  }

  if (!hasTrailingSpace && parts.length <= 1) {
    return [
      {
        text: `/${matchedCmd.name} `,
        description: matchedCmd.description,
      },
    ];
  }

  if (matchedCmd.subcommands) {
    if (!subcommandPart && hasTrailingSpace) {
      return matchedCmd.subcommands.map((sub) => ({
        text: `/${matchedCmd.name} ${sub.name} `,
        description: sub.description,
      }));
    }

    const matchedSub = matchedCmd.subcommands.find(
      (sub) => sub.name === subcommandPart
    );

    if (!matchedSub && !hasTrailingSpace) {
      return matchedCmd.subcommands
        .filter((sub) => sub.name.startsWith(subcommandPart))
        .map((sub) => ({
          text: `/${matchedCmd.name} ${sub.name} `,
          description: sub.description,
        }));
    }

    if (matchedSub && matchedSub.dynamicArgs) {
      const dynamicArgs = matchedSub.dynamicArgs(context);
      const prefix = hasTrailingSpace ? "" : parts[parts.length - 1] || "";

      if (!prefix && hasTrailingSpace) {
        return dynamicArgs.map((arg) => ({
          text: `/${matchedCmd.name} ${subcommandPart} ${arg}`,
          description: "",
        }));
      }

      return dynamicArgs
        .filter((arg) => arg.startsWith(prefix))
        .map((arg) => ({
          text: `/${matchedCmd.name} ${subcommandPart} ${arg}`,
          description: "",
        }));
    }

    if (matchedSub && !hasTrailingSpace) {
      return [
        {
          text: `/${matchedCmd.name} ${subcommandPart} `,
          description: matchedSub.description,
        },
      ];
    }
  }

  if (matchedCmd.dynamicArgs && (!matchedCmd.subcommands || hasTrailingSpace)) {
    const dynamicArgs = matchedCmd.dynamicArgs(context);
    const prefix = hasTrailingSpace ? "" : argPart;

    if (!prefix && hasTrailingSpace) {
      return dynamicArgs.map((arg) => ({
        text: `/${matchedCmd.name} ${arg}`,
        description: "",
      }));
    }

    return dynamicArgs
      .filter((arg) => arg.startsWith(prefix))
      .map((arg) => ({
        text: `/${matchedCmd.name} ${arg}`,
        description: "",
      }));
  }

  return [];
}
