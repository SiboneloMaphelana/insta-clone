const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const port = process.env.PORT || '3000';
const dbPath = path.join(root, 'db.json');
const middlewarePath = path.join(root, 'json-server-cors.cjs');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const result = spawnSync(
  npx,
  [
    'json-server',
    '--watch',
    dbPath,
    '--host',
    '0.0.0.0',
    '--port',
    String(port),
    '--middlewares',
    middlewarePath,
  ],
  { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
);

process.exit(result.status !== null && result.status !== undefined ? result.status : 1);
