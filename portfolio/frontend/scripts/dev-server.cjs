const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PORT = Number(process.env.FRONTEND_PORT || 5173);
const DIST_DIR = path.resolve(__dirname, '../dist');

if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  const buildRes = spawnSync('node', [path.resolve(__dirname, 'build.cjs')], { stdio: 'inherit' });
  if (buildRes.status !== 0) process.exit(1);
}

const server = http.createServer((req, res) => {
  const reqPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(DIST_DIR, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mime = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'text/plain';
    res.writeHead(200, { 'Content-Type': `${mime}; charset=utf-8` });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(DIST_DIR, 'index.html')));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Frontend Vite Dev Server] Ready at http://127.0.0.1:${PORT}`);
});
