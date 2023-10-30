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

## Solidity Code Comments

A good level of documentation is crucial for understanding the intended behaviour of the smart contracts and for identifying any potential discrepancies between the implementation and the intended behaviour.

When making contributions, each smart contracts and functions should be well-documented, with clear comments explaining the purpose and functionality of each function and module.

When changing or adding NatSpec comments to any `function`, `error` or `event` in any contract make sure to adhere to the following guidelines:

1. `@dev` and `@notice` tags can both contain text descriptions and two types of lists: bullet points or numbered lists. Make sure that those tags always start with text descriptions first, not with lists.

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

**_not_**

```solidity
/**
 * @dev Some description for starters.
 *
 * 1. First bullet point.
 *   - First orderd element.
 *   - Second orderd element.
 *
 * First description.
 *
 * 2. Second bullet point.
 *   - First orderd element.
 * Second description.
 *   - Second orderd element.
 */
```

This formatting will result in the following output:

```md
Some description for starters.

1. First bullet point.

- First orderd element.
- Second orderd element. First description.

2. Second bullet point.

- First orderd element. Second description.
- Second orderd element.
```

Which is is not the intended output.

2. `@param` tag is mandatory if the function, error or event has any parameters.

3. `@return` tag is mandatory if the function has any return value.

4. Make sure to use one of the custom tags below to document any additional informations of different kinds:

- Use `@custom:requirements` for all the requirements to use a function.
- Use `@custom:events` for all the emited events during the function execution.
- Use `@custom:warning` for any warnings someone must be aware of.
- Use `@custom:danger` for any dangers one needs to be aware when using the function.
- Use `@custom:hint` for any tips you might have for someone that wants to use the function.
- Use `@custom:info` for any extra information.

If there is only a single comment for the `@custom` tag, it can be written on the same line as the `@custom` tag.
If there is multiple comments for the `@custom` tag, it should span across multiple lines using `-` as bullet points.

E.g.:

```solidity
/**
 * @custom:events {UniversalReceiver} event when someone tranfers native tokens to the contract.
 */
```

**or**

```solidity
/**
 * @custom:events
 * - {UniversalReceiver} event when someone tranfers native tokens to the contract.
 * - {Executes} event when the function is executed without any issues.
 */
```

5. If you want to add an internal link to a `function`, `error` or `event` defined the current contract, use `{}`.
   E.g.: `{pendingOwner}`, `{pendingOwner()}` etc.

6. If you want to add an external link to anything, use `[]`.
   E.g.: `[ERC725Y]`, `[EIP-1271]` etc.

   To use this option, you should keeping mind to add the external links in the footer of the `.md` files as this:
   E.g.: `[ERC725Y]: https://docs.lukso.tech/standards/lsp-background/erc725/#erc725y-generic-data-keyvalue-store` or `[EIP-1271]: https://eips.ethereum.org/EIPS/eip-1271`
   Keep in mind that in our repo we do not want to add this links neither in the smart contracts, nor in the docs template. This links shall be added exclusively to the end application that uses the generated `.md` files. In our case that is the [**docs page**](https://github.com/lukso-network/docs)

## Adding contributors

You can add yourself to the list of contributors in the repository when opening a PR for the first time in the repository. See the [`all-contributors-cli`](https://allcontributors.org/docs/en/cli/usage#all-contributors-add) usage documentation.
