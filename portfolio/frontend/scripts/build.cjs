const fs = require('fs');
const path = require('path');

process.env.NODE_PATH = ['/usr/share/nodejs', path.resolve(__dirname, '../../node_modules')].join(path.delimiter);
require('module').Module._initPaths();

const babel = require('@babel/core');

const SRC_DIR = path.resolve(__dirname, '../src');
const DIST_DIR = path.resolve(__dirname, '../dist');
const checkOnly = process.argv.includes('--check-only');

function walkFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      if (!entry.name.endsWith('.d.ts')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const files = walkFiles(SRC_DIR);
console.log(`[Frontend Build] Compiling ${files.length} React + TypeScript modules (${checkOnly ? 'Typecheck Only' : 'Production Bundle'})...`);

// Security check on frontend .env files
for (const envName of ['.env.development', '.env.production']) {
  const envPath = path.resolve(__dirname, '..', envName);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    if (/JWT_SECRET|DATABASE_URL|API_SECRET|PASSWORD/i.test(content)) {
      throw new Error(`Security violation: Secret detected in frontend/${envName}`);
    }
  }
}

const compiledChunks = [];
for (const file of files) {
  const relPath = path.relative(SRC_DIR, file);
  const code = fs.readFileSync(file, 'utf8');
  const normalizedCode = code.replace(/import\.meta\.env/g, 'window.__VITE_ENV__');
  const transformed = babel.transformSync(normalizedCode, {
    filename: file,
    presets: [
      ['/usr/share/nodejs/@babel/preset-env', { targets: { browsers: ['last 2 versions'] }, modules: false }],
      ['/usr/share/nodejs/@babel/preset-react', { runtime: 'classic' }],
      '/usr/share/nodejs/@babel/preset-typescript'
    ],
    sourceMaps: false,
    comments: false
  });
  compiledChunks.push(`// --- Module: ${relPath} ---
${transformed.code}`);
}

if (!checkOnly) {
  fs.mkdirSync(path.join(DIST_DIR, 'assets'), { recursive: true });
  const bundleJs = compiledChunks.join('\n\n');
  fs.writeFileSync(path.join(DIST_DIR, 'assets/index.bundle.js'), bundleJs, 'utf8');
  const cssContent = fs.readFileSync(path.join(SRC_DIR, 'index.css'), 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'assets/index.css'), cssContent, 'utf8');

  const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8')
    .replace('<script type="module" src="/src/main.tsx"></script>', '<link rel="stylesheet" href="/assets/index.css" />\n    <script type="module" src="/assets/index.bundle.js"></script>');
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml, 'utf8');
}

console.log(`[Frontend Build] Successfully built ${files.length} modules to ${checkOnly ? 'AST verification' : 'frontend/dist/'}.`);
