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
   * Load all templates for target (parallel loading for performance)
   * Uses flat assets directory structure (no target-specific subdirectories)
   */
  async loadTemplates(_target: Target | string): Promise<FlowTemplates> {
    const agentsDir = path.join(this.assetsDir, 'agents');
    const commandsDir = path.join(this.assetsDir, 'slash-commands');
    const skillsDir = path.join(this.assetsDir, 'skills');
    const mcpConfigPath = path.join(this.assetsDir, 'mcp-servers.json');

    // Load all directories in parallel
    const [agents, commands, skills, mcpServers, rules] = await Promise.all([
      existsSync(agentsDir) ? this.loadAgents(agentsDir) : [],
      existsSync(commandsDir) ? this.loadCommands(commandsDir) : [],
      existsSync(skillsDir) ? this.loadSkills(skillsDir) : [],
      existsSync(mcpConfigPath) ? this.loadMCPServers(mcpConfigPath) : [],
      this.loadRules(),
    ]);

    return {
      agents,
      commands,
      skills,
      rules,
      mcpServers,
      singleFiles: [],
    };
  }

  /**
   * Load rules from possible locations
   */
  private async loadRules(): Promise<string | undefined> {
    const rulesLocations = [
      path.join(this.assetsDir, 'rules', 'AGENTS.md'),
      path.join(this.assetsDir, 'AGENTS.md'),
    ];

    for (const rulesPath of rulesLocations) {
      if (existsSync(rulesPath)) {
        return fs.readFile(rulesPath, 'utf-8');
      }
    }
    return undefined;
  }

  /**
   * Load agents from directory (parallel file reads)
   */
  private async loadAgents(agentsDir: string): Promise<Array<{ name: string; content: string }>> {
    const files = await fs.readdir(agentsDir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    return Promise.all(
      mdFiles.map(async (file) => ({
        name: file,
        content: await fs.readFile(path.join(agentsDir, file), 'utf-8'),
      }))
    );
  }

  /**
   * Load commands/modes from directory (parallel file reads)
   */
  private async loadCommands(
    commandsDir: string
  ): Promise<Array<{ name: string; content: string }>> {
    const files = await fs.readdir(commandsDir);
    const mdFiles = files.filter((f) => f.endsWith('.md'));

    return Promise.all(
      mdFiles.map(async (file) => ({
        name: file,
        content: await fs.readFile(path.join(commandsDir, file), 'utf-8'),
      }))
    );
  }

  /**
   * Load skills from directory (parallel loading)
   * Skills are stored as <domain>/SKILL.md subdirectories
   */
  private async loadSkills(skillsDir: string): Promise<Array<{ name: string; content: string }>> {
    const domains = await fs.readdir(skillsDir);

    const results = await Promise.all(
      domains.map(async (domain) => {
        const domainPath = path.join(skillsDir, domain);
        const stat = await fs.stat(domainPath);

        if (!stat.isDirectory()) {
          return null;
        }

        const skillFile = path.join(domainPath, 'SKILL.md');
        if (!existsSync(skillFile)) {
          return null;
        }

        const content = await fs.readFile(skillFile, 'utf-8');
        return { name: `${domain}/SKILL.md`, content };
      })
    );

    return results.filter((r): r is { name: string; content: string } => r !== null);
  }

  /**
   * Load MCP servers configuration
   */
  private async loadMCPServers(
    configPath: string
  ): Promise<Array<{ name: string; config: Record<string, unknown> }>> {
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data) as Record<string, Record<string, unknown>>;

    const servers: Array<{ name: string; config: Record<string, unknown> }> = [];
    for (const [name, serverConfig] of Object.entries(config)) {
      servers.push({ name, config: serverConfig });
    }

    return servers;
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
