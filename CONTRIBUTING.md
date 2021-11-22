# Contributing

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
