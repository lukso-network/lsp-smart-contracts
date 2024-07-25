# **Release Process**

> 📒 See [**release-please** documentation](See release-please documentation for more infos.) for more infos and configurations.

Releases are created on the Github repository and published to [npm]() using [Release Please](https://github.com/googleapis/release-please) via the [`release-please`](https://github.com/google-github-actions/release-please-action#automating-publication-to-npm) Github action.

The workflow [`release.yml`](./workflow/release.yml) automates CHANGELOG generation, version bumps and npm releases by parsing the git history, looking for [Conventional Commit messages](https://www.conventionalcommits.org/).

When changes and feature PRs are merged from `develop` to `main`, release-please will open and maintain a release PR for a specific package with the updated CHANGELOG and new version number. When this PR is merged, a release will be created and the package published to NPM.

1. Merge `develop` into `main`.
2. Release Please will create the release PR going to `main` for the affected package(s).
3. Merge the generated release PR.
4. Package will be published to [NPM](https://npmjs.org).

## Conventional Commit prefixes?

Commits should follow the [Conventional Commit messages standard](https://www.conventionalcommits.org/).

The following commit prefixes will result in changes in the CHANGELOG:

- `fix:` which represents bug fixes, and correlates to a [SemVer](https://semver.org/)
  patch.
- `feat:` which represents a new feature, and correlates to a minor version increase.
  (indicated by the `!`) and will result in a SemVer major version increase.
- `feat!:`, or `fix!:`, `refactor!:`, etc., which represent a breaking change
- `build:` Changes that affect the build system or external dependencies.
- `ci:` Changes to our CI configuration files and scripts.
- `docs:` Documentation only changes.
- `perf:` A code change that improves performance.
- `refactor:` A code change that neither fixes a bug nor adds a feature.
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- `test:` Adding missing tests or correcting existing tests.
- `chore:` Other

## Release with a custom version number

When a commit to the main branch has `Release-As: x.x.x` (case insensitive) in the **commit body**, Release Please will open a new pull request for the specified version.

`git commit --allow-empty -m "chore: release lsp-smart-contracts 2.0.0" -m "Release-As: 2.0.0"` results in the following commit message:

```txt
chore: release lsp-smart-contracts 2.0.0

Release-As: 2.0.0
```

The following [commit pattern](https://github.com/googleapis/release-please/blob/main/docs/customizing.md#pull-request-title) must be specified:

```
chore: release${component} ${version}
```

Where:

- `${component}`: the name of the LSP package listed under `packages/` to release.
- `${version}`: the version number to release for.

Depending on the pattern, you can instruct to:

- either release the full `@lukso/lsp-smart-contracts` package
- or instruct release-please to trigger a specific release for a specific package like `@lukso/lsp7-contracts` for the LSP7 contracts only.

_Example:_

A common release pull request title for the `@lukso/lsp-smart-contracts` (the "umbrella" package that contains all the LSPs) would be:

```
chore: release lsp-smart-contracts v0.15.0
```

A common release pull request title for a specific package only like `@lukso/lsp7-contracts` (only the contracts related to LSP7) would be:

```
chore: release lsp7-contracts v0.15.0
```

## Creating pre-release

We use the suffix `-rc` to specify release versions that are not ready for production and may be unstable. This usually takes the following pattern as an example: `@lukso/lsp7-contracts-v0.15.0-rc.0`. Each pre-release can then in turn be incremented as `rc.1`, `rc.2`, etc...

If you would like to publish a package as a pre-release version, you can enforce it by:

1. First, create a commit that includes the following pattern.

_Example for the whole `@lukso/lsp-smart-contracts` repository that contains all the packages:_

```
chore: release lsp-smart-contracts 0.15.0-rc.0
```

_Example for only a specific package like `@lukso/lsp7-contracts` to only create a pre-release of the LSP7 contracts:_

2. Then specify the following fields for this package under the `.release-please-manifest.json`.

```json
 "prerelease-type": "rc",
 "prerelease": true
```

3. Finally, make an empty commit like the commands above:

```
git commit --allow-empty -m "chore: release lsp-smart-contracts 0.15.0-rc.0" -m "Release-As: 0.15.0-rc.0"
```

Pre-releases will show up with a "Pre-Release" badge on the [list of Github Releases](https://github.com/lukso-network/lsp-smart-contracts/releases) of the repository.

## How can I fix release notes?

If you have merged a pull request and would like to amend the commit message
used to generate the release notes for that commit, you can edit the body of
the merged pull requests and add a section like:

```
BEGIN_COMMIT_OVERRIDE
feat: add ability to override merged commit message

fix: another message
chore: a third message
END_COMMIT_OVERRIDE
```

The next time Release Please runs, it will use that override section as the
commit message instead of the merged commit message.
