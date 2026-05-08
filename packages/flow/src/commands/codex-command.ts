/**
 * Codex command - install and verify Flow-managed Codex runtime assets.
 */

import type { Stats } from 'node:fs';
import { cp, lstat, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import chalk from 'chalk';
import { Command } from 'commander';
import { getAgentOsDir, getCodexAdapterDir } from '../utils/config/paths.js';

interface CodexInstallOptions {
  dryRun?: boolean;
}

interface CodexDoctorOptions {
  json?: boolean;
}

interface DoctorCheck {
  name: string;
  ok: boolean;
  message: string;
}

const SHARED_ASSET_ENTRIES = ['standards', 'skills'] as const;
const BUILDER_AGENT_FILENAME = 'builder.md';
const BACKUP_TIMESTAMP = new Date()
  .toISOString()
  .replaceAll('-', '')
  .replaceAll(':', '')
  .replace(/\..+$/, '');

export const codexCommand = new Command('codex')
  .description('Install and verify Flow-managed Codex runtime assets');

codexCommand
  .command('install')
  .description('Install Flow-managed AGENTS.md, standards, and skills into CODEX_HOME')
  .option('--dry-run', 'Print planned changes without writing files', false)
  .action(async (options: CodexInstallOptions) => {
    await installCodexAssets(options);
  });

codexCommand
  .command('doctor')
  .description('Verify that Flow-managed Codex assets are available and installed')
  .option('--json', 'Print machine-readable JSON output', false)
  .action(async (options: CodexDoctorOptions) => {
    await runCodexDoctor(options);
  });

async function installCodexAssets(options: CodexInstallOptions): Promise<void> {
  const codexAdapterDir = getCodexAdapterDir();
  const agentOsDir = getAgentOsDir();
  const codexHome = getCodexHome();

  await assertCodexAssets(codexAdapterDir, agentOsDir);

  if (options.dryRun) {
    console.log(chalk.cyan(`Would install Codex adapter from ${codexAdapterDir}`));
    console.log(chalk.cyan(`Would install Agent OS assets from ${agentOsDir}`));
    console.log(chalk.cyan(`Would write Codex runtime files to ${codexHome}`));
    return;
  }

  await mkdir(codexHome, { recursive: true });

  await installComposedAgentsFile(codexAdapterDir, agentOsDir, path.join(codexHome, 'AGENTS.md'));
  await replacePath(
    path.join(agentOsDir, 'standards'),
    path.join(codexHome, 'standards')
  );
  await installSkills(path.join(agentOsDir, 'skills'), path.join(codexHome, 'skills'));

  console.log(chalk.green(`Agent OS assets installed for Codex at ${codexHome}`));
}

async function runCodexDoctor(options: CodexDoctorOptions): Promise<void> {
  const codexAdapterDir = getCodexAdapterDir();
  const agentOsDir = getAgentOsDir();
  const codexHome = getCodexHome();
  const checks: DoctorCheck[] = [];

  checks.push(await checkPath('Flow Agent OS assets', agentOsDir));
  checks.push(await checkPath('Flow Codex adapter', codexAdapterDir));

  checks.push(await checkPath('Codex adapter asset: AGENTS.md', path.join(codexAdapterDir, 'AGENTS.md')));
  checks.push(await checkPath('Agent OS builder agent', path.join(agentOsDir, 'agents', BUILDER_AGENT_FILENAME)));

  for (const entry of SHARED_ASSET_ENTRIES) {
    checks.push(await checkPath(`Agent OS asset: ${entry}`, path.join(agentOsDir, entry)));
  }

  checks.push(await checkPath('Installed AGENTS.md', path.join(codexHome, 'AGENTS.md')));
  checks.push(await checkPath('Installed standards', path.join(codexHome, 'standards')));
  checks.push(await checkPath('Installed skills', path.join(codexHome, 'skills')));

  const agentsContent = await readTextIfExists(path.join(codexHome, 'AGENTS.md'));
  checks.push({
    name: 'AGENTS.md uses Flow-owned assets',
    ok:
      Boolean(agentsContent) &&
      agentsContent.includes('The canonical Builder identity follows') &&
      !agentsContent.includes('flow-prompt-library.md'),
    message: agentsContent
      ? 'Installed AGENTS.md is composed from the Codex adapter and Agent OS Builder'
      : 'Installed AGENTS.md is missing or unreadable',
  });

  if (options.json) {
    console.log(JSON.stringify({ codexHome, codexAdapterDir, agentOsDir, checks }, null, 2));
  } else {
    console.log(chalk.cyan(`Codex home: ${codexHome}`));
    console.log(chalk.cyan(`Flow Agent OS assets: ${agentOsDir}`));
    console.log(chalk.cyan(`Flow Codex adapter: ${codexAdapterDir}`));
    for (const check of checks) {
      const symbol = check.ok ? 'OK' : 'FAIL';
      const color = check.ok ? chalk.green : chalk.red;
      console.log(color(`${symbol} ${check.name}: ${check.message}`));
    }
  }

  if (checks.some((check) => !check.ok)) {
    process.exitCode = 1;
  }
}

function getCodexHome(): string {
  const configuredHome = process.env.CODEX_HOME?.trim();
  return configuredHome ? configuredHome : path.join(os.homedir(), '.codex');
}

async function assertCodexAssets(codexAdapterDir: string, agentOsDir: string): Promise<void> {
  const agentsPath = path.join(codexAdapterDir, 'AGENTS.md');
  if (!(await pathExists(agentsPath))) {
    throw new Error(`Missing Flow Codex adapter asset: ${agentsPath}`);
  }

  const builderPath = path.join(agentOsDir, 'agents', BUILDER_AGENT_FILENAME);
  if (!(await pathExists(builderPath))) {
    throw new Error(`Missing Flow Agent OS builder: ${builderPath}`);
  }

  for (const entry of SHARED_ASSET_ENTRIES) {
    const entryPath = path.join(agentOsDir, entry);
    if (!(await pathExists(entryPath))) {
      throw new Error(`Missing Flow Agent OS asset: ${entryPath}`);
    }
  }
}

async function installComposedAgentsFile(
  codexAdapterDir: string,
  agentOsDir: string,
  targetPath: string
): Promise<void> {
  const adapterContent = await readFile(path.join(codexAdapterDir, 'AGENTS.md'), 'utf-8');
  const builderContent = stripFrontmatter(
    await readFile(path.join(agentOsDir, 'agents', BUILDER_AGENT_FILENAME), 'utf-8')
  );
  const targetStat = await lstatIfExists(targetPath);

  if (targetStat) {
    await rename(targetPath, `${targetPath}.backup.${BACKUP_TIMESTAMP}`);
  }

  await writeFile(targetPath, `${adapterContent.trim()}\n\n${builderContent.trim()}\n`, 'utf-8');
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---')) {
    return markdown;
  }

  const closingIndex = markdown.indexOf('\n---', 3);
  if (closingIndex === -1) {
    return markdown;
  }

  return markdown.slice(closingIndex + '\n---'.length).trimStart();
}

