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
for (const key in outputs) {
  const value = outputs[key];
  const match = key.match(/^(.*\/.*)--release_created$/);

  if (!match || !value) continue;

  let tag = 'latest';
  const version = outputs[`${match[1]}--version`];
  if (version?.includes('-rc')) {
    tag = 'rc';
  }

  const workspace = match[1];
  await run(`npm pack --workspace=./${workspace}`);
  await run(
    `npm publish --workspace=./${workspace} --tag ${tag} --no-git-checks --access public`,
  );
}
