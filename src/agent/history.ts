import type { Message, LLMResponse } from "../types/index.js";
import type { Provider } from "../types/index.js";

export class ConversationHistory {
  private messages: Message[] = [];

  addUserMessage(content: string): void {
    this.messages.push({ role: "user", content });
  }

  addAssistantMessage(content: string, toolCalls?: LLMResponse["tool_calls"]): void {
    this.messages.push({ role: "assistant", content, tool_calls: toolCalls });
  }

  addToolResult(toolCallId: string, content: string, isError?: boolean): void {
    this.messages.push({
      role: "tool",
      content,
      tool_call_id: toolCallId,
    });
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  get length(): number {
    return this.messages.length;
  }
}
