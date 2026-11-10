const { spawn } = require('child_process');
const path = require('path');

const mode = process.argv[2] || 'dev';
const isProd = mode === 'start';

const backendProc = spawn(
  'npm',
  ['--prefix', 'backend', 'run', isProd ? 'start' : 'dev'],
  { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' }
);

const frontendProc = spawn(
  'npm',
  ['--prefix', 'frontend', 'run', isProd ? 'preview' : 'dev'],
  { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' }
);

function cleanup() {
  backendProc.kill('SIGTERM');
  frontendProc.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
