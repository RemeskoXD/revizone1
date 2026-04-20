/**
 * Spustí `server.js` z `.next/standalone` se správným cwd (očekává zkopírované static/public).
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dir = join(root, '.next', 'standalone');

if (!existsSync(join(dir, 'server.js'))) {
  console.error('Chybí .next/standalone/server.js — spusť `npm run build`.');
  process.exit(1);
}

if (!process.env.HOSTNAME) {
  process.env.HOSTNAME = '0.0.0.0';
}

const child = spawn(process.execPath, ['server.js'], {
  cwd: dir,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
