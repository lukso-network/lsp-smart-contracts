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


Trigger a release by running:
```bash
$ npm run release
```

This command uses [standard-version](https://github.com/conventional-changelog/standard-version) to automatically set the new version number and generate a changelog. 

Standard-version increases the version number in `package.json` and updates the `CHANGELOG.md` so developers do not need to manually update anything. These changes will be automatically commmited with the message `chore(release): <version>`.


Changes in `CHANGELOG.md` will be grouped by conventional commit prefix. e.g. all `feat` commits will appear under a `Features` header and `fix` commits will appear under a `Bug Fixes` header.

Whether there is a `patch`, `minor` or `major` version increase is calculated automatically from the conventional commit prefixes since last release (`feat` => `minor`, `docs` => `patch`, `fix` => `patch`).

e.g. A release containing 4 `feat` commits will increase the minor version by 1. A release containing 1 `fix` and 1 `docs` commit will increase the patch version by 1.


To trigger a major release instead run:
```bash
npm run release -- -r major
```

Push the changes to the `develop` branch:
```bash
$ git push orign develop
```

Open a PR to merge `develop` into `main`. The body of this PR will be used as custom release notes in the Github Release. 

When the PR is merged a Git tag will be created and a Github release will be published with the iOS and Android Artifacts attached. The new version will be published to NPM.

The Github release notes will contain the release PR body above the generated CHANGELOG.