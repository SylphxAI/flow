/**
 * Template Loader
 * Loads Flow templates from the package assets directory.
 * Runtime targets project these canonical assets into their supported file layout.
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
   * Load all templates for target (parallel loading for performance).
   * Agent identity, standards, and skills come from assets/ as the SSOT.
   */
  async loadTemplates(_target: Target | string): Promise<FlowTemplates> {
    const agentsDir = path.join(this.assetsDir, 'agents');
    const standardsDir = path.join(this.assetsDir, 'standards');
    const skillsDir = path.join(this.assetsDir, 'skills');
    const commandsDir = path.join(this.assetsDir, 'slash-commands');
    const mcpConfigPath = path.join(this.assetsDir, 'mcp-servers.json');

    // Load all directories in parallel
    const [agents, commands, skills, mcpServers, instructions] = await Promise.all([
      existsSync(agentsDir) ? this.loadAgents(agentsDir) : [],
      existsSync(commandsDir) ? this.loadCommands(commandsDir) : [],
      existsSync(skillsDir) ? this.loadSkills(skillsDir) : [],
      existsSync(mcpConfigPath) ? this.loadMCPServers(mcpConfigPath) : [],
      existsSync(standardsDir) ? this.loadStandards(standardsDir) : this.loadLegacyInstructions(),
    ]);

    return {
      agents,
      commands,
      skills,
      instructions,
      mcpServers,
      singleFiles: [],
    };
  }

  /**
   * Load canonical standards as a target instructions document.
   */
  private async loadStandards(standardsDir: string): Promise<string | undefined> {
    const files = await fs.readdir(standardsDir);
    const markdownFiles = files.filter((file) => file.endsWith('.md')).sort();

    if (markdownFiles.length === 0) {
      return undefined;
    }

    const standards = await Promise.all(
      markdownFiles.map(async (file) => {
        const content = await fs.readFile(path.join(standardsDir, file), 'utf-8');
        return `<!-- Source: standards/${file} -->\n\n${content.trim()}`;
      })
    );

    return `# Flow Standards\n\n${standards.join('\n\n---\n\n')}\n`;
  }

  /**
   * Load pre-canonical-asset instructions from possible legacy locations.
   */
  private async loadLegacyInstructions(): Promise<string | undefined> {
    const rulesLocations = [
      path.join(this.assetsDir, 'instructions', 'AGENTS.md'),
      path.join(this.assetsDir, 'AGENTS.md'),
    ];

    for (const instructionsPath of rulesLocations) {
      if (existsSync(instructionsPath)) {
        return fs.readFile(instructionsPath, 'utf-8');
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
   * Check if canonical templates exist.
   */
  async hasTemplates(_target: Target | string): Promise<boolean> {
    const agentsDir = path.join(this.assetsDir, 'agents');
    const skillsDir = path.join(this.assetsDir, 'skills');
    const commandsDir = path.join(this.assetsDir, 'slash-commands');
    return existsSync(agentsDir) || existsSync(skillsDir) || existsSync(commandsDir);
  }
}
