import { exec } from "child_process";
import { platform } from "os";
import type { ConnectorVariable } from "./types.js";

export interface CollectedVariable {
  variable: ConnectorVariable;
  value: string;
}

function openUrl(url: string): void {
  const cmd = platform() === "darwin" ? "open" : "xdg-open";
  exec(`${cmd} "${url}"`, (err) => {
    if (err) {
      // Silently fail — URL is still shown as hint
    }
  });
}

export function promptForVariables(
  variables: ConnectorVariable[],
  onPrompt: (prompt: string, hint?: string) => void,
  onInput: () => Promise<string>
): {
  collect: () => Promise<CollectedVariable[]>;
} {
  return {
    collect: async (): Promise<CollectedVariable[]> => {
      const results: CollectedVariable[] = [];

      for (const variable of variables) {
        const hint = variable.url ? `  Hint: ${variable.url}` : undefined;

        if (variable.url) {
          openUrl(variable.url);
        }

        onPrompt(
          `Enter ${variable.name} (${variable.description}):`,
          hint
        );

        const value = await onInput();
        results.push({ variable, value });
      }

      return results;
    },
  };
}
