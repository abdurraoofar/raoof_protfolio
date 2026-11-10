const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_e) {
          // Non-JSON response (e.g. HTML)
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, raw: data, json });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runVerification() {
  console.log('=== Starting Full-Stack Foundation Integration Suite ===');

  // 1. Start Backend (Dev Mode) & Frontend (Dev Mode)
  const backendProc = spawn('node', [path.resolve(__dirname, '../backend/dist/server.js')], {
    env: { ...process.env, NODE_ENV: 'development', PORT: '5000' },
    stdio: 'pipe'
  });

  const frontendProc = spawn('node', [path.resolve(__dirname, '../frontend/scripts/dev-server.cjs')], {
    env: { ...process.env, FRONTEND_PORT: '5173' },
    stdio: 'pipe'
  });

  await wait(800);

  try {
    // Test 1: GET /api/v1/health
    const healthRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/health',
      method: 'GET'
    });
    console.log('[Test 1] GET /api/v1/health -> Status:', healthRes.statusCode);
    console.log('         Payload:', JSON.stringify(healthRes.json));
    if (healthRes.statusCode !== 200 || !healthRes.json?.success) {
      throw new Error('Health check test failed');
    }

    // Test 2: POST /api/v1/health/echo (Valid Payload)
    const echoValidRes = await httpRequest(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/v1/health/echo',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      JSON.stringify({ ping: 'Hello Full-Stack Foundation' })
    );
    console.log('[Test 2] POST /api/v1/health/echo (Valid) -> Status:', echoValidRes.statusCode);
    if (echoValidRes.statusCode !== 200 || echoValidRes.json?.data?.echo !== 'Hello Full-Stack Foundation') {
      throw new Error('Echo valid payload test failed');
    }

    // Test 3: POST /api/v1/health/echo (Invalid Payload -> Triggers Zod Validation Error)
    const echoInvalidRes = await httpRequest(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/v1/health/echo',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      JSON.stringify({ ping: 'x' })
    );
    console.log('[Test 3] POST /api/v1/health/echo (Invalid Zod) -> Status:', echoInvalidRes.statusCode, 'Code:', echoInvalidRes.json?.error?.code);
    if (echoInvalidRes.statusCode !== 400 || echoInvalidRes.json?.error?.code !== 'VALIDATION_ERROR') {
      throw new Error('Zod validation error handler test failed');
    }

    // Test 4: GET /api/v1/unknown-route (Triggers 404 AppError)
    const notFoundRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/unknown-route',
      method: 'GET'
    });
    console.log('[Test 4] GET /api/v1/unknown-route (404 Handler) -> Status:', notFoundRes.statusCode, 'Code:', notFoundRes.json?.error?.code);
    if (notFoundRes.statusCode !== 404 || notFoundRes.json?.error?.code !== 'NOT_FOUND') {
      throw new Error('404 handler test failed');
    }

    // Test 5: GET Frontend http://localhost:5173/
    const frontendRes = await httpRequest({
      hostname: '127.0.0.1',
      port: 5173,
      path: '/',
      method: 'GET'
    });
    console.log('[Test 5] GET http://localhost:5173/ (Frontend SPA) -> Status:', frontendRes.statusCode, 'Bytes:', frontendRes.raw.length);
    if (frontendRes.statusCode !== 200 || !frontendRes.raw.includes('<div id="root"></div>')) {
      throw new Error('Frontend server test failed');
    }
  } finally {
    backendProc.kill('SIGTERM');
    frontendProc.kill('SIGTERM');
  }

  await wait(400);

  // Test 6: Production Mode Verification (NODE_ENV=production)
  const prodBackendProc = spawn('node', [path.resolve(__dirname, '../backend/dist/server.js')], {
    env: { ...process.env, NODE_ENV: 'production', PORT: '5001' },
    stdio: 'pipe'
  });

  await wait(600);
  try {
    const prodHealth = await httpRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/v1/health',
      method: 'GET'
    });
    console.log('[Test 6] GET /api/v1/health (Production Mode) -> Status:', prodHealth.statusCode, 'Env:', prodHealth.json?.data?.environment);
    const prod404 = await httpRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/v1/does-not-exist',
      method: 'GET'
    });
    console.log('[Test 7] Production Error Redaction Check -> Stack trace omitted:', prod404.json?.error?.stack === undefined);
    if (prodHealth.json?.data?.environment !== 'production' || prod404.json?.error?.stack !== undefined) {
      throw new Error('Production configuration verification failed');
    }
  } finally {
    prodBackendProc.kill('SIGTERM');
  }

  console.log('=== All 7 Foundation Integration & Production Checks PASSED ===');
}

runVerification().catch((err) => {
  console.error('Integration Verification Failed:', err);
  process.exit(1);
});
