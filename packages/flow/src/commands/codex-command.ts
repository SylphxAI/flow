/**
 * Codex command - install and verify Flow-managed Codex runtime assets.
 */

import type { Stats } from 'node:fs';
import { cp, lstat, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import chalk from 'chalk';
import { Command } from 'commander';
import { parse as parseYaml } from 'yaml';
import { getAgentOsDir, getCodexProjectionDir } from '../utils/config/paths.js';

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

interface ProjectionCopy {
  source: string;
  destination: string;
}

interface ProjectionAgent {
  source: string;
  destination: string;
  stripFrontmatter?: boolean;
}

interface CodexProjection {
  target: 'codex';
  agent: ProjectionAgent;
  copies: ProjectionCopy[];
  preserveSkillSystemDirectory?: boolean;
}

const CODEX_PROJECTION_FILENAME = 'projection.yaml';
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
  const codexProjectionDir = getCodexProjectionDir();
  const agentOsDir = getAgentOsDir();
  const codexHome = getCodexHome();
  const projection = await loadCodexProjection(codexProjectionDir);

  await assertCodexProjection(codexProjectionDir, agentOsDir, projection);

  if (options.dryRun) {
    console.log(chalk.cyan(`Would use Codex projection from ${codexProjectionDir}`));
    console.log(chalk.cyan(`Would install Agent OS assets from ${agentOsDir}`));
    console.log(chalk.cyan(`Would write Codex runtime files to ${codexHome}`));
    return;
  }

  await mkdir(codexHome, { recursive: true });

  await installProjectedAgentFile(agentOsDir, projection, codexHome);
  for (const copy of projection.copies) {
    const sourcePath = path.join(path.dirname(agentOsDir), copy.source);
    const targetPath = path.join(codexHome, copy.destination);

    if (copy.destination === 'skills' && projection.preserveSkillSystemDirectory) {
      await installSkills(sourcePath, targetPath);
    } else {
      await replacePath(sourcePath, targetPath);
    }
  }

  console.log(chalk.green(`Agent OS assets installed for Codex at ${codexHome}`));
}

async function runCodexDoctor(options: CodexDoctorOptions): Promise<void> {
  const codexProjectionDir = getCodexProjectionDir();
  const agentOsDir = getAgentOsDir();
  const codexHome = getCodexHome();
  const projection = await loadCodexProjection(codexProjectionDir);
  const checks: DoctorCheck[] = [];

  checks.push(await checkPath('Flow Agent OS assets', agentOsDir));
  checks.push(await checkPath('Flow Codex projection', codexProjectionDir));

  checks.push(await checkPath('Codex projection config', path.join(codexProjectionDir, CODEX_PROJECTION_FILENAME)));
  checks.push(await checkPath('Agent OS builder agent', path.join(path.dirname(agentOsDir), projection.agent.source)));

  for (const copy of projection.copies) {
    checks.push(await checkPath(`Agent OS asset: ${copy.destination}`, path.join(path.dirname(agentOsDir), copy.source)));
  }

  checks.push(await checkPath('Installed AGENTS.md', path.join(codexHome, projection.agent.destination)));
  for (const copy of projection.copies) {
    checks.push(await checkPath(`Installed ${copy.destination}`, path.join(codexHome, copy.destination)));
  }

  const agentsContent = await readTextIfExists(path.join(codexHome, projection.agent.destination));
  checks.push({
    name: 'AGENTS.md uses Flow-owned assets',
    ok:
      Boolean(agentsContent) &&
      agentsContent.includes('# BUILDER') &&
      !agentsContent.startsWith('---') &&
      !agentsContent.includes('# Codex Adapter') &&
      !agentsContent.includes('flow-prompt-library.md'),
    message: agentsContent
      ? 'Installed AGENTS.md is projected directly from the Agent OS Builder'
      : 'Installed AGENTS.md is missing or unreadable',
  });

  if (options.json) {
    console.log(JSON.stringify({ codexHome, codexProjectionDir, agentOsDir, projection, checks }, null, 2));
  } else {
    console.log(chalk.cyan(`Codex home: ${codexHome}`));
    console.log(chalk.cyan(`Flow Agent OS assets: ${agentOsDir}`));
    console.log(chalk.cyan(`Flow Codex projection: ${codexProjectionDir}`));
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

async function loadCodexProjection(codexProjectionDir: string): Promise<CodexProjection> {
  const projectionPath = path.join(codexProjectionDir, CODEX_PROJECTION_FILENAME);
  const parsed = parseYaml(await readFile(projectionPath, 'utf-8')) as unknown;

  if (!isCodexProjection(parsed)) {
    throw new Error(`Invalid Codex projection config: ${projectionPath}`);
  }

  return parsed;
}

function isCodexProjection(value: unknown): value is CodexProjection {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const projection = value as Partial<CodexProjection>;
  return (
    projection.target === 'codex' &&
    Boolean(projection.agent) &&
    typeof projection.agent?.source === 'string' &&
    typeof projection.agent.destination === 'string' &&
    Array.isArray(projection.copies) &&
    projection.copies.every(
      (copy) =>
        copy &&
        typeof copy === 'object' &&
        typeof (copy as ProjectionCopy).source === 'string' &&
        typeof (copy as ProjectionCopy).destination === 'string'
    )
  );
}

async function assertCodexProjection(
  codexProjectionDir: string,
  agentOsDir: string,
  projection: CodexProjection
): Promise<void> {
  const projectionPath = path.join(codexProjectionDir, CODEX_PROJECTION_FILENAME);
  if (!(await pathExists(projectionPath))) {
    throw new Error(`Missing Flow Codex projection config: ${projectionPath}`);
  }

  const agentPath = path.join(path.dirname(agentOsDir), projection.agent.source);
  if (!(await pathExists(agentPath))) {
    throw new Error(`Missing Flow Agent OS builder: ${agentPath}`);
  }

  for (const copy of projection.copies) {
    const entryPath = path.join(path.dirname(agentOsDir), copy.source);
    if (!(await pathExists(entryPath))) {
      throw new Error(`Missing Flow Agent OS asset: ${entryPath}`);
    }
  }
}

async function installProjectedAgentFile(
  agentOsDir: string,
  projection: CodexProjection,
  codexHome: string
): Promise<void> {
  const sourcePath = path.join(path.dirname(agentOsDir), projection.agent.source);
  const targetPath = path.join(codexHome, projection.agent.destination);
  const sourceContent = await readFile(sourcePath, 'utf-8');
  const projectedContent = projection.agent.stripFrontmatter
    ? stripFrontmatter(sourceContent)
    : sourceContent;
  const targetStat = await lstatIfExists(targetPath);

  if (targetStat) {
    await rename(targetPath, `${targetPath}.backup.${BACKUP_TIMESTAMP}`);
  }

  await writeFile(targetPath, `${projectedContent.trim()}\n`, 'utf-8');
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
