# lsp-universalprofile-smart-contracts

The reference implementation for universal profiles smart contracts.

| :warning: | _This package is currently in early stages of development,<br/> use for testing or experimentation purposes only._ |
| :-------: | :----------------------------------------------------------------------------------------------------------------- |

## **Commits and PRs**

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
&nbsp;
## **Overview**

### Installation

via NPM:

Universal Profile smart contracts are available as a [npm package](https://www.npmjs.com/package/@lukso/universalprofile-smart-contracts).

```bash
npm install @lukso/universalprofile-smart-contracts --save
```

#### via cloning the repository

Alternatively can also pull the repository and install its dependencies to use the smart contracts.

```bash
$ git clone https://github.com/lukso-network/lsp-universalprofile-smart-contracts.git
$ cd ./lsp-universalprofile-smart-contracts

# make sure to download the ERC725 submodule
$ git submodule update --init --recursive
$ npm install
$ cd ./submodules/ERC725/implementations && npm install
```

## Usage

#### in Javascript

You can use the contracts by importing them as follow:

```javascript
import UniversalProfile from "@lukso/universalprofile-smart-contracts/build/contracts/UniversalProfile.json";

const UniversalProfileContract = new this.web3.eth.Contract(UniversalProfile.abi, "", defaultOptions);
```

#### in Solidity

```solidity
import UniversalProfile from "@lukso/universalprofile-smart-contracts/build/contracts/UniversalProfile.sol";
```

## Testing

Jest contract tests are defined under the tests directory. To run all the tests, run:

```bash
$ npm test
```
---
&nbsp;
## **Release Process**

Releases are published when a commit including an incease in the `package.json` version number is merged to the `main` branch.

This function increases the version automatically using [standard-version](https://github.com/conventional-changelog/standard-version):
```bash
$ npm run release
```

If the current branch contains new commits since the last git tag that contains [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) prefixes like `feat`, `fix` or `docs`, it will increase the version as follows:

- `feat` will increase the `minor` version
- `fix` and `docs` will increase the `patch` version

Standard-version then:
1. updates the `package.json` version
2. adds to the `CHANGELOG.md` all commit messages grouped by `Feature`, `Bug Fixes`, `Documentation` or `Other`
3. commits all changes under: `chore(release): <version>`


Then push the changes to `develop`:
```bash
$ git push orign develop
```

A NPM and GitHub release is created when a version change in `package.json` is merged into `main`.

A git tag will then be created, a GitHub Release created with the description of the PR to `main` as the release notes with the appended `CHANGELOG.md` content, and iOS and Android Artifacts attached.
At last a release will be published in NPM automatically.

&nbsp;

## Specific Version Increases

To ignore the automatic version increase in favour of a custom version use the `--release-as` flag with the argument `major`, `minor` or `patch` or a specific version number:

```bash
npm run release -- --release-as minor
# Or
npm run release -- --release-as 1.1.0
```


## Prerelease versions

To create a pre-release run:

```bash
npm run release -- --prerelease
```

If the lastest version is 1.0.0, the pre-release command will change the version to: `1.0.1-0`

To name the pre-release, set the name by adding `--prerelease <name>`

```bash
npm run release -- --prerelease alpha
```

If the latest version is 1.0.0 this will change the version to: `1.0.1-alpha.0`

