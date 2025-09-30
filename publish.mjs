#!/usr/bin/env node
import { readFile } from 'fs/promises';
import { $ } from 'zx';

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
  await $`npm pack --workspace=./${workspace}`;

  // publish to npm registry
  await $`npm publish --workspace=./${workspace} --tag ${tag} --no-git-checks --access public`;

  for (const network of ['luksoTestnet', 'luksoMainnet']) {
    await $`npm run verify-balance --workspace=./${workspace} -- --network ${network}`;
    await $`npm run deploy --workspace=./${workspace} -- --network ${network} --tags $TAGS --write true`;
    await $`npm run verify-all --workspace=./${workspace} -- --network ${network}`;
  }
}
