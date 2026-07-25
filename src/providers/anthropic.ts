import Anthropic from "@anthropic-ai/sdk";
import type { LLMResponse, Message, Tool } from "../types/index.js";
import { BaseProvider } from "./base.js";

export class AnthropicProvider extends BaseProvider {
  name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string, model: string = "claude-sonnet-4-20250514") {
    super(apiKey, model);
    this.client = new Anthropic({ apiKey });
  }

  async chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse> {
    const systemMsg = messages.find((m) => m.role === "system");
    const conversationMsgs = messages.filter((m) => m.role !== "system");

    const params: Anthropic.MessageCreateParams = {
      model: this.model,
      max_tokens: 4096,
      messages: conversationMsgs.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    };

    if (systemMsg) {
      params.system = systemMsg.content;
    }

    if (tools && tools.length > 0) {
      params.tools = tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema as Anthropic.Tool["input_schema"],
      }));
    }

    const response = await this.client.messages.create(params);

    let content = "";
    const toolCalls: LLMResponse["tool_calls"] = [];

    for (const block of response.content) {
      if (block.type === "text") {
        content += block.text;
      } else if (block.type === "tool_use") {
        toolCalls!.push({
          id: block.id,
          name: block.name,
          arguments: block.input as Record<string, unknown>,
        });
      }
    }

    return {
      content,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      stop_reason: response.stop_reason === "end_turn" ? "end_turn" : response.stop_reason === "tool_use" ? "tool_use" : "max_tokens",
    };
  }
}
