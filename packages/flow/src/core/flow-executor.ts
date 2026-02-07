/**
 * Flow Executor
 * Orchestrates the complete attach-mode flow execution
 * Handles backup → attach → run → restore lifecycle
 */

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import createDebug from 'debug';
import type { Target } from '../types/target.types.js';

const debug = createDebug('flow:executor');

import { AttachManager } from './attach-manager.js';
import { BackupManager } from './backup-manager.js';
import { CleanupHandler } from './cleanup-handler.js';
import { GitStashManager } from './git-stash-manager.js';
import { ProjectManager } from './project-manager.js';
import { SecretsManager } from './secrets-manager.js';
import { SessionManager } from './session-manager.js';
import { resolveTargetOrId } from './target-resolver.js';
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
    this.attachManager = new AttachManager();
    this.secretsManager = new SecretsManager(this.projectManager);
    this.templateLoader = new TemplateLoader();
    this.gitStashManager = new GitStashManager();
    this.cleanupHandler = new CleanupHandler(
      this.projectManager,
      this.sessionManager,
      this.backupManager,
      this.gitStashManager,
      this.secretsManager
    );
  }

  /**
   * Try to join an existing session. Returns summary if joined, null otherwise.
   */
  private async tryJoinExistingSession(
    projectPath: string,
    projectHash: string,
    target: string,
    verbose?: boolean
  ): Promise<{ joined: true } | null> {
    const existingSession = await this.sessionManager.getActiveSession(projectHash);
    if (!existingSession) {
      return null;
    }

    const targetObj = resolveTargetOrId(target);
    const agentsDir = path.join(projectPath, targetObj.config.agentDir);
    const filesExist = existsSync(agentsDir) && (await fs.readdir(agentsDir)).length > 0;

    if (filesExist) {
      await this.sessionManager.startSession(
        projectPath,
        projectHash,
        target,
        existingSession.backupPath
      );
      this.cleanupHandler.registerCleanupHooks(projectHash);
      return { joined: true };
    }

    if (verbose) {
      console.log(chalk.dim('Session files missing, re-attaching...'));
    }
    await this.sessionManager.endSession(projectHash);
    return null;
  }

  /**
   * Create a new session: backup, extract secrets, attach templates
   */
  private async createNewSession(
    projectPath: string,
    projectHash: string,
    target: string,
    options: FlowExecutorOptions
  ): Promise<{
    agents: number;
    commands: number;
    skills: number;
    mcp: number;
  }> {
    // Run independent setup steps in parallel
    await Promise.all([
      options.skipProjectDocs ? Promise.resolve() : this.ensureProjectDocs(projectPath),
      this.gitStashManager.stashSettingsChanges(projectPath),
    ]);

    // Backup and extract secrets in parallel
    const [backup] = await Promise.all([
      this.backupManager.createBackup(projectPath, projectHash, target),
      options.skipSecrets
        ? Promise.resolve()
        : this.secretsManager
            .extractMCPSecrets(projectPath, projectHash, target)
            .then((secrets) => {
              if (Object.keys(secrets.servers).length > 0) {
                return this.secretsManager.saveSecrets(projectHash, secrets);
              }
            }),
    ]);

    const { session } = await this.sessionManager.startSession(
      projectPath,
      projectHash,
      target,
      backup.backupPath,
      backup.sessionId
    );

    this.cleanupHandler.registerCleanupHooks(projectHash);

    if (!options.merge) {
      await this.clearUserSettings(projectPath, target);
    }

    const templates = await this.templateLoader.loadTemplates(target);
    const manifest = await this.backupManager.getManifest(projectHash, session.sessionId);

    if (!manifest) {
      throw new Error('Backup manifest not found');
    }

    const attachResult = await this.attachManager.attach(projectPath, target, templates, manifest);

    // Apply target-specific settings (non-fatal)
    const targetObj = resolveTargetOrId(target);
    if (targetObj.applySettings) {
      try {
        await targetObj.applySettings(projectPath, {});
      } catch (error) {
        debug('applySettings failed:', error);
      }
    }

    await this.backupManager.updateManifest(projectHash, session.sessionId, manifest);

    return {
      agents: attachResult.agentsAdded.length,
      commands: attachResult.commandsAdded.length,
      skills: attachResult.skillsAdded.length,
      mcp: attachResult.mcpServersAdded.length,
    };
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
    await this.projectManager.initialize();
    await this.cleanupHandler.recoverOnStartup();

    const projectHash = this.projectManager.getProjectHash(projectPath);
    const target = await this.projectManager.detectTarget(projectPath);

    if (options.verbose) {
      console.log(chalk.dim(`Project: ${projectPath}`));
      console.log(chalk.dim(`Hash: ${projectHash}`));
      console.log(chalk.dim(`Target: ${target}\n`));
    }

    const joinResult = await this.tryJoinExistingSession(
      projectPath,
      projectHash,
      target,
      options.verbose
    );
    if (joinResult) {
      return joinResult;
    }

    const result = await this.createNewSession(projectPath, projectHash, target, options);
    return { joined: false, ...result };
  }

  /**
   * Clear user settings in replace mode
   * This ensures a clean slate for Flow's configuration
   */
  private async clearUserSettings(projectPath: string, targetOrId: Target | string): Promise<void> {
    const target = resolveTargetOrId(targetOrId);

    // All paths use target.config.* directly (full paths relative to projectPath)

    // Clear directories in parallel — each is independent
    const clearDirFiles = async (dir: string) => {
      if (!existsSync(dir)) {
        return;
      }
      const files = await fs.readdir(dir);
      await Promise.all(files.map((file) => fs.unlink(path.join(dir, file))));
    };

    const clearOps: Promise<void>[] = [];

    // 1. Clear agents directory (including AGENTS.md rules file for Claude Code)
    clearOps.push(clearDirFiles(path.join(projectPath, target.config.agentDir)));

    // 2. Clear commands directory (if target supports slash commands)
    if (target.config.slashCommandsDir) {
      clearOps.push(clearDirFiles(path.join(projectPath, target.config.slashCommandsDir)));
    }

    // 3. Clear skills directory (if target supports skills)
    if (target.config.skillsDir) {
      const skillsDir = path.join(projectPath, target.config.skillsDir);
      if (existsSync(skillsDir)) {
        clearOps.push(fs.rm(skillsDir, { recursive: true, force: true }));
      }
    }

    // 4. Clear hooks directory (in configDir)
    clearOps.push(clearDirFiles(path.join(projectPath, target.config.configDir, 'hooks')));

    await Promise.all(clearOps);

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

    // 7. Clean up any Flow-created files in project root (legacy bug cleanup)
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
        } catch (error) {
          debug('failed to clean legacy file %s: %O', fileName, error);
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
