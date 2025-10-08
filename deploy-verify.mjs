#!/usr/bin/env node
import { readFile } from 'fs/promises';
import { $ } from 'zx';

const outputs = JSON.parse(await readFile(process.argv[2], 'utf-8'));
const network = process.argv[3];
for (const key in outputs) {
  const value = outputs[key];
  const match = key.match(/^(.*\/.*)--release_created$/);

  // Skip if no release was created for this LSP package
  if (!match || !value) continue;

  const workspace = match[1];

  await $`npm run verify-balance --workspace=./${workspace} -- --network ${network}`;
  await $`npm run deploy --workspace=./${workspace} -- --network ${network} --tags $TAGS --write true`;
  await $`npm run verify-all --workspace=./${workspace} -- --network ${network}`;
}
