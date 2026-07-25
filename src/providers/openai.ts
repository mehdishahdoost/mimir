import OpenAI from "openai";
import type { LLMResponse, Message, Tool } from "../types/index.js";
import { BaseProvider } from "./base.js";

export class OpenAIProvider extends BaseProvider {
  name = "openai";
  private client: OpenAI;

  constructor(apiKey: string, model: string = "gpt-4o") {
    super(apiKey, model);
    this.client = new OpenAI({ apiKey });
  }

  async chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse> {
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      messages.map((m) => {
        if (m.role === "tool") {
          return {
            role: "tool" as const,
            content: m.content,
            tool_call_id: m.tool_call_id!,
          };
        }
        return {
          role: m.role as "system" | "user" | "assistant",
          content: m.content,
        };
      });

    const params: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      model: this.model,
      messages: openaiMessages,
      max_tokens: 4096,
    };

    if (tools && tools.length > 0) {
      params.tools = tools.map((t) => ({
        type: "function" as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.input_schema,
        },
      }));
    }

    const response = await this.client.chat.completions.create(params);
    const choice = response.choices[0];

    let content = choice.message.content || "";
    const toolCalls: LLMResponse["tool_calls"] = [];

    if (choice.message.tool_calls) {
      for (const tc of choice.message.tool_calls) {
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments),
        });
      }
    }

    const stopReason =
      choice.finish_reason === "stop"
        ? "end_turn"
        : choice.finish_reason === "tool_calls"
        ? "tool_use"
        : "max_tokens";

    return {
      content,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      stop_reason: stopReason,
    };
  }
}
