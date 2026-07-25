import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import type { Provider, ProvidersConfig } from "../types/index.js";
import { AnthropicProvider } from "./anthropic.js";
import { OpenAIProvider } from "./openai.js";

const DEFAULT_CONFIG: ProvidersConfig = {
  default: "anthropic",
  providers: {
    anthropic: { apiKey: "env:ANTHROPIC_API_KEY", model: "claude-sonnet-4-20250514" },
    openai: { apiKey: "env:OPENAI_API_KEY", model: "gpt-4o" },
  },
};

export class ProviderRegistry {
  private providers: Map<string, Provider> = new Map();
  private config: ProvidersConfig;
  private activeProvider: string;
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.config = this.loadConfig();
    this.activeProvider = this.config.default || Object.keys(this.config.providers)[0];
    this.loadProviders();
  }

  private loadConfig(): ProvidersConfig {
    const configPath = join(this.projectRoot, ".mimir", "providers.json");

    if (!existsSync(configPath)) {
      writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
      return DEFAULT_CONFIG;
    }

    try {
      const raw = readFileSync(configPath, "utf-8");
      return JSON.parse(raw);
    } catch {
      console.error("Failed to parse providers.json, using defaults");
      return DEFAULT_CONFIG;
    }
  }

  private resolveApiKey(keySource: string): string {
    if (keySource.startsWith("env:")) {
      const envVar = keySource.slice(4);
      const value = process.env[envVar];
      if (!value) {
        throw new Error(`Environment variable ${envVar} is not set`);
      }
      return value;
    }
    return keySource;
  }

  private loadProviders(): void {
    for (const [name, config] of Object.entries(this.config.providers)) {
      try {
        const apiKey = this.resolveApiKey(config.apiKey);
        const model = config.model;

        switch (name) {
          case "anthropic":
            this.providers.set(name, new AnthropicProvider(apiKey, model));
            break;
          case "openai":
            this.providers.set(name, new OpenAIProvider(apiKey, model));
            break;
          default:
            console.warn(`Unknown provider: ${name}`);
        }
      } catch (err) {
        console.warn(`Failed to load provider ${name}: ${(err as Error).message}`);
      }
    }
  }

  getActiveProvider(): Provider | undefined {
    return this.providers.get(this.activeProvider);
  }

  getActiveProviderName(): string {
    return this.activeProvider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  setActiveProvider(name: string): boolean {
    if (this.providers.has(name)) {
      this.activeProvider = name;
      return true;
    }
    return false;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }
}
