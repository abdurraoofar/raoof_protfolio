const path = require('path');
const { spawnSync } = require('child_process');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const buildRes = spawnSync('node', [path.resolve(__dirname, 'build.cjs')], { stdio: 'inherit' });
if (buildRes.status !== 0) {
  process.exit(buildRes.status || 1);
}
require(path.resolve(__dirname, '../dist/server.js'));
