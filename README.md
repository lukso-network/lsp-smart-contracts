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

When merging to `develop` PRs should be squashed into one conventional commit. This ensures Release notes are useful and readable

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

Releases are created when a commit is merged to main which includes a version bump in `package.json`.

To create a release

1) Create a release branch from develop branch. While on `develop` run:
```bash
$ git checkout -b release
```

2) Bump the version number in `package.json` and generate release notes by running:
```bash
$ npm run release
```

3) Push the new release commit
```bash
$ git push
```

4) Open a PR to merge `release` into `main`

When this PR is merged a Github release will be created and npm, ios and andoid artifacts will be dispatched.
 
 Release notes are generated based on `git commit` history and changes grouped by conventional commit prefix