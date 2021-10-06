# universalprofile-smart-contracts

The reference implementation for universal profiles smart contracts.

| :warning: | _This package is currently in early stages of development,<br/> use for testing or experimentation purposes only._ |
| :-------: | :----------------------------------------------------------------------------------------------------------------- |

## Commits and PRs

This project uses Conventional Commits to generate release notes and to determine versioning. Commit messages should adhere to this standard and be of the form:

```bash
$ git commit -m "feat: Add new feature x"
$ git commit -m "fix: Fix bug in feature x"
$ git commit -m "docs: Add documentation for feature x"
$ git commit -m "test: Add test suite for feature x"
```
Further details on `conventional commits` can be found here: https://www.conventionalcommits.org/en/v1.0.0/

When merging a branch to `develop` PRs should be squashed into one conventional commit by selecting the `Squash and merge` option. This ensures Release notes are useful and readable when releases are created.

<!-- ![alt text](https://docs.github.com/assets/images/help/pull_requests/select-squash-and-merge-from-drop-down-menu.png) -->
<img src="https://docs.github.com/assets/images/help/pull_requests/select-squash-and-merge-from-drop-down-menu.png" alt="drawing" style="width:600px;"/>


---
## Overview

### Installation

via NPM:

Universal Profile smart contracts are available as a [npm package](https://www.npmjs.com/package/@lukso/universalprofile-smart-contracts).

```bash
npm install @lukso/universalprofile-smart-contracts --save
```

#### via cloning the repository

Alternatively can also pull the repository and install its dependencies to use the smart contracts.

```bash
$ git clone https://github.com/lukso-network/universalprofile-smart-contracts.git
$ cd ./universalprofile-smart-contracts

# make sure to download the ERC725 submodule
$ git submodule update --init --recursive
$ npm install
$ cd ./submodules/ERC725/implementations && npm install
```

### Usage

#### in Javascript

You can use the contracts by importing them as follow:

```javascript
import LSP3Account from "@lukso/universalprofile-smart-contracts/build/contracts/LSP3Account.json";

const LSP3AccountContract = new this.web3.eth.Contract(LSP3Account.abi, "", defaultOptions);
```

#### in Solidity

```solidity
import LSP3Account from "@lukso/universalprofile-smart-contracts/build/contracts/LSP3Account.sol";
```

## Testing

Jest contract tests are defined under the tests directory. To run all the tests, run:

```bash
$ npm test
```
---

## Release Process

Releases are published when a commit which increases the version within the `package.json` is merged to the `main` branch.


This functions increases the versions automatically:
```bash
$ npm run release
```

If the current branch contains new commits since the last git tag that contains [standard-version](https://github.com/conventional-changelog/standard-version) names like `feat`, `fix` or `docs`, it will increase the version as follows:

- `feat` will increase the `minor` version
- `fix` and `docs` will increase the `patch` version

This command then updates the `package.json` version, adds to the `CHANGELOG.md` all commit messages grouped by `Feature`, `Bug Fixes`, `Documentaiton` and `Other`, and commits all changes under: `chore(release): <version>`.


To create a major release run:
```bash
npm run release -- -r major
```

Then push the changes to `develop`:
```bash
$ git push orign develop
```

A NPM and github release is created when a higher version is merged into `main`.

A git tag will then be created, a Github Release created with the description of the PR to `main` as the release notes with the appended `CHANGELOG.md` content, and iOS and Android Artifacts attached.
At last a release will be published in NPM automatically.