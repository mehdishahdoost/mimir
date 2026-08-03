import type { ConnectorTemplate } from "./types.js";

const REPO_OWNER = "mehdishahdoost";
const REPO_NAME = "mimir-connector-template";
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/`;

interface GitHubFile {
  name: string;
  type: string;
  download_url: string;
}

export async function fetchTemplateList(): Promise<string[]> {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
  }

  const files: GitHubFile[] = await response.json();
  return files
    .filter((f) => f.type === "file" && f.name.endsWith(".json"))
    .map((f) => f.name);
}

export async function fetchTemplate(fileName: string): Promise<ConnectorTemplate> {
  const url = `${RAW_BASE}${fileName}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch template ${fileName}: ${response.status}`);
  }

  const text = await response.text();

  // Template uses <<id>> placeholders which aren't valid JSON.
  // Replace them with placeholder strings so we can parse the structure.
  const sanitized = text.replace(/<<(\d+)>>/g, '"__PLACEHOLDER_$1__"');
  return JSON.parse(sanitized) as ConnectorTemplate;
}

export async function fetchAllTemplates(): Promise<ConnectorTemplate[]> {
  const fileNames = await fetchTemplateList();

  if (fileNames.length === 0) {
    return [];
  }

  const templates = await Promise.all(fileNames.map(fetchTemplate));
  return templates;
}
