/**
 * Flow Executor
 * Orchestrates the complete attach-mode flow execution
 * Handles backup → attach → run → restore lifecycle
 */

import chalk from 'chalk';
import { ProjectManager } from './project-manager.js';
import { SessionManager } from './session-manager.js';
import { BackupManager } from './backup-manager.js';
import { AttachManager } from './attach-manager.js';
import { SecretsManager } from './secrets-manager.js';
import { CleanupHandler } from './cleanup-handler.js';
import { TemplateLoader } from './template-loader.js';

export interface FlowExecutorOptions {
  verbose?: boolean;
  skipBackup?: boolean;
  skipSecrets?: boolean;
  replace?: boolean; // Replace mode: delete user files before attaching
}

export class FlowExecutor {
  private projectManager: ProjectManager;
  private sessionManager: SessionManager;
  private backupManager: BackupManager;
  private attachManager: AttachManager;
  private secretsManager: SecretsManager;
  private cleanupHandler: CleanupHandler;
  private templateLoader: TemplateLoader;

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
  }

  /**
   * Execute complete flow with attach mode (with multi-session support)
   */
  async execute(
    projectPath: string,
    options: FlowExecutorOptions = {}
  ): Promise<void> {
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
      // Joining existing session
      console.log(chalk.cyan('🔗 Joining existing session...'));

      const { session, isFirstSession } = await this.sessionManager.startSession(
        projectPath,
        projectHash,
        target,
        existingSession.backupPath
      );

      // Register cleanup hooks
      this.cleanupHandler.registerCleanupHooks(projectHash);

      console.log(chalk.green(`   ✓ Joined session (${session.refCount} active session(s))\n`));
      console.log(chalk.green('✓ Flow environment ready!\n'));
      return;
    }

    // First session - create backup and attach
    console.log(chalk.cyan('💾 Creating backup...'));
    const backup = await this.backupManager.createBackup(
      projectPath,
      projectHash,
      target
    );

    // Step 4: Extract and save secrets
    if (!options.skipSecrets) {
      console.log(chalk.cyan('🔐 Extracting secrets...'));
      const secrets = await this.secretsManager.extractMCPSecrets(
        projectPath,
        projectHash,
        target
      );

      if (Object.keys(secrets.servers).length > 0) {
        await this.secretsManager.saveSecrets(projectHash, secrets);
        console.log(
          chalk.green(`   ✓ Saved ${Object.keys(secrets.servers).length} MCP secret(s)`)
        );
      }
    }

    // Step 5: Start session (use backup's sessionId to ensure consistency)
    const { session, isFirstSession } = await this.sessionManager.startSession(
      projectPath,
      projectHash,
      target,
      backup.backupPath,
      backup.sessionId
    );

    // Step 6: Register cleanup hooks
    this.cleanupHandler.registerCleanupHooks(projectHash);

    // Step 7: Replace mode - clear user files before attaching
    if (options.replace) {
      console.log(chalk.cyan('🔄 Replace mode: Clearing existing settings...'));
      await this.clearUserSettings(projectPath, target);
    }

    // Step 8: Load templates
    console.log(chalk.cyan('📦 Loading Flow templates...'));
    const templates = await this.templateLoader.loadTemplates(target);

    // Step 9: Attach Flow environment
    console.log(chalk.cyan('🚀 Attaching Flow environment...'));
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

    // Update manifest with attach results
    await this.backupManager.updateManifest(projectHash, session.sessionId, manifest);

    // Show summary
    this.showAttachSummary(attachResult);

    console.log(chalk.green('\n✓ Flow environment ready!\n'));
  }

  /**
   * Clear user settings in replace mode
   */
  private async clearUserSettings(
    projectPath: string,
    target: 'claude-code' | 'opencode'
  ): Promise<void> {
    const targetDir = this.projectManager.getTargetConfigDir(projectPath, target);
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const { existsSync } = await import('node:fs');

    if (!existsSync(targetDir)) {
      return;
    }

    // Get directory names for this target
    const dirs = target === 'claude-code'
      ? { agents: 'agents', commands: 'commands' }
      : { agents: 'agent', commands: 'command' };

    // Clear agents directory
    const agentsDir = path.join(targetDir, dirs.agents);
    if (existsSync(agentsDir)) {
      const files = await fs.readdir(agentsDir);
      for (const file of files) {
        await fs.unlink(path.join(agentsDir, file));
      }
    }

    // Clear commands directory
    const commandsDir = path.join(targetDir, dirs.commands);
    if (existsSync(commandsDir)) {
      const files = await fs.readdir(commandsDir);
      for (const file of files) {
        await fs.unlink(path.join(commandsDir, file));
      }
    }

    // Clear MCP configuration
    const configPath = target === 'claude-code'
      ? path.join(targetDir, 'settings.json')
      : path.join(targetDir, '.mcp.json');

    if (existsSync(configPath)) {
      // Clear MCP servers section only, keep other settings
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      if (target === 'claude-code') {
        if (config.mcp?.servers) {
          config.mcp.servers = {};
          await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        }
      } else {
        // For opencode, clear the entire .mcp.json
        await fs.writeFile(configPath, JSON.stringify({ servers: {} }, null, 2));
      }
    }

    // Clear hooks directory if exists
    const hooksDir = path.join(targetDir, 'hooks');
    if (existsSync(hooksDir)) {
      const files = await fs.readdir(hooksDir);
      for (const file of files) {
        await fs.unlink(path.join(hooksDir, file));
      }
    }
  }

  /**
   * Cleanup after execution
   */
  async cleanup(projectPath: string): Promise<void> {
    const projectHash = this.projectManager.getProjectHash(projectPath);

    console.log(chalk.cyan('\n🧹 Cleaning up...'));

    await this.cleanupHandler.cleanup(projectHash);

    console.log(chalk.green('   ✓ Environment restored'));
    console.log(chalk.green('   ✓ Secrets preserved for next run\n'));
  }

  /**
   * Show attach summary
   */
  private showAttachSummary(result: any): void {
    const items = [];

    if (result.agentsAdded.length > 0) {
      items.push(
        `${result.agentsAdded.length} agent${result.agentsAdded.length > 1 ? 's' : ''}`
      );
    }

    if (result.commandsAdded.length > 0) {
      items.push(
        `${result.commandsAdded.length} command${result.commandsAdded.length > 1 ? 's' : ''}`
      );
    }

    if (result.mcpServersAdded.length > 0) {
      items.push(
        `${result.mcpServersAdded.length} MCP server${result.mcpServersAdded.length > 1 ? 's' : ''}`
      );
    }

    if (result.hooksAdded.length > 0) {
      items.push(
        `${result.hooksAdded.length} hook${result.hooksAdded.length > 1 ? 's' : ''}`
      );
    }

    if (result.rulesAppended) {
      items.push('rules');
    }

    if (items.length > 0) {
      console.log(chalk.green(`   ✓ Added: ${items.join(', ')}`));
    }

    const overridden = result.agentsOverridden.length +
      result.commandsOverridden.length +
      result.mcpServersOverridden.length +
      result.hooksOverridden.length;

    if (overridden > 0) {
      console.log(chalk.yellow(`   ⚠ Overridden: ${overridden} item${overridden > 1 ? 's' : ''}`));
    }
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
