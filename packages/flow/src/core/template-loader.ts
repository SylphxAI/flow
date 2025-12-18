/**
 * Template Loader
 * Loads Flow templates from assets directory
 * Supports any target with consistent template structure
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Target } from '../types/target.types.js';
import type { FlowTemplates } from './attach-manager.js';

export class TemplateLoader {
  private assetsDir: string;

  constructor() {
    // Get assets directory relative to this file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    this.assetsDir = path.join(__dirname, '..', '..', 'assets');
  }

  /**
   * Load all templates for target
   * Uses flat assets directory structure (no target-specific subdirectories)
   */
  async loadTemplates(_target: Target | string): Promise<FlowTemplates> {
    const templates: FlowTemplates = {
      agents: [],
      commands: [],
      skills: [],
      rules: undefined,
      mcpServers: [],
      hooks: [],
      singleFiles: [],
    };

    // Load agents
    const agentsDir = path.join(this.assetsDir, 'agents');
    if (existsSync(agentsDir)) {
      templates.agents = await this.loadAgents(agentsDir);
    }

    // Load commands (slash-commands directory)
    const commandsDir = path.join(this.assetsDir, 'slash-commands');
    if (existsSync(commandsDir)) {
      templates.commands = await this.loadCommands(commandsDir);
    }

    // Load skills (skills/<domain>/SKILL.md structure)
    const skillsDir = path.join(this.assetsDir, 'skills');
    if (existsSync(skillsDir)) {
      templates.skills = await this.loadSkills(skillsDir);
    }

    // Load rules (check multiple possible locations)
    const rulesLocations = [
      path.join(this.assetsDir, 'rules', 'AGENTS.md'),
      path.join(this.assetsDir, 'AGENTS.md'),
    ];

    for (const rulesPath of rulesLocations) {
      if (existsSync(rulesPath)) {
        templates.rules = await fs.readFile(rulesPath, 'utf-8');
        break;
      }
    }

    // Load MCP servers (if any)
    const mcpConfigPath = path.join(this.assetsDir, 'mcp-servers.json');
    if (existsSync(mcpConfigPath)) {
      templates.mcpServers = await this.loadMCPServers(mcpConfigPath);
    }

    // Load output styles (single files)
    const outputStylesDir = path.join(this.assetsDir, 'output-styles');
    if (existsSync(outputStylesDir)) {
      templates.singleFiles = await this.loadSingleFiles(outputStylesDir);
    }

    return templates;
  }

  /**
   * Load agents from directory
   */
  private async loadAgents(agentsDir: string): Promise<Array<{ name: string; content: string }>> {
    const agents = [];
    const files = await fs.readdir(agentsDir);

    for (const file of files) {
      if (!file.endsWith('.md')) {
        continue;
      }

      const content = await fs.readFile(path.join(agentsDir, file), 'utf-8');
      agents.push({ name: file, content });
    }

    return agents;
  }

  /**
   * Load commands/modes from directory
   */
  private async loadCommands(
    commandsDir: string
  ): Promise<Array<{ name: string; content: string }>> {
    const commands = [];
    const files = await fs.readdir(commandsDir);

    for (const file of files) {
      if (!file.endsWith('.md')) {
        continue;
      }

      const content = await fs.readFile(path.join(commandsDir, file), 'utf-8');
      commands.push({ name: file, content });
    }

    return commands;
  }

  /**
   * Load skills from directory
   * Skills are stored as <domain>/SKILL.md subdirectories
   */
  private async loadSkills(skillsDir: string): Promise<Array<{ name: string; content: string }>> {
    const skills = [];
    const domains = await fs.readdir(skillsDir);

    for (const domain of domains) {
      const domainPath = path.join(skillsDir, domain);
      const stat = await fs.stat(domainPath);

      if (!stat.isDirectory()) {
        continue;
      }

      // Look for SKILL.md in each domain directory
      const skillFile = path.join(domainPath, 'SKILL.md');
      if (existsSync(skillFile)) {
        const content = await fs.readFile(skillFile, 'utf-8');
        // Name includes subdirectory: "auth/SKILL.md"
        skills.push({ name: `${domain}/SKILL.md`, content });
      }
    }

    return skills;
  }

  /**
   * Load MCP servers configuration
   */
  private async loadMCPServers(configPath: string): Promise<Array<{ name: string; config: any }>> {
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data);

    const servers = [];
    for (const [name, serverConfig] of Object.entries(config)) {
      servers.push({ name, config: serverConfig });
    }

    return servers;
  }

  /**
   * Load single files (CLAUDE.md, .cursorrules, etc.)
   */
  private async loadSingleFiles(
    singleFilesDir: string
  ): Promise<Array<{ path: string; content: string }>> {
    const files = [];
    const entries = await fs.readdir(singleFilesDir);

    for (const entry of entries) {
      const filePath = path.join(singleFilesDir, entry);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        const content = await fs.readFile(filePath, 'utf-8');
        files.push({ path: entry, content });
      }
    }

    return files;
  }

  /**
   * Get assets directory path
   */
  getAssetsDir(): string {
    return this.assetsDir;
  }

  /**
   * Check if templates exist (uses flat directory structure)
   */
  async hasTemplates(_target: Target | string): Promise<boolean> {
    // Check if any template directories exist
    const agentsDir = path.join(this.assetsDir, 'agents');
    const commandsDir = path.join(this.assetsDir, 'slash-commands');
    return existsSync(agentsDir) || existsSync(commandsDir);
  }
}
