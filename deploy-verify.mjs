#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

function run(cmd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { shell: true, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      code === 0
        ? resolve()
        : reject(new Error(`Command failed (exit ${code}): ${cmd}`));
    });
  });
}

const outputs = JSON.parse(await readFile(process.argv[2], 'utf-8'));
const network = process.argv[3];
for (const key in outputs) {
  const value = outputs[key];
  const match = key.match(/^(.*\/.*)--release_created$/);

  if (!match || !value) continue;

  const workspace = match[1];

  await run(
    `npm run verify-balance --workspace=./${workspace} -- --network ${network}`,
  );
  await run(
    `npm run deploy:base --workspace=./${workspace} -- --network ${network}`,
  );
}
