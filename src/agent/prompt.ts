import type { Message, Tool } from "../types/index.js";
import type { SkillManager } from "../skills/manager.js";

const BASE_SYSTEM_PROMPT = `You are Mimir, a terminal-native AI assistant. You are helpful, concise, and technical.
You operate in a terminal environment and your responses will be rendered in a monospace font.
Use markdown formatting when appropriate (code blocks, lists, etc.).`;

export function assemblePrompt(
  conversationHistory: Message[],
  skills: SkillManager,
  tools: Tool[]
): Message[] {
  const messages: Message[] = [];

  let systemPrompt = BASE_SYSTEM_PROMPT;

  const skillDescriptions = skills.getSkillDescriptions();
  if (skillDescriptions.length > 0) {
    systemPrompt += "\n\n## Available Skills\n\n" + skillDescriptions.join("\n");
  }

  const activeSkillContent = skills.getActiveSkillContent();
  if (activeSkillContent) {
    systemPrompt += "\n\n## Active Skill Instructions\n\n" + activeSkillContent;
  }

  messages.push({ role: "system", content: systemPrompt });

  for (const msg of conversationHistory) {
    messages.push(msg);
  }

  return messages;
}
