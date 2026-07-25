import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, basename } from "path";
import type { Skill } from "../types/index.js";

interface SkillFrontmatter {
  name?: string;
  description?: string;
  autoLoad?: boolean;
}

function parseFrontmatter(content: string): { frontmatter: SkillFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const yamlStr = match[1];
  const body = match[2];

  const frontmatter: SkillFrontmatter = {};
  for (const line of yamlStr.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    if (key === "autoLoad") {
      frontmatter.autoLoad = value === "true";
    } else if (key === "name") {
      frontmatter.name = value.replace(/^["']|["']$/g, "");
    } else if (key === "description") {
      frontmatter.description = value.replace(/^["']|["']$/g, "");
    }
  }

  return { frontmatter, body };
}

export class SkillManager {
  private skills: Map<string, Skill> = new Map();
  private skillsDir: string;
  private statePath: string;

  constructor(projectRoot: string) {
    this.skillsDir = join(projectRoot, ".mimir", "skills");
    this.statePath = join(projectRoot, ".mimir", "state.json");
    this.ensureDirectories();
    this.loadActiveState();
  }

  private ensureDirectories(): void {
    if (!existsSync(this.skillsDir)) {
      mkdirSync(this.skillsDir, { recursive: true });
    }
  }

  private loadActiveState(): void {
    if (!existsSync(this.statePath)) return;

    try {
      const state = JSON.parse(readFileSync(this.statePath, "utf-8"));
      if (state.activeSkills) {
        for (const name of state.activeSkills) {
          const skill = this.skills.get(name);
          if (skill) skill.active = true;
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  private saveActiveState(): void {
    const activeSkills = Array.from(this.skills.values())
      .filter((s) => s.active)
      .map((s) => s.name);

    const state = existsSync(this.statePath)
      ? JSON.parse(readFileSync(this.statePath, "utf-8"))
      : {};
    state.activeSkills = activeSkills;

    writeFileSync(this.statePath, JSON.stringify(state, null, 2));
  }

  discover(): void {
    if (!existsSync(this.skillsDir)) return;

    const entries = readdirSync(this.skillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillPath = join(this.skillsDir, entry.name, "SKILL.md");
      if (!existsSync(skillPath)) continue;

      try {
        const raw = readFileSync(skillPath, "utf-8");
        const { frontmatter, body } = parseFrontmatter(raw);

        const name = frontmatter.name || entry.name;
        const description = frontmatter.description || body.split("\n")[0] || name;
        const autoLoad = frontmatter.autoLoad ?? false;

        this.skills.set(name, {
          name,
          description,
          autoLoad,
          content: body,
          path: skillPath,
          active: autoLoad,
        });
      } catch (err) {
        console.warn(`Failed to load skill ${entry.name}: ${(err as Error).message}`);
      }
    }
  }

  getAutoLoadedSkills(): Skill[] {
    return Array.from(this.skills.values()).filter((s) => s.autoLoad);
  }

  getActiveSkills(): Skill[] {
    return Array.from(this.skills.values()).filter((s) => s.active);
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  enableSkill(name: string): boolean {
    const skill = this.skills.get(name);
    if (!skill) return false;
    skill.active = true;
    this.saveActiveState();
    return true;
  }

  disableSkill(name: string): boolean {
    const skill = this.skills.get(name);
    if (!skill) return false;
    skill.active = false;
    this.saveActiveState();
    return true;
  }

  hasSkill(name: string): boolean {
    return this.skills.has(name);
  }

  getSkillDescriptions(): string[] {
    return Array.from(this.skills.values()).map(
      (s) => `- ${s.name}: ${s.description}`
    );
  }

  getActiveSkillContent(): string {
    return this.getActiveSkills()
      .map((s) => `## Skill: ${s.name}\n\n${s.content}`)
      .join("\n\n---\n\n");
  }
}
