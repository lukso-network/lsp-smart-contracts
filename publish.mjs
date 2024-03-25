#!/usr/bin/env node
import { readFile } from "fs/promises";
import { $ } from "zx";

const outputs = JSON.parse(await readFile(process.argv[2], "utf-8"));
for (const key in outputs) {
  const value = outputs[key];
  const match = key.match(/^(.*\/.*)--release_created$/);

  // Skip if no release was created for this LSP package
  if (!match || !value) continue;

  const version = key.match(/^(.*\/.*)--version$/);

  // Do not publish as latest on npm if we are doing a release candidate
  const tag = version.includes("-rc") ? "rc" : "latest";

  const workspace = match[1];
  await $`npm publish --workspace=./${workspace} --tag ${tag} --no-git-checks --access public`;
}
