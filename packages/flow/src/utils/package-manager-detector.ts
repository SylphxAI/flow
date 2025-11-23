/**
 * Package Manager Detection
 * Detects which package manager is being used (npm, bun, pnpm, yarn)
 * Based on lock files and environment variables
 */

import fs from 'node:fs';
import path from 'node:path';

export type PackageManager = 'npm' | 'bun' | 'pnpm' | 'yarn';

export interface PackageManagerInfo {
  name: PackageManager;
  installCommand: string;
  globalInstallCommand: (packageName: string) => string;
  version?: string;
}

/**
 * Detect package manager from environment variable (npm_config_user_agent)
 * This is set when running through npm/bun/pnpm/yarn scripts
 */
export function detectPackageManagerFromUserAgent(): PackageManager | null {
  const userAgent = process.env.npm_config_user_agent;

  if (!userAgent) {
    return null;
  }

  if (userAgent.includes('bun')) return 'bun';
  if (userAgent.includes('pnpm')) return 'pnpm';
  if (userAgent.includes('yarn')) return 'yarn';
  if (userAgent.includes('npm')) return 'npm';

  return null;
}

/**
 * Detect package manager from lock files in directory
 */
export function detectPackageManagerFromLockFiles(dir: string = process.cwd()): PackageManager | null {
  const lockFiles: Record<PackageManager, string[]> = {
    bun: ['bun.lockb', 'bun.lock'],
    pnpm: ['pnpm-lock.yaml'],
    yarn: ['yarn.lock'],
    npm: ['package-lock.json'],
  };

  // Check in priority order: bun > pnpm > yarn > npm
  const priority: PackageManager[] = ['bun', 'pnpm', 'yarn', 'npm'];

  for (const pm of priority) {
    const files = lockFiles[pm];
    for (const file of files) {
      if (fs.existsSync(path.join(dir, file))) {
        return pm;
      }
    }
  }

  return null;
}

/**
 * Detect which package manager to use
 * Priority: user agent > lock files > npm (default)
 */
export function detectPackageManager(dir: string = process.cwd()): PackageManager {
  // 1. Try user agent (most reliable when running as script)
  const fromUserAgent = detectPackageManagerFromUserAgent();
  if (fromUserAgent) {
    return fromUserAgent;
  }

  // 2. Try lock files
  const fromLockFiles = detectPackageManagerFromLockFiles(dir);
  if (fromLockFiles) {
    return fromLockFiles;
  }

  // 3. Default to npm
  return 'npm';
}

/**
 * Get package manager info with commands
 */
export function getPackageManagerInfo(pm?: PackageManager): PackageManagerInfo {
  const detected = pm || detectPackageManager();

  const info: Record<PackageManager, PackageManagerInfo> = {
    npm: {
      name: 'npm',
      installCommand: 'npm install',
      globalInstallCommand: (pkg) => `npm install -g ${pkg}`,
    },
    bun: {
      name: 'bun',
      installCommand: 'bun install',
      globalInstallCommand: (pkg) => `bun install -g ${pkg}`,
    },
    pnpm: {
      name: 'pnpm',
      installCommand: 'pnpm install',
      globalInstallCommand: (pkg) => `pnpm install -g ${pkg}`,
    },
    yarn: {
      name: 'yarn',
      installCommand: 'yarn install',
      globalInstallCommand: (pkg) => `yarn global add ${pkg}`,
    },
  };

  return info[detected];
}

/**
 * Get upgrade command for a package
 */
export function getUpgradeCommand(packageName: string, pm?: PackageManager): string {
  const pmInfo = getPackageManagerInfo(pm);
  return pmInfo.globalInstallCommand(`${packageName}@latest`);
}

/**
 * Check if package manager is available in system
 */
export async function isPackageManagerAvailable(pm: PackageManager): Promise<boolean> {
  const { exec } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const execAsync = promisify(exec);

  try {
    await execAsync(`${pm} --version`);
    return true;
  } catch {
    return false;
  }
}
