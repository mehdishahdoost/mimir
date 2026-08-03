import type { ConnectorTemplate } from "./types.js";
import type { CollectedVariable } from "./collector.js";
import type { DialogOption } from "../components/Dialog.js";
import { fetchAllTemplates } from "./fetcher.js";
import { promptForVariables } from "./collector.js";
import { runCommands } from "./runner.js";
import { replacePlaceholders, writeMcpConfig } from "./config.js";

export interface ConnectFlowCallbacks {
  onMessage: (text: string) => void;
  onPrompt: (text: string) => void;
  onInput: () => Promise<string>;
  showDialog?: (title: string, options: DialogOption[]) => Promise<number>;
}

export class ConnectFlow {
  private callbacks: ConnectFlowCallbacks;
  private projectRoot: string;
  private templates: ConnectorTemplate[] = [];
  private selectedTemplate: ConnectorTemplate | null = null;
  private collectedVariables: CollectedVariable[] = [];
  private step: "idle" | "select" | "collect" | "execute" | "done" = "idle";
  private resolveInput: ((value: string) => void) | null = null;

  constructor(projectRoot: string, callbacks: ConnectFlowCallbacks) {
    this.projectRoot = projectRoot;
    this.callbacks = callbacks;
  }

  async start(): Promise<void> {
    this.callbacks.onMessage("Fetching connector templates...");

    try {
      this.templates = await fetchAllTemplates();
    } catch (err) {
      this.callbacks.onMessage(`Error: ${(err as Error).message}`);
      return;
    }

    if (this.templates.length === 0) {
      this.callbacks.onMessage("No connector templates available.");
      return;
    }

    if (this.callbacks.showDialog) {
      const options = this.templates.map((t) => ({
        label: t.metadata.name,
        description: t.metadata.description,
      }));
      const index = await this.callbacks.showDialog("Select Connector", options);
      if (index < 0 || index >= this.templates.length) {
        this.callbacks.onMessage("Selection cancelled.");
        this.step = "done";
        return;
      }
      this.selectedTemplate = this.templates[index];
      this.callbacks.onMessage(`Selected: ${this.selectedTemplate.metadata.name}`);
      await this.collectVariables();
      return;
    }

    this.step = "select";
    const list = this.templates
      .map((t, i) => `  ${i + 1}. ${t.metadata.name}: ${t.metadata.description}`)
      .join("\n");
    this.callbacks.onMessage(`Available connectors:\n${list}`);
    this.callbacks.onPrompt("Enter connector number:");
  }

  async handleInput(input: string): Promise<boolean> {
    if (this.step === "select") {
      const index = parseInt(input, 10) - 1;
      if (isNaN(index) || index < 0 || index >= this.templates.length) {
        this.callbacks.onPrompt("Invalid selection. Enter connector number:");
        return true;
      }
      this.selectedTemplate = this.templates[index];
      this.callbacks.onMessage(`Selected: ${this.selectedTemplate.metadata.name}`);
      await this.collectVariables();
      return true;
    }

    if (this.step === "collect") {
      if (this.resolveInput) {
        this.resolveInput(input);
        this.resolveInput = null;
      }
      return true;
    }

    if (this.step === "execute") {
      if (this.resolveInput) {
        this.resolveInput(input);
        this.resolveInput = null;
      }
      return true;
    }

    return false;
  }

  private async collectVariables(): Promise<void> {
    if (!this.selectedTemplate) return;

    const variables = this.selectedTemplate.metadata.variables;
    if (variables.length === 0) {
      await this.executeCommands();
      return;
    }

    this.step = "collect";

    const collector = promptForVariables(
      variables,
      (prompt, hint) => {
        this.callbacks.onMessage(prompt);
        if (hint) {
          this.callbacks.onMessage(hint);
        }
      },
      () => {
        return new Promise<string>((resolve) => {
          this.resolveInput = resolve;
          this.callbacks.onPrompt(">");
        });
      }
    );

    this.collectedVariables = await collector.collect();
    await this.executeCommands();
  }

  private async executeCommands(): Promise<void> {
    if (!this.selectedTemplate) return;

    this.step = "execute";
    const commands = this.selectedTemplate.metadata.commands;

    if (commands.length === 0) {
      await this.writeConfig();
      return;
    }

    this.callbacks.onMessage("Running setup commands...");

    const success = await runCommands(
      commands,
      (text) => this.callbacks.onMessage(text),
      (message) => {
        return new Promise<boolean>((resolve) => {
          this.callbacks.onMessage(message);
          this.callbacks.onPrompt("(Press Enter to continue, or type 'q' to abort):");
          this.resolveInput = (input) => {
            resolve(input.toLowerCase() !== "q");
          };
        });
      }
    );

    if (!success) {
      this.callbacks.onMessage("Setup aborted.");
      this.step = "done";
      return;
    }

    await this.writeConfig();
  }

  private async writeConfig(): Promise<void> {
    if (!this.selectedTemplate) return;

    const mcpConfig = replacePlaceholders(
      this.selectedTemplate["mcp-server"],
      this.collectedVariables
    );

    writeMcpConfig(this.projectRoot, mcpConfig);

    this.callbacks.onMessage(
      `Connector ${this.selectedTemplate.metadata.name} installed and configured successfully!`
    );
    this.step = "done";
  }

  isActive(): boolean {
    return this.step !== "idle" && this.step !== "done";
  }
}