async function installSkills(skillsSourceDir: string, skillsTargetDir: string): Promise<void> {
  await mkdir(skillsTargetDir, { recursive: true });
  const skillEntries = await readdir(skillsSourceDir, { withFileTypes: true });

  for (const entry of skillEntries) {
    if (!entry.isDirectory()) {
      continue;
    }

    await replacePath(
      path.join(skillsSourceDir, entry.name),
      path.join(skillsTargetDir, entry.name)
    );
  }
}

async function replacePath(sourcePath: string, targetPath: string): Promise<void> {
  const targetStat = await lstatIfExists(targetPath);

  if (targetStat) {
    const backupPath = `${targetPath}.backup.${BACKUP_TIMESTAMP}`;
    await rename(targetPath, backupPath);
  }

  await cp(sourcePath, targetPath, {
    force: true,
    recursive: true,
    verbatimSymlinks: true,
  });
}

async function checkPath(name: string, targetPath: string): Promise<DoctorCheck> {
  const ok = await pathExists(targetPath);
  return {
    name,
    ok,
    message: ok ? targetPath : `Missing: ${targetPath}`,
  };
}

async function pathExists(targetPath: string): Promise<boolean> {
  return Boolean(await lstatIfExists(targetPath));
}

async function lstatIfExists(targetPath: string): Promise<Stats | undefined> {
  try {
    return await lstat(targetPath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function readTextIfExists(targetPath: string): Promise<string> {
  try {
    return await readFile(targetPath, 'utf-8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}
