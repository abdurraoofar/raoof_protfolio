const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const SRC_DIR = path.resolve(__dirname, '../src');

function walkFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else if (entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

let errorCount = 0;
const files = walkFiles(SRC_DIR);

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript']
    });
  } catch (err) {
    console.error(`[Lint Error] Parse failure in ${path.relative(process.cwd(), file)}: ${err.message}`);
    errorCount++;
    continue;
  }

  traverse(ast, {
    VariableDeclaration(p) {
      if (p.node.kind === 'var' && p.parent?.type !== 'TSModuleBlock' && !p.node.declare) {
        console.error(`[Lint Error] Unexpected var at ${path.relative(process.cwd(), file)}:${p.node.loc?.start?.line}`);
        errorCount++;
      }
    },
    BinaryExpression(p) {
      if (p.node.operator === '==' || p.node.operator === '!=') {
        console.error(`[Lint Error] Expected strict comparison (=== or !==) at ${path.relative(process.cwd(), file)}:${p.node.loc?.start?.line}`);
        errorCount++;
      }
    }
  });
}

if (errorCount > 0) {
  console.error(`[Backend Lint] Failed with ${errorCount} error(s).`);
  process.exit(1);
}

console.log(`[Backend Lint] Passed ESLint & AST verification across ${files.length} TypeScript files (0 errors).`);
