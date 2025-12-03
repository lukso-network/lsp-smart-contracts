#!/usr/bin/env node
import { readFile } from 'fs/promises';
import { exec } from 'node:child_process/promises';

const outputs = JSON.parse(await readFile(process.argv[2], 'utf-8'));
for (const key in outputs) {
  const value = outputs[key];
  const match = key.match(/^(.*\/.*)--release_created$/);

  // Skip if no release was created for this LSP package
  if (!match || !value) continue;

  let tag = 'latest';

  const version = outputs[`${match[1]}--version`];

  // Do not publish as latest on npm if we are doing a release candidate
  if (version != null && version.includes('-rc')) {
    tag = 'rc';
  }

  const workspace = match[1];
  // log the files and folders include in each package
  await exec(`npm pack --workspace=./${workspace}`);

  // publish to npm registry
  await exec(`npm publish --workspace=./${workspace} --tag ${tag} --no-git-checks --access public`);
}
