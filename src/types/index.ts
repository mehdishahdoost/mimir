export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  tool_call_id: string;
  content: string;
  isError?: boolean;
}

export interface LLMResponse {
  content: string;
  tool_calls?: ToolCall[];
  stop_reason: "end_turn" | "tool_use" | "max_tokens";
}

export interface Tool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface Provider {
  name: string;
  chat(messages: Message[], tools?: Tool[]): Promise<LLMResponse>;
}

export interface ProviderConfig {
  apiKey: string;
  model?: string;
}

export interface ProvidersConfig {
  default?: string;
  providers: Record<string, ProviderConfig>;
}

export interface Skill {
  name: string;
  description: string;
  autoLoad: boolean;
  content: string;
  path: string;
  active: boolean;
}

export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  enabled?: boolean;
}

export interface MCPServersConfig {
  servers: Record<string, MCPServerConfig>;
}

export interface AgentState {
  activeProvider: string;
  activeSkills: string[];
  conversationHistory: Message[];
}
