/**
 * Tests for SecretsManager
 * Covers: save, load, clear, hasSecrets operations
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProjectManager } from '../project-manager.js';
import { SecretsManager } from '../secrets-manager.js';

describe('SecretsManager', () => {
  let tempDir: string;
  let flowHome: string;
  let projectManager: ProjectManager;
  let secretsManager: SecretsManager;
  let projectHash: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-secrets-test-'));
    flowHome = path.join(tempDir, '.sylphx-flow');

    fs.mkdirSync(path.join(flowHome, 'sessions'), { recursive: true });
    fs.mkdirSync(path.join(flowHome, 'backups'), { recursive: true });
    fs.mkdirSync(path.join(flowHome, 'secrets'), { recursive: true });
    fs.mkdirSync(path.join(flowHome, 'templates'), { recursive: true });

    projectManager = new ProjectManager();
    (projectManager as any).flowHomeDir = flowHome;

    secretsManager = new SecretsManager(projectManager);
    projectHash = 'testproject1234';
  });

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('saveSecrets()', () => {
    it('should save secrets to correct path', async () => {
      const secrets = {
        version: '1.0.0',
        extractedAt: new Date().toISOString(),
        servers: {
          'test-server': {
            env: { API_KEY: 'secret-value' },
          },
        },
      };

      await secretsManager.saveSecrets(projectHash, secrets);

      const paths = projectManager.getProjectPaths(projectHash);
      const secretsPath = path.join(paths.secretsDir, 'mcp-env.json');
      expect(fs.existsSync(secretsPath)).toBe(true);

      const saved = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'));
      expect(saved.servers['test-server'].env.API_KEY).toBe('secret-value');
    });
  });

  describe('loadSecrets()', () => {
    it('should load saved secrets', async () => {
      const secrets = {
        version: '1.0.0',
        extractedAt: '2024-01-01T00:00:00.000Z',
        servers: {
          'my-server': { env: { TOKEN: 'abc123' } },
        },
      };

      await secretsManager.saveSecrets(projectHash, secrets);
      const loaded = await secretsManager.loadSecrets(projectHash);

      expect(loaded).not.toBeNull();
      expect(loaded?.servers['my-server'].env?.TOKEN).toBe('abc123');
    });

    it('should return null when no secrets exist', async () => {
      const loaded = await secretsManager.loadSecrets('nonexistent');
      expect(loaded).toBeNull();
    });
  });

  describe('clearSecrets()', () => {
    it('should delete secrets file', async () => {
      // Save some secrets first
      await secretsManager.saveSecrets(projectHash, {
        version: '1.0.0',
        extractedAt: new Date().toISOString(),
        servers: { s: { env: { KEY: 'val' } } },
      });

      const paths = projectManager.getProjectPaths(projectHash);
      const secretsPath = path.join(paths.secretsDir, 'mcp-env.json');
      expect(fs.existsSync(secretsPath)).toBe(true);

      // Clear
      await secretsManager.clearSecrets(projectHash);
      expect(fs.existsSync(secretsPath)).toBe(false);
    });

    it('should not throw when secrets file does not exist', async () => {
      await secretsManager.clearSecrets('nonexistent-hash'); // should not throw
    });
  });

  describe('hasSecrets()', () => {
    it('should return true when secrets exist', async () => {
      await secretsManager.saveSecrets(projectHash, {
        version: '1.0.0',
        extractedAt: new Date().toISOString(),
        servers: { s: { env: { A: 'b' } } },
      });

      expect(await secretsManager.hasSecrets(projectHash)).toBe(true);
    });

    it('should return false when secrets do not exist', async () => {
      expect(await secretsManager.hasSecrets('no-such-project')).toBe(false);
    });
  });
});
