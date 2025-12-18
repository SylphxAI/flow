/**
 * Integration tests for backup → attach → restore lifecycle
 * Tests the complete flow of:
 * 1. Creating backup of existing config
 * 2. Attaching Flow templates
 * 3. Restoring original config on cleanup
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AttachManager } from '../attach-manager.js';
import { BackupManager } from '../backup-manager.js';
import { ProjectManager } from '../project-manager.js';
import { targetManager } from '../target-manager.js';

describe('Backup → Attach → Restore Lifecycle', () => {
  let tempDir: string;
  let projectManager: ProjectManager;
  let backupManager: BackupManager;
  let attachManager: AttachManager;
  let projectPath: string;
  let projectHash: string;

  // Get Claude Code target for tests
  const getClaudeTarget = () => {
    const targetOption = targetManager.getTarget('claude-code');
    if (targetOption._tag === 'None') {
      throw new Error('Claude Code target not found');
    }
    return targetOption.value;
  };

  beforeEach(async () => {
    // Create temp directories
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-test-'));
    projectPath = path.join(tempDir, 'test-project');
    fs.mkdirSync(projectPath, { recursive: true });

    // Initialize managers
    projectManager = new ProjectManager();

    // Override Flow data directory to use temp
    const flowDataDir = path.join(tempDir, '.sylphx-flow');
    fs.mkdirSync(flowDataDir, { recursive: true });
    (projectManager as any).flowDataDir = flowDataDir;

    backupManager = new BackupManager(projectManager);
    attachManager = new AttachManager(projectManager);

    // Get project hash
    projectHash = projectManager.getProjectHash(projectPath);
  });

  afterEach(async () => {
    // Cleanup temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Empty project (no existing config)', () => {
    it('should create backup with empty manifest', async () => {
      const target = getClaudeTarget();
      const backup = await backupManager.createBackup(projectPath, projectHash, target);

      expect(backup.sessionId).toMatch(/^session-\d+$/);
      expect(backup.projectPath).toBe(projectPath);
      expect(backup.target).toBe('claude-code');
      expect(fs.existsSync(backup.backupPath)).toBe(true);

      // Check manifest exists
      const manifest = await backupManager.getManifest(projectHash, backup.sessionId);
      expect(manifest).not.toBeNull();
      expect(manifest?.backup.agents.user).toEqual([]);
      expect(manifest?.backup.agents.flow).toEqual([]);
    });

    it('should restore to empty state after attach', async () => {
      const target = getClaudeTarget();
      const backup = await backupManager.createBackup(projectPath, projectHash, target);

      // Simulate attach by creating .claude directory
      const claudeDir = path.join(projectPath, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), '{"mcpServers":{}}');

      // Verify .claude exists after "attach"
      expect(fs.existsSync(claudeDir)).toBe(true);

      // Restore
      await backupManager.restoreBackup(projectHash, backup.sessionId);

      // .claude should be removed (back to empty state)
      expect(fs.existsSync(claudeDir)).toBe(false);
    });
  });

  describe('Project with existing config', () => {
    const existingConfig = {
      mcpServers: {
        'my-server': {
          command: 'my-cmd',
          args: ['--flag'],
        },
      },
    };

    beforeEach(() => {
      // Create existing .claude config
      const claudeDir = path.join(projectPath, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), JSON.stringify(existingConfig));

      // Create existing agent file
      const agentsDir = path.join(claudeDir, 'agents');
      fs.mkdirSync(agentsDir, { recursive: true });
      fs.writeFileSync(path.join(agentsDir, 'my-agent.md'), '# My Custom Agent\n\nMy custom prompt.');
    });

    it('should backup existing config', async () => {
      const target = getClaudeTarget();
      const backup = await backupManager.createBackup(projectPath, projectHash, target);

      // Check backup directory has .claude
      const backupClaudeDir = path.join(backup.backupPath, '.claude');
      expect(fs.existsSync(backupClaudeDir)).toBe(true);

      // Check settings.json was backed up
      const backupSettings = path.join(backupClaudeDir, 'settings.json');
      expect(fs.existsSync(backupSettings)).toBe(true);

      const settingsContent = JSON.parse(fs.readFileSync(backupSettings, 'utf-8'));
      expect(settingsContent).toEqual(existingConfig);

      // Check agent was backed up
      const backupAgentFile = path.join(backupClaudeDir, 'agents', 'my-agent.md');
      expect(fs.existsSync(backupAgentFile)).toBe(true);
    });

    it('should restore existing config after modifications', async () => {
      const target = getClaudeTarget();
      const backup = await backupManager.createBackup(projectPath, projectHash, target);

      // Simulate modifications (what attach would do)
      const claudeDir = path.join(projectPath, '.claude');

      // Modify settings.json
      const newConfig = {
        mcpServers: {
          'flow-server': { command: 'flow-cmd' },
        },
      };
      fs.writeFileSync(path.join(claudeDir, 'settings.json'), JSON.stringify(newConfig));

      // Add new agent file
      fs.writeFileSync(path.join(claudeDir, 'agents', 'builder.md'), '# Builder Agent');

      // Remove original agent
      fs.unlinkSync(path.join(claudeDir, 'agents', 'my-agent.md'));

      // Verify modifications
      expect(fs.existsSync(path.join(claudeDir, 'agents', 'my-agent.md'))).toBe(false);
      expect(fs.existsSync(path.join(claudeDir, 'agents', 'builder.md'))).toBe(true);

      // Restore
      await backupManager.restoreBackup(projectHash, backup.sessionId);

      // Verify restoration
      const restoredSettings = JSON.parse(fs.readFileSync(path.join(claudeDir, 'settings.json'), 'utf-8'));
      expect(restoredSettings).toEqual(existingConfig);

      // Original agent should be back
      expect(fs.existsSync(path.join(claudeDir, 'agents', 'my-agent.md'))).toBe(true);

      // Flow agent should be gone
      expect(fs.existsSync(path.join(claudeDir, 'agents', 'builder.md'))).toBe(false);
    });
  });

  describe('Backup cleanup', () => {
    it('should keep only specified number of backups', async () => {
      const target = getClaudeTarget();

      // Create 5 backups
      const backups: string[] = [];
      for (let i = 0; i < 5; i++) {
        const backup = await backupManager.createBackup(projectPath, projectHash, target);
        backups.push(backup.sessionId);
        // Small delay to ensure unique timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Should have 5 backups
      const listBefore = await backupManager.listBackups(projectHash);
      expect(listBefore.length).toBe(5);

      // Cleanup to keep last 2
      await backupManager.cleanupOldBackups(projectHash, 2);

      // Should have 2 backups
      const listAfter = await backupManager.listBackups(projectHash);
      expect(listAfter.length).toBe(2);

      // The 2 most recent should remain
      const remainingIds = listAfter.map((b) => b.sessionId);
      expect(remainingIds).toContain(backups[4]);
      expect(remainingIds).toContain(backups[3]);
    });
  });

  describe('Manifest tracking', () => {
    it('should update manifest with attach results', async () => {
      const target = getClaudeTarget();
      const backup = await backupManager.createBackup(projectPath, projectHash, target);

      // Get original manifest
      const manifest = await backupManager.getManifest(projectHash, backup.sessionId);
      expect(manifest).not.toBeNull();

      // Update manifest (simulating attach results)
      manifest!.backup.agents.flow = ['builder.md', 'coder.md'];
      manifest!.backup.commands.flow = ['init.md', 'review.md'];
      manifest!.secrets.mcpEnvExtracted = true;

      await backupManager.updateManifest(projectHash, backup.sessionId, manifest!);

      // Read updated manifest
      const updatedManifest = await backupManager.getManifest(projectHash, backup.sessionId);
      expect(updatedManifest?.backup.agents.flow).toEqual(['builder.md', 'coder.md']);
      expect(updatedManifest?.backup.commands.flow).toEqual(['init.md', 'review.md']);
      expect(updatedManifest?.secrets.mcpEnvExtracted).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should throw on restore of non-existent backup', async () => {
      await expect(backupManager.restoreBackup(projectHash, 'session-nonexistent')).rejects.toThrow('Backup not found');
    });

    it('should return null manifest for non-existent session', async () => {
      const manifest = await backupManager.getManifest(projectHash, 'session-nonexistent');
      expect(manifest).toBeNull();
    });
  });
});
