export interface ParsedCommand {
  command: string;
  args: string[];
  raw: string;
}

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }

  const parts = trimmed.slice(1).split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  return {
    command,
    args,
    raw: trimmed,
  };
}
