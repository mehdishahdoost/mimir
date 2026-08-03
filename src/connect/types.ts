export interface ConnectorVariable {
  id: number;
  name: string;
  description: string;
  url?: string;
}

export interface ConnectorMetadata {
  name: string;
  description: string;
  commands: string[];
  variables: ConnectorVariable[];
}

export interface ConnectorMcpServer {
  [serverName: string]: {
    command: string;
    args: string[];
    env?: Record<string, string>;
  };
}

export interface ConnectorTemplate {
  metadata: ConnectorMetadata;
  "mcp-server": ConnectorMcpServer;
}
