import { exec as execCb } from "child_process";
import { promisify } from "util";

const execAsync = promisify(execCb);

export interface RunResult {
  command: string;
  success: boolean;
  output: string;
  error?: string;
}

export async function runCommand(
  command: string,
  onOutput: (text: string) => void
): Promise<RunResult> {
  onOutput(`Running: ${command}`);

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000,
      env: { ...process.env },
    });

    const output = stdout.trim();
    if (output) {
      onOutput(output);
    }

    return { command, success: true, output };
  } catch (err) {
    const error = (err as Error).message;
    onOutput(`Failed: ${error}`);
    return { command, success: false, output: "", error };
  }
}

export async function runCommands(
  commands: string[],
  onOutput: (text: string) => void,
  onPromptContinue: (message: string) => Promise<boolean>
): Promise<boolean> {
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    const result = await runCommand(command, onOutput);

    if (!result.success) {
      const shouldContinue = await onPromptContinue(
        `Command failed: ${command}\nContinue? (y/n)`
      );
      if (!shouldContinue) {
        return false;
      }
    } else if (i < commands.length - 1) {
      const shouldContinue = await onPromptContinue(
        "Press Enter to continue..."
      );
      if (!shouldContinue) {
        return false;
      }
    }
  }

  return true;
}
