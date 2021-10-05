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
`conventional commits`: https://www.conventionalcommits.org/en/v1.0.0/

When merging to `develop` PRs should be squashed into one conventional commit by selecting the `Squash and merge` option. This ensures Release notes are useful and readable

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

Releases are created when a commit which increases the version within the package.json is merged to the `main` branch.

To create a release

1) Increase the version number in `package.json` and generate release notes by running:
```bash
$ npm run release
```
This  invokes [standard-version](https://github.com/conventional-changelog/standard-version) which calculates the new version number and generates release notes from the conventional git commit history. The version number is increased in `package.json` and the new version number and additions to `CHANGELOG.md` are committed as `chore(release): <version>`.

2) Push the release commit to develop
```bash
$ git push
```

4) Open a PR to merge `develop` into `main`

When merging to main with a higher package.json version, a new version will be published on NPM. A GitHub tag and release will be created with the iOS and Android Artifacts attached. Release notes are created from the git commit history since the last release, grouped by changes based on the conventional commit prefixes.