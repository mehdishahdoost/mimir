## ADDED Requirements

### Requirement: Skill file discovery
The system SHALL scan `.mimir/skills/` for skill directories containing `SKILL.md` files at startup.

#### Scenario: Skills directory exists with skills
- **WHEN** Mimir starts and `.mimir/skills/` contains subdirectories with `SKILL.md`
- **THEN** the system discovers all valid skill files

#### Scenario: Skills directory is empty
- **WHEN** Mimir starts and `.mimir/skills/` exists but has no subdirectories
- **THEN** the system starts with no skills loaded

#### Scenario: Skills directory does not exist
- **WHEN** Mimir starts and `.mimir/skills/` does not exist
- **THEN** the system creates the directory and starts with no skills

### Requirement: Skill file format
The system SHALL parse skill files as markdown with YAML frontmatter.

#### Scenario: Valid skill file
- **WHEN** a `SKILL.md` file contains valid frontmatter with `name`, `description`, and markdown body
- **THEN** the system parses and stores the skill

#### Scenario: Skill file missing required fields
- **WHEN** a `SKILL.md` file is missing `name` or `description` in frontmatter
- **THEN** the system logs a warning and skips the skill

#### Scenario: Skill file has no frontmatter
- **WHEN** a `SKILL.md` file has no YAML frontmatter block
- **THEN** the system treats the filename as the name and first line as description

### Requirement: Auto-load behavior
The system SHALL automatically load skills marked with `autoLoad: true` in their frontmatter.

#### Scenario: Skill with autoLoad true
- **WHEN** a skill has `autoLoad: true` in frontmatter
- **THEN** its description is included in the system prompt on startup

#### Scenario: Skill with autoLoad false
- **WHEN** a skill has `autoLoad: false` in frontmatter
- **THEN** its description is NOT included in the system prompt unless manually enabled

#### Scenario: AutoLoad defaults to false
- **WHEN** a skill has no `autoLoad` field in frontmatter
- **THEN** the skill is treated as `autoLoad: false`

### Requirement: Runtime skill management
The system SHALL allow users to enable and disable skills at runtime via the `/skills` command.

#### Scenario: List all skills
- **WHEN** user executes `/skills`
- **THEN** the system shows all discovered skills with their status (active/inactive)

#### Scenario: Enable a skill
- **WHEN** user executes `/skills enable git`
- **THEN** the system loads the full skill text and adds it to the active skills list

#### Scenario: Disable a skill
- **WHEN** user executes `/skills disable git`
- **THEN** the system removes the skill from active skills and updates context

#### Scenario: Enable nonexistent skill
- **WHEN** user executes `/skills enable nonexistent`
- **THEN** the system displays an error listing available skills

### Requirement: Skill context injection
The system SHALL inject active skill content into the LLM context when assembling prompts.

#### Scenario: Auto-loaded skill in prompt
- **WHEN** a skill has `autoLoad: true`
- **THEN** its full text is included in the system prompt on every request

#### Scenario: Manually enabled skill in prompt
- **WHEN** a user enables a skill via `/skills enable`
- **THEN** its full text is included in the system prompt from that point forward

#### Scenario: Skill description always available
- **WHEN** any skill exists (auto-loaded or not)
- **THEN** its name and description are always included in the system prompt as available skills

### Requirement: Claude-compatible format
The system SHALL accept skill files in Claude's markdown format.

#### Scenario: Claude-format skill
- **WHEN** a skill file follows Claude's skill format with `name`, `description`, and markdown body
- **THEN** the system parses it successfully without modification
