import type { Message, Tool, LLMResponse } from "../types/index.js";
import type { Provider } from "../types/index.js";

const MAX_TOOL_CALLS = 10;

export interface AgentLoopCallbacks {
  onToolCall?: (toolName: string, args: Record<string, unknown>) => void;
  onToolResult?: (toolName: string, result: string) => void;
  onResponse?: (content: string) => void;
  onCancel?: () => void;
}

export class AgentLoop {
  private provider: Provider;
  private tools: Tool[];
  private toolExecutor: (call: { id: string; name: string; arguments: Record<string, unknown> }) => Promise<{ content: string; isError?: boolean }>;
  private callbacks: AgentLoopCallbacks;
  private cancelled = false;

  constructor(
    provider: Provider,
    tools: Tool[],
    toolExecutor: (call: { id: string; name: string; arguments: Record<string, unknown> }) => Promise<{ content: string; isError?: boolean }>,
    callbacks: AgentLoopCallbacks = {}
  ) {
    this.provider = provider;
    this.tools = tools;
    this.toolExecutor = toolExecutor;
    this.callbacks = callbacks;
  }

  cancel(): void {
    this.cancelled = true;
  }

  async run(messages: Message[]): Promise<string> {
    this.cancelled = false;
    let toolCallCount = 0;

    while (!this.cancelled) {
      const response: LLMResponse = await this.provider.chat(
        messages,
        this.tools.length > 0 ? this.tools : undefined
      );

      if (response.tool_calls && response.tool_calls.length > 0) {
        if (toolCallCount >= MAX_TOOL_CALLS) {
          return response.content || "Reached maximum tool call limit (10). Please try a simpler approach.";
        }

        messages.push({
          role: "assistant",
          content: response.content,
          tool_calls: response.tool_calls,
        });

        for (const call of response.tool_calls) {
          if (this.cancelled) break;

          toolCallCount++;
          this.callbacks.onToolCall?.(call.name, call.arguments);

          const result = await this.toolExecutor(call);
          this.callbacks.onToolResult?.(call.name, result.content);

          messages.push({
            role: "tool",
            content: result.content,
            tool_call_id: call.id,
          });
        }
      } else {
        this.callbacks.onResponse?.(response.content);
        return response.content;
      }
    }

    this.callbacks.onCancel?.();
    return "Request cancelled.";
  }
}
