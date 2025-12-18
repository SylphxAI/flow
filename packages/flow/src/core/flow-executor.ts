/**
 * Flow Executor
 * Orchestrates the complete attach-mode flow execution
 * Handles backup → attach → run → restore lifecycle
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import type { Target } from '../types/target.types.js';
import { AttachManager } from './attach-manager.js';
import { BackupManager } from './backup-manager.js';
import { CleanupHandler } from './cleanup-handler.js';
import { GitStashManager } from './git-stash-manager.js';
import { ProjectManager } from './project-manager.js';
import { SecretsManager } from './secrets-manager.js';
import { SessionManager } from './session-manager.js';
import { targetManager } from './target-manager.js';
import { TemplateLoader } from './template-loader.js';

export interface FlowExecutorOptions {
  verbose?: boolean;
  skipBackup?: boolean;
  skipSecrets?: boolean;
  skipProjectDocs?: boolean; // Skip auto-creating PRODUCT.md/ARCHITECTURE.md
  merge?: boolean; // Merge mode: keep user files (default: replace all)
}

export class FlowExecutor {
  private projectManager: ProjectManager;
  private sessionManager: SessionManager;
  private backupManager: BackupManager;
  private attachManager: AttachManager;
  private secretsManager: SecretsManager;
  private cleanupHandler: CleanupHandler;
  private templateLoader: TemplateLoader;
  private gitStashManager: GitStashManager;

  constructor() {
    this.projectManager = new ProjectManager();
    this.sessionManager = new SessionManager(this.projectManager);
    this.backupManager = new BackupManager(this.projectManager);
    this.attachManager = new AttachManager(this.projectManager);
    this.secretsManager = new SecretsManager(this.projectManager);
    this.cleanupHandler = new CleanupHandler(
      this.projectManager,
      this.sessionManager,
      this.backupManager
    );
    this.templateLoader = new TemplateLoader();
    this.gitStashManager = new GitStashManager();
  }

  /**
   * Execute complete flow with attach mode (with multi-session support)
   * Returns summary for caller to display
   */
  async execute(
    projectPath: string,
    options: FlowExecutorOptions = {}
  ): Promise<{
    joined: boolean;
    agents?: number;
    commands?: number;
    skills?: number;
    mcp?: number;
  }> {
    // Initialize Flow directories
    await this.projectManager.initialize();

    // Step 1: Crash recovery on startup
    await this.cleanupHandler.recoverOnStartup();

    // Step 2: Get project hash and paths
    const projectHash = this.projectManager.getProjectHash(projectPath);
    const target = await this.projectManager.detectTarget(projectPath);

    if (options.verbose) {
      console.log(chalk.dim(`Project: ${projectPath}`));
      console.log(chalk.dim(`Hash: ${projectHash}`));
      console.log(chalk.dim(`Target: ${target}\n`));
    }

    // Check for existing session
    const existingSession = await this.sessionManager.getActiveSession(projectHash);

    if (existingSession) {
      // Joining existing session - silent
      await this.sessionManager.startSession(
        projectPath,
        projectHash,
        target,
        existingSession.backupPath
      );
      this.cleanupHandler.registerCleanupHooks(projectHash);
      return { joined: true };
    }

    // First session - optionally create project docs, stash, backup, attach (all silent)
    if (!options.skipProjectDocs) {
      await this.ensureProjectDocs(projectPath);
    }
    await this.gitStashManager.stashSettingsChanges(projectPath);
    const backup = await this.backupManager.createBackup(projectPath, projectHash, target);

    // Extract and save secrets (silent)
    if (!options.skipSecrets) {
      const secrets = await this.secretsManager.extractMCPSecrets(projectPath, projectHash, target);
      if (Object.keys(secrets.servers).length > 0) {
        await this.secretsManager.saveSecrets(projectHash, secrets);
      }
    }

    // Start session
    const { session } = await this.sessionManager.startSession(
      projectPath,
      projectHash,
      target,
      backup.backupPath,
      backup.sessionId
    );

    this.cleanupHandler.registerCleanupHooks(projectHash);

    // Clear and attach (silent)
    if (!options.merge) {
      await this.clearUserSettings(projectPath, target);
    }

    const templates = await this.templateLoader.loadTemplates(target);
    const manifest = await this.backupManager.getManifest(projectHash, session.sessionId);

    if (!manifest) {
      throw new Error('Backup manifest not found');
    }

    const attachResult = await this.attachManager.attach(
      projectPath,
      projectHash,
      target,
      templates,
      manifest
    );

    await this.backupManager.updateManifest(projectHash, session.sessionId, manifest);

    // Return summary for caller to display
    return {
      joined: false,
      agents: attachResult.agentsAdded.length,
      commands: attachResult.commandsAdded.length,
      skills: attachResult.skillsAdded.length,
      mcp: attachResult.mcpServersAdded.length,
    };
  }

  /**
   * Resolve target from ID string to Target object
   */
  private resolveTarget(targetId: string): Target {
    const targetOption = targetManager.getTarget(targetId);
    if (targetOption._tag === 'None') {
      throw new Error(`Unknown target: ${targetId}`);
    }
    return targetOption.value;
  }

  /**
   * Clear user settings in replace mode
   * This ensures a clean slate for Flow's configuration
   */
  private async clearUserSettings(projectPath: string, targetOrId: Target | string): Promise<void> {
    const target = typeof targetOrId === 'string' ? this.resolveTarget(targetOrId) : targetOrId;
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const { existsSync } = await import('node:fs');

    // All paths use target.config.* directly (full paths relative to projectPath)

    // 1. Clear agents directory (including AGENTS.md rules file for Claude Code)
    const agentsDir = path.join(projectPath, target.config.agentDir);
    if (existsSync(agentsDir)) {
      const files = await fs.readdir(agentsDir);
      for (const file of files) {
        await fs.unlink(path.join(agentsDir, file));
      }
    }

    // 2. Clear commands directory (if target supports slash commands)
    if (target.config.slashCommandsDir) {
      const commandsDir = path.join(projectPath, target.config.slashCommandsDir);
      if (existsSync(commandsDir)) {
        const files = await fs.readdir(commandsDir);
        for (const file of files) {
          await fs.unlink(path.join(commandsDir, file));
        }
      }
    }

    // 3. Clear skills directory (if target supports skills)
    if (target.config.skillsDir) {
      const skillsDir = path.join(projectPath, target.config.skillsDir);
      if (existsSync(skillsDir)) {
        await fs.rm(skillsDir, { recursive: true, force: true });
      }
    }

    // 4. Clear hooks directory (in configDir)
    const hooksDir = path.join(projectPath, target.config.configDir, 'hooks');
    if (existsSync(hooksDir)) {
      const files = await fs.readdir(hooksDir);
      for (const file of files) {
        await fs.unlink(path.join(hooksDir, file));
      }
    }

    // 5. Clear MCP configuration using target config
    const configPath = path.join(projectPath, target.config.configFile);
    const mcpPath = target.config.mcpConfigPath;

    if (existsSync(configPath)) {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      if (config[mcpPath]) {
        // Remove entire MCP configuration section
        delete config[mcpPath];
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      }
    }

    // 6. Clear rules file if target has one defined (for targets like OpenCode)
    // Claude Code puts AGENTS.md in agents directory, handled above
    if (target.config.rulesFile) {
      const rulesPath = path.join(projectPath, target.config.rulesFile);
      if (existsSync(rulesPath)) {
        await fs.unlink(rulesPath);
      }
    }

    // 7. Clear single files (output styles) - currently none
    // These would be in the configDir if we had any
    const singleFiles: string[] = [];
    for (const fileName of singleFiles) {
      const filePath = path.join(projectPath, target.config.configDir, fileName);
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
      }
    }

    // 8. Clean up any Flow-created files in project root (legacy bug cleanup)
    // This handles files that were incorrectly created in project root
    const legacySingleFiles = ['silent.md']; // Keep for cleanup of legacy installations
    for (const fileName of legacySingleFiles) {
      const filePath = path.join(projectPath, fileName);
      if (existsSync(filePath)) {
        // Only delete if it looks like a Flow-created file
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          if (content.includes('Sylphx Flow') || content.includes('Silent Execution Style')) {
            await fs.unlink(filePath);
          }
        } catch {
          // Ignore errors - file might not be readable
        }
      }
    }
  }

  /**
   * Ensure PRODUCT.md and ARCHITECTURE.md exist in project root
   * Creates from templates if missing
   */
  private async ensureProjectDocs(projectPath: string): Promise<void> {
    const templatesDir = this.templateLoader.getAssetsDir();
    const templates = [
      { name: 'PRODUCT.md', template: path.join(templatesDir, 'templates', 'PRODUCT.md') },
      {
        name: 'ARCHITECTURE.md',
        template: path.join(templatesDir, 'templates', 'ARCHITECTURE.md'),
      },
    ];

    for (const { name, template } of templates) {
      const targetPath = path.join(projectPath, name);

      // Only create if file doesn't exist and template exists
      if (!existsSync(targetPath) && existsSync(template)) {
        const content = await fs.readFile(template, 'utf-8');
        await fs.writeFile(targetPath, content, 'utf-8');
      }
    }
  }

  /**
   * Cleanup after execution (silent)
   */
  async cleanup(projectPath: string): Promise<void> {
    const projectHash = this.projectManager.getProjectHash(projectPath);
    await this.cleanupHandler.cleanup(projectHash);
    await this.gitStashManager.popSettingsChanges(projectPath);
  }

  /**
   * Get project manager (for external use)
   */
  getProjectManager(): ProjectManager {
    return this.projectManager;
  }

  /**
   * Get session manager (for external use)
   */
  getSessionManager(): SessionManager {
    return this.sessionManager;
  }

  /**
   * Get cleanup handler (for external use)
   */
  getCleanupHandler(): CleanupHandler {
    return this.cleanupHandler;
  }
}
