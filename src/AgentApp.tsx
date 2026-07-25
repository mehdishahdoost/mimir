import React, { useState, useCallback, useEffect } from "react";
import { Box, useInput } from "ink";
import { AsciiTitle } from "./components/AsciiTitle.js";
import { InputBox } from "./components/InputBox.js";
import { ModeIndicator } from "./components/ModeIndicator.js";
import { ShortcutBar } from "./components/ShortcutBar.js";
import { MessageList } from "./components/MessageList.js";
import { ProviderRegistry } from "./providers/registry.js";
import { SkillManager } from "./skills/manager.js";
import { MCPManager } from "./mcp/manager.js";
import { parseCommand } from "./commands/parser.js";
import { executeCommand } from "./commands/handler.js";
import { assemblePrompt } from "./agent/prompt.js";
import { ConversationHistory } from "./agent/history.js";
import { AgentLoop } from "./agent/loop.js";

const ORANGE = "#e85d3b";
const GRAY = "#6b6b6b";

interface AppMessage {
  role: "user" | "assistant";
  content: string;
}

function getProjectRoot(): string {
  return process.cwd();
}

export function AgentApp() {
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);

  const projectRoot = getProjectRoot();
  const [providers] = useState(() => new ProviderRegistry(projectRoot));
  const [skills] = useState(() => {
    const mgr = new SkillManager(projectRoot);
    mgr.discover();
    return mgr;
  });
  const [mcp] = useState(() => new MCPManager(projectRoot));
  const [history] = useState(() => new ConversationHistory());
  const [agentLoop, setAgentLoop] = useState<AgentLoop | null>(null);

  useEffect(() => {
    return () => {
      mcp.stopAll();
    };
  }, [mcp]);

  const handleCancel = useCallback(() => {
    if (agentLoop) {
      agentLoop.cancel();
      setAgentLoop(null);
      setIsLoading(false);
      setCommandFeedback("Request cancelled.");
    }
  }, [agentLoop]);

  useInput((_input, key) => {
    if (key.escape && isLoading) {
      handleCancel();
    }
  });

  const handleSubmit = useCallback(
    async (value: string) => {
      const parsed = parseCommand(value);

      if (parsed) {
        const context = { providers, skills, mcp };
        const result = await executeCommand(parsed, context);
        setCommandFeedback(result.message);
        setTimeout(() => setCommandFeedback(null), 5000);
        return;
      }

      setCommandFeedback(null);
      setMessages((prev) => [...prev, { role: "user", content: value }]);
      history.addUserMessage(value);
      setIsLoading(true);

      const provider = providers.getActiveProvider();
      if (!provider) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "No provider configured. Use /model to set one up.",
          },
        ]);
        setIsLoading(false);
        return;
      }

      try {
        await mcp.startAllEnabled();
        const tools = mcp.getAllTools();
        const toolExecutor = async (call: { id: string; name: string; arguments: Record<string, unknown> }) => {
          return mcp.executeTool(call);
        };

        const loop = new AgentLoop(provider, tools, toolExecutor, {
          onResponse: (content) => {
            setMessages((prev) => [...prev, { role: "assistant", content }]);
            history.addAssistantMessage(content);
          },
        });
        setAgentLoop(loop);

        const promptMessages = assemblePrompt(history.getMessages(), skills, tools);
        await loop.run(promptMessages);
      } catch (err) {
        const errorMsg = `Error: ${(err as Error).message}`;
        setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
      } finally {
        setIsLoading(false);
        setAgentLoop(null);
        await mcp.stopAll();
      }
    },
    [providers, skills, mcp, history]
  );

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
      padding={2}
    >
      <AsciiTitle />
      <Box
        width="100%"
        maxWidth={60}
        marginTop={2}
        flexDirection="column"
      >
        {messages.length > 0 && (
          <Box marginBottom={1}>
            <MessageList messages={messages} isLoading={isLoading} />
          </Box>
        )}
        {commandFeedback && (
          <Box marginBottom={1}>
            <MessageList messages={[{ role: "assistant", content: commandFeedback }]} />
          </Box>
        )}
        <InputBox onSubmit={handleSubmit} />
        <ModeIndicator />
      </Box>
      <ShortcutBar />
    </Box>
  );
}
