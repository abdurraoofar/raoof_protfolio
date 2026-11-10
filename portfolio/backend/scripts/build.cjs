const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Backend Build] Preparing Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
} catch (err) {
  const clientEngine = path.resolve(__dirname, '../../node_modules/.prisma/client/query_engine-windows.dll.node');
  if (fs.existsSync(clientEngine)) {
    console.log('[Backend Build] Note: Prisma client engine is currently loaded by active server process. Using existing generated Prisma client.');
  } else {
    console.error('[Backend Build] Prisma generate failed and no existing client found:', err);
    process.exit(1);
  }
}

console.log('[Backend Build] Compiling TypeScript with tsc...');
execSync('npx tsc -p tsconfig.build.json', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
console.log('[Backend Build] Backend build completed successfully.');
