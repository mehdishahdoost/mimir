import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box, useInput, useWindowSize } from "ink";
import { AsciiTitle } from "./components/AsciiTitle.js";
import { InputBox } from "./components/InputBox.js";
import { ModeIndicator } from "./components/ModeIndicator.js";
import { ShortcutBar } from "./components/ShortcutBar.js";
import { ScrollableConversation } from "./components/ScrollableConversation.js";
import { ProviderRegistry } from "./providers/registry.js";
import { SkillManager } from "./skills/manager.js";
import { MCPManager } from "./mcp/manager.js";
import { parseCommand } from "./commands/parser.js";
import { executeCommand } from "./commands/handler.js";
import type { CommandContext } from "./commands/registry.js";
import { assemblePrompt } from "./agent/prompt.js";
import { ConversationHistory } from "./agent/history.js";
import { AgentLoop } from "./agent/loop.js";
import { ConnectFlow } from "./connect/flow.js";
import { Dialog, type DialogOption } from "./components/Dialog.js";

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
  const { rows } = useWindowSize();
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
  const connectFlowRef = useRef<ConnectFlow | null>(null);
  const [connectFlowActive, setConnectFlowActive] = useState(false);
  const [connectPrompt, setConnectPrompt] = useState<string | null>(null);

  const [dialogActive, setDialogActive] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogOptions, setDialogOptions] = useState<DialogOption[]>([]);
  const [dialogSelectedIndex, setDialogSelectedIndex] = useState(0);
  const dialogResolveRef = useRef<((index: number) => void) | null>(null);

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

  const commandContext: CommandContext = { providers, skills, mcp };

  const showDialog = useCallback(
    (title: string, options: DialogOption[]): Promise<number> => {
      return new Promise((resolve) => {
        setDialogTitle(title);
        setDialogOptions(options);
        setDialogSelectedIndex(0);
        setDialogActive(true);
        dialogResolveRef.current = resolve;
      });
    }, []
  );

  const handleDialogSelect = useCallback((index: number) => {
    setDialogActive(false);
    if (dialogResolveRef.current) {
      dialogResolveRef.current(index);
      dialogResolveRef.current = null;
    }
  }, []);

  const handleDialogCancel = useCallback(() => {
    setDialogActive(false);
    if (dialogResolveRef.current) {
      dialogResolveRef.current(-1);
      dialogResolveRef.current = null;
    }
  }, []);

  useInput((_input, key) => {
    if (dialogActive) {
      // Dialog handles its own input via its own useInput hook
      return;
    }
    if (key.escape && isLoading) {
      handleCancel();
    }
  });

  const handleSubmit = useCallback(
    async (value: string) => {
      if (connectFlowRef.current?.isActive()) {
        setConnectPrompt(null);
        const flow = connectFlowRef.current;
        const shouldContinue = await flow.handleInput(value);
        if (!flow.isActive()) {
          connectFlowRef.current = null;
          setConnectFlowActive(false);
          setConnectPrompt(null);
        }
        return;
      }

      const parsed = parseCommand(value);

      if (parsed) {
        if (parsed.command === "model" && parsed.args.length === 0) {
          const current = providers.getActiveProviderName();
          const available = providers.getAvailableProviders();
          const options = available.map((p) => ({
            label: p,
            description: p === current ? "(active)" : undefined,
          }));

          const selectedIndex = await showDialog("Select Provider", options);

          if (selectedIndex >= 0) {
            const selected = available[selectedIndex];
            providers.setActiveProvider(selected);
            setCommandFeedback(`Switched to provider: ${selected}`);
            setTimeout(() => setCommandFeedback(null), 5000);
          }
          return;
        }

        if (parsed.command === "connect") {
          setConnectPrompt(null);
          const flow = new ConnectFlow(projectRoot, {
            onMessage: (text) => {
              setMessages((prev) => [...prev, { role: "assistant", content: text }]);
            },
            onPrompt: (text) => {
              setConnectPrompt(text);
            },
            onInput: () => {
              return new Promise<string>((resolve) => {
                // Input is handled via handleSubmit when connectFlow is active
              });
            },
            showDialog,
          });
          connectFlowRef.current = flow;
          setConnectFlowActive(true);
          await flow.start();
          if (!flow.isActive()) {
            connectFlowRef.current = null;
            setConnectFlowActive(false);
          }
          return;
        }

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
    [providers, skills, mcp, history, projectRoot]
  );

  if (dialogActive) {
    return (
      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
        height="100%"
      >
        <Dialog
          title={dialogTitle}
          options={dialogOptions}
          selectedIndex={dialogSelectedIndex}
          onSelect={handleDialogSelect}
          onCancel={handleDialogCancel}
          onNavigate={setDialogSelectedIndex}
        />
      </Box>
    );
  }

  const appPaddingY = 2;
  const titleHeight = 8;
  const inputAndModeHeight = 7;
  const shortcutHeight = 2;
  const conversationHeight = Math.max(
    3,
    rows - appPaddingY - titleHeight - inputAndModeHeight - shortcutHeight
  );

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      width="100%"
      height="100%"
      paddingX={2}
      paddingY={1}
    >
      <AsciiTitle />
      <Box
        width="100%"
        flexDirection="column"
      >
        <ScrollableConversation
          messages={
            commandFeedback
              ? [...messages, { role: "assistant" as const, content: commandFeedback }]
              : messages
          }
          isLoading={isLoading}
          height={conversationHeight}
        />
        <InputBox
          onSubmit={handleSubmit}
          commandContext={commandContext}
          placeholder={connectPrompt || undefined}
        />
        <ModeIndicator />
      </Box>
      <ShortcutBar />
    </Box>
  );
}
