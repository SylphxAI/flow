import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  detectPackageManagerFromUserAgent,
  detectPackageManagerFromLockFiles,
  detectPackageManager,
  getPackageManagerInfo,
  getUpgradeCommand,
} from '../package-manager-detector';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('Package Manager Detection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('detectPackageManagerFromUserAgent', () => {
    it('should detect bun from user agent', () => {
      process.env.npm_config_user_agent = 'bun/1.0.0';
      expect(detectPackageManagerFromUserAgent()).toBe('bun');
    });

    it('should detect pnpm from user agent', () => {
      process.env.npm_config_user_agent = 'pnpm/8.0.0 npm/? node/v18.0.0';
      expect(detectPackageManagerFromUserAgent()).toBe('pnpm');
    });

    it('should detect yarn from user agent', () => {
      process.env.npm_config_user_agent = 'yarn/1.22.0 npm/? node/v18.0.0';
      expect(detectPackageManagerFromUserAgent()).toBe('yarn');
    });

    it('should detect npm from user agent', () => {
      process.env.npm_config_user_agent = 'npm/9.0.0 node/v18.0.0';
      expect(detectPackageManagerFromUserAgent()).toBe('npm');
    });

    it('should return null when no user agent', () => {
      delete process.env.npm_config_user_agent;
      expect(detectPackageManagerFromUserAgent()).toBe(null);
    });
  });

  describe('detectPackageManagerFromLockFiles', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pm-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should detect bun from bun.lockb', () => {
      fs.writeFileSync(path.join(tempDir, 'bun.lockb'), '');
      expect(detectPackageManagerFromLockFiles(tempDir)).toBe('bun');
    });

    it('should detect bun from bun.lock', () => {
      fs.writeFileSync(path.join(tempDir, 'bun.lock'), '');
      expect(detectPackageManagerFromLockFiles(tempDir)).toBe('bun');
    });

    it('should detect pnpm from pnpm-lock.yaml', () => {
      fs.writeFileSync(path.join(tempDir, 'pnpm-lock.yaml'), '');
      expect(detectPackageManagerFromLockFiles(tempDir)).toBe('pnpm');
    });

    it('should detect yarn from yarn.lock', () => {
      fs.writeFileSync(path.join(tempDir, 'yarn.lock'), '');
      expect(detectPackageManagerFromLockFiles(tempDir)).toBe('yarn');
    });

    it('should detect npm from package-lock.json', () => {
      fs.writeFileSync(path.join(tempDir, 'package-lock.json'), '');
      expect(detectPackageManagerFromLockFiles(tempDir)).toBe('npm');
    });

    it('should prioritize bun over others', () => {
      fs.writeFileSync(path.join(tempDir, 'bun.lock'), '');
      fs.writeFileSync(path.join(tempDir, 'package-lock.json'), '');
      expect(detectPackageManagerFromLockFiles(tempDir)).toBe('bun');
    });

    it('should return null when no lock files', () => {
      expect(detectPackageManagerFromLockFiles(tempDir)).toBe(null);
    });
  });

  describe('detectPackageManager', () => {
    it('should prioritize user agent over lock files', () => {
      process.env.npm_config_user_agent = 'pnpm/8.0.0';
      const result = detectPackageManager();
      expect(result).toBe('pnpm');
    });

    it('should default to npm when no detection methods work', () => {
      delete process.env.npm_config_user_agent;
      const result = detectPackageManager('/nonexistent');
      expect(result).toBe('npm');
    });
  });

  describe('getPackageManagerInfo', () => {
    it('should return correct info for npm', () => {
      const info = getPackageManagerInfo('npm');
      expect(info.name).toBe('npm');
      expect(info.installCommand).toBe('npm install');
      expect(info.globalInstallCommand('foo')).toBe('npm install -g foo');
    });

    it('should return correct info for bun', () => {
      const info = getPackageManagerInfo('bun');
      expect(info.name).toBe('bun');
      expect(info.installCommand).toBe('bun install');
      expect(info.globalInstallCommand('foo')).toBe('bun install -g foo');
    });

    it('should return correct info for pnpm', () => {
      const info = getPackageManagerInfo('pnpm');
      expect(info.name).toBe('pnpm');
      expect(info.installCommand).toBe('pnpm install');
      expect(info.globalInstallCommand('foo')).toBe('pnpm install -g foo');
    });

    it('should return correct info for yarn', () => {
      const info = getPackageManagerInfo('yarn');
      expect(info.name).toBe('yarn');
      expect(info.installCommand).toBe('yarn install');
      expect(info.globalInstallCommand('foo')).toBe('yarn global add foo');
    });
  });

  describe('getUpgradeCommand', () => {
    it('should return correct upgrade command for npm', () => {
      const cmd = getUpgradeCommand('my-package', 'npm');
      expect(cmd).toBe('npm install -g my-package@latest');
    });

    it('should return correct upgrade command for bun', () => {
      const cmd = getUpgradeCommand('my-package', 'bun');
      expect(cmd).toBe('bun install -g my-package@latest');
    });

    it('should return correct upgrade command for pnpm', () => {
      const cmd = getUpgradeCommand('my-package', 'pnpm');
      expect(cmd).toBe('pnpm install -g my-package@latest');
    });

    it('should return correct upgrade command for yarn', () => {
      const cmd = getUpgradeCommand('my-package', 'yarn');
      expect(cmd).toBe('yarn global add my-package@latest');
    });
  });
});
