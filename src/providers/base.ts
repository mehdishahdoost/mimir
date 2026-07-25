import type { Provider, LLMResponse, Message, Tool } from "../types/index.js";

export abstract class BaseProvider implements Provider {
  abstract name: string;
  protected apiKey: string;
  protected model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  abstract chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse>;

  protected resolveApiKey(keySource: string): string {
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
}
