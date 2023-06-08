# Contributing

Since the `@lukso/lsp-smart-contracts` is an Open Source project, we welcome contributions from anyone about any topics. You can do PRs or open issues in the repository for instance to:

- discuss and propose new ideas or features.
- report bug and issues.
- introduce new features or bug fixes.

## **Clone project**

Our project uses submodules, we recommend you to clone our repository using the following command:

```bash
$ git clone --recurse-submodules https://github.com/lukso-network/lsp-smart-contracts.git
```

## Linting & Formatting Code

Run the linter and prettier from the _lsp-smart-contracts_ project root:

```bash
npm run linter
npm run prettier
```

The linter is configured to check your code for adherence to our guidelines defined in `.solcover.js`.
The script above will prettify the smart contracts, tests and other files according to our styling guidelines defined in `.prettierrc`.

## Testing

Chai contract tests are defined under the tests directory. To run all the tests, run:

```bash
$ npm test
```

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

## Solidity NatSpec

When changing or adding NatSpec comments to the any function, error or event in any contract make sure to adhere to the following guidelines:

1. `@dev` and `@notice` tags can both contain text description and two types of lists, bullet points or numbered lists. Make sure that those tags always start with text description first, not with lists.

E.g.:

```solidity
/**
 * @dev Some description for starters.
 * Continuing describing.
 * It can span over multiple lines.
 */
```

**or**

```solidity
/**
 * @dev Some description for starters.
 *
 * - First bullet point.
 *   1. First orderd element.
 *   2. Second orderd element.
 *
 * - Second bullet point.
 */
```

**or**

```solidity
/**
 * @dev Some description for starters.
 *
 * 1. First bullet point.
 *   - First orderd element.
 *   - Second orderd element.
 *
 * 2. Second bullet point.
 *   - First orderd element.
 *   - Second orderd element.
 */
```

2. `@param` tag is mandatory if the function, error or event has any parameters.

3. `@return` tag is mandatory if the fucntion has any return value.

4. Make sure to use custom tags for different kinds of information:

- Use `@custom:requirements` for all the requirements to use a function.
- Use `@custom:events` for all the emited events during the function execution.
- Use `@custom:warning` for any warnings someone must be aware of when usinf a function.
- Use `@custom:danger` for any dangers one needs to be aware when using the function.
- Use `@custom:hint` for any tips you might have for someone that wants to use the function.
- Use `@custom:info` for any extra informartion.

The custom tags should span across a single line or multiple lines using `-`.

E.g.:

```solidity
/**
 * @custom:events {ValueReceived} event when someone tranfers native tokens to the contract.
 */
```

**or**

```solidity
/**
 * @custom:events
 * - {ValueReceived} event when someone tranfers native tokens to the contract.
 * - {Executes} event when the function is executed without any issues.
 */
```

5. If you want add an internal link to an function, error or event from the current contract, use `{}`.
   E.g.: `{pendingOwner}`, `{pendingOwner()}` etc.

6. If you want to add an external link to anything, use `[]`.
   E.g.: `[ERC725Y]`, `{EIP-1271}` etc.

## Adding contributors

You can add yourself to the list of contributors in the repository when opening a PR for the first time in the repository. See the [`all-contributors-cli`](https://allcontributors.org/docs/en/cli/usage#all-contributors-add) usage documentation.
