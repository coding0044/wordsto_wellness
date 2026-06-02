#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IGNORES = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.vscode']);
const SKIP_NAMES = new Set([
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'tsconfig.json',
  'tsconfig.tsbuildinfo',
  'next.config.js',
  'next-env.d.ts',
  'eslint.config.mjs',
  'postcss.config.mjs',
  'README.md',
  'readme.md',
  '.gitignore',
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  'scripts',
  'rename-to-kebab.js'
]);
const SOURCE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const CASE_INSENSITIVE_FS = process.platform === 'win32' || process.platform === 'darwin';

function normalizePath(p) {
  return p.split(path.sep).join('/');
}

function toKebab(name) {
  if (!name) return name;
  const leadingDot = name.startsWith('.') ? '.' : '';
  if (leadingDot) name = name.slice(1);
  name = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
  name = name.replace(/[^A-Za-z0-9]+/g, '-');
  name = name.replace(/-+/g, '-');
  name = name.replace(/^-|-$/g, '');
  name = name.toLowerCase();
  return leadingDot + name;
}

function shouldSkip(relPath) {
  if (!relPath) return false;
  const normalized = normalizePath(relPath);
  const segments = normalized.split('/');
  if (segments.some(segment => IGNORES.has(segment))) return true;
  if (SKIP_NAMES.has(segments[segments.length - 1])) return true;
  return false;
}

function isCaseOnlyRename(from, to) {
  if (!CASE_INSENSITIVE_FS) return false;
  const resolvedFrom = path.resolve(from);
  const resolvedTo = path.resolve(to);
  return resolvedFrom !== resolvedTo && resolvedFrom.toLowerCase() === resolvedTo.toLowerCase();
}

async function safeRename(from, to) {
  if (from === to) return;
  if (isCaseOnlyRename(from, to)) {
    const temp = from + '.rename-temp';
    await fs.rename(from, temp);
    await fs.rename(temp, to);
    return;
  }
  await fs.rename(from, to);
}

async function walk(dir) {
  const rel = normalizePath(path.relative(ROOT, dir));
  if (shouldSkip(rel)) return [];

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (shouldSkip(entryRel)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const children = await walk(full);
      results.push(...children);
      results.push({ path: full, isDir: true });
    } else if (entry.isFile()) {
      results.push({ path: full, isDir: false });
    }
  }
  return results;
}

function getRenameTargets(items) {
  const map = new Map();
  for (const item of items) {
    const rel = normalizePath(path.relative(ROOT, item.path));
    const segments = rel.split('/');
    const targetSegments = segments.map((segment, index) => {
      if (index === segments.length - 1 && !item.isDir) {
        const ext = path.extname(segment);
        const base = path.basename(segment, ext);
        return toKebab(base) + ext;
      }
      return toKebab(segment);
    });
    const targetRel = targetSegments.join('/');
    if (targetRel !== rel) {
      const target = path.join(ROOT, ...targetRel.split('/'));
      map.set(item.path, target);
    }
  }
  return map;
}

async function ensureUnique(sourcePath, target) {
  if (sourcePath === target || isCaseOnlyRename(sourcePath, target)) return target;
  let candidate = target;
  let i = 1;
  while (true) {
    try {
      await fs.access(candidate);
      const dir = path.dirname(target);
      const base = path.basename(target, path.extname(target));
      const ext = path.extname(target);
      candidate = path.join(dir, `${base}-${i}${ext}`);
      i++;
    } catch {
      return candidate;
    }
  }
}

function getImportCandidates(oldRel, newRel) {
  const candidates = [];
  const oldExt = path.extname(oldRel);
  const newExt = path.extname(newRel);
  const oldNoExt = oldExt ? oldRel.slice(0, -oldExt.length) : oldRel;
  const newNoExt = newExt ? newRel.slice(0, -newExt.length) : newRel;
  candidates.push({ from: oldRel, to: newRel });
  if (oldExt) candidates.push({ from: oldNoExt, to: newNoExt });
  if (oldExt && newExt && oldNoExt !== oldRel) candidates.push({ from: oldNoExt, to: newRel });
  if (oldExt && newExt && newNoExt !== newRel) candidates.push({ from: oldRel, to: newNoExt });
  return candidates;
}

function buildReplacementMap(renameMap) {
  const replacements = new Map();
  for (const [source, target] of renameMap.entries()) {
    const sourceRel = normalizePath(path.relative(ROOT, source));
    const targetRel = normalizePath(path.relative(ROOT, target));
    if (sourceRel.startsWith('app/') || sourceRel.startsWith('src/')) {
      const aliasSource = '@/'+ sourceRel.replace(/^(app|src)\//, '');
      const aliasTarget = '@/'+ targetRel.replace(/^(app|src)\//, '');
      for (const item of getImportCandidates(aliasSource, aliasTarget)) {
        replacements.set(item.from, item.to);
      }
    }
    for (const item of getImportCandidates(sourceRel, targetRel)) {
      replacements.set(item.from, item.to);
    }
  }
  return Array.from(replacements.entries()).sort((a, b) => b[0].length - a[0].length);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function renameItems(renameMap, dryRun) {
  const entries = Array.from(renameMap.entries()).sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of entries) {
    const uniqueTarget = await ensureUnique(source, target);
    if (dryRun) {
      console.log(`[dry-run] ${normalizePath(path.relative(ROOT, source))} -> ${normalizePath(path.relative(ROOT, uniqueTarget))}`);
      continue;
    }
    await safeRename(source, uniqueTarget);
  }
}

function isSourceFile(filePath) {
  return SOURCE_EXTS.has(path.extname(filePath).toLowerCase());
}

async function updateImports(renameMap, dryRun) {
  const replacements = buildReplacementMap(renameMap);
  if (replacements.length === 0) return;

  const items = await walk(ROOT);
  const sourceFiles = items.filter(item => !item.isDir && isSourceFile(item.path));

  for (const item of sourceFiles) {
    let content = await fs.readFile(item.path, 'utf8');
    let modified = false;
    for (const [from, to] of replacements) {
      const pattern = new RegExp(`(['\"])${escapeRegExp(from)}(['\"])`, 'g');
      const newContent = content.replace(pattern, (_match, open, close) => {
        modified = true;
        return `${open}${to}${close}`;
      });
      content = newContent;
    }
    if (modified) {
      if (dryRun) {
        console.log(`[dry-run] update imports in ${normalizePath(path.relative(ROOT, item.path))}`);
      } else {
        await fs.writeFile(item.path, content, 'utf8');
      }
    }
  }
}

function printUsage() {
  console.log('Usage: node scripts/rename-to-kebab.js [--dry-run]');
  console.log('Renames files/directories to kebab-case and updates source imports.');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }
  const dryRun = args.includes('--dry-run');
  const items = await walk(ROOT);
  const renameMap = getRenameTargets(items);
  if (dryRun) {
    console.log('Dry run mode: no files will be changed.');
    await renameItems(renameMap, true);
    return;
  }
  if (renameMap.size === 0) {
    console.log('No renames needed.');
    return;
  }
  await renameItems(renameMap, false);
  await updateImports(renameMap, false);
  console.log('Rename complete. Review changes and run your build.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});