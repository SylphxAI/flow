/**
 * Auto-Upgrade Service
 * Fully non-blocking background updates
 * Only manages Flow updates - target CLIs manage their own updates
 */

import { exec } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { getUpgradeCommand } from '../utils/package-manager-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VERSION_FILE = path.join(os.homedir(), '.sylphx-flow', 'versions.json');
const DEFAULT_CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

interface VersionInfo {
  flowLatest?: string;
}

const execAsync = promisify(exec);

export class AutoUpgrade {
  private periodicCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Start background update service
   * Runs first check immediately, then every intervalMs (default 30 minutes)
   * All checks and upgrades are non-blocking
   */
  start(intervalMs: number = DEFAULT_CHECK_INTERVAL_MS): void {
    this.stop();

    // First check immediately (non-blocking)
    this.checkAndUpgrade();

    // Then periodic checks
    this.periodicCheckInterval = setInterval(() => {
      this.checkAndUpgrade();
    }, intervalMs);

    // Don't prevent process from exiting
    this.periodicCheckInterval.unref();
  }

  /**
   * Stop background update service
   */
  stop(): void {
    if (this.periodicCheckInterval) {
      clearInterval(this.periodicCheckInterval);
      this.periodicCheckInterval = null;
    }
  }

  /**
   * Check for updates and upgrade if available (non-blocking)
   * Fire and forget - errors are silently ignored
   */
  private checkAndUpgrade(): void {
    this.performCheck().catch(() => {
      // Silent fail
    });
  }

  /**
   * Perform version check and upgrade if needed
   */
  private async performCheck(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const latestVersion = await this.fetchLatestVersion();

    if (!latestVersion) return;

    // Save for reference (not used for decision making)
    await this.saveVersionInfo({ flowLatest: latestVersion });

    // Upgrade if newer version available
    if (latestVersion !== currentVersion) {
      await this.upgrade();
    }
  }

  /**
   * Get current Flow version from package.json
   */
  private async getCurrentVersion(): Promise<string> {
    try {
      const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      return packageJson.version;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Fetch latest version from npm registry
   */
  private async fetchLatestVersion(): Promise<string | null> {
    try {
      const { stdout } = await execAsync('npm view @sylphx/flow version', { timeout: 5000 });
      return stdout.trim();
    } catch {
      return null;
    }
  }

  /**
   * Detect package manager used to install Flow
   */
  private async detectPackageManager(): Promise<'bun' | 'npm' | 'pnpm' | 'yarn'> {
    try {
      const { stdout } = await execAsync('which flow || where flow');
      const flowPath = stdout.trim().toLowerCase();

      if (flowPath.includes('bun')) return 'bun';
      if (flowPath.includes('pnpm')) return 'pnpm';
      if (flowPath.includes('yarn')) return 'yarn';
    } catch {
      // Fall through
    }
    return 'bun'; // Default
  }

  /**
   * Upgrade Flow to latest version
   */
  private async upgrade(): Promise<void> {
    try {
      const pm = await this.detectPackageManager();
      const cmd = getUpgradeCommand('@sylphx/flow', pm);
      await execAsync(cmd);
    } catch {
      // Silent fail
    }
  }

  /**
   * Save version info to disk
   */
  private async saveVersionInfo(info: VersionInfo): Promise<void> {
    try {
      const dir = path.dirname(VERSION_FILE);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(VERSION_FILE, JSON.stringify(info, null, 2));
    } catch {
      // Silent fail
    }
  }
}
