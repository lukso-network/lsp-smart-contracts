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

`git commit --allow-empty -m "chore: release 2.0.0" -m "Release-As: 2.0.0"` results in the following commit message:

```txt
chore: release 2.0.0

Release-As: 2.0.0
```

The following [commit pattern](https://github.com/googleapis/release-please/blob/main/docs/customizing.md#pull-request-title) can also be specified to instruct release-please to trigger a specific release for a specific package.

```
chore: release${component} ${version}
```

Where:

- `${component}`: the name of the LSP package listed under `packages/` to release.
- `${version}`: the version number to release for.

_Example:_

A common release pull request title would be:

```
chore: release lsp-smart-contracts v0.15.0
```

## Creating pre-release

We use the suffix `-rc` to specify release versions that are not ready for production and may be unstable. This usually takes the following pattern as an example: `@lukso/lsp7-contracts-v0.15.0-rc0`. Each pre-release can then in turn be incremented as `rc1`, `rc2`, etc...

If you would like to publish a package as a pre-release version, you can enforce it by specifying the following fields for this package under the `.release-please-manifest.json`.

```json
 "release-as": "0.15.0-rc0",
 "prerelease-type": "rc",
 "prerelease": true
```

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
