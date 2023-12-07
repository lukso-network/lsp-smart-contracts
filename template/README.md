# LSP Package Template

This project can be used as a skeleton to build a package for a LSP implementation in Solidity (LUKSO Standard Proposal)

It is based on Hardhat.

## How to setup a LSP as a package?

1. Copy the `template/` folder and paste it under the `packages/` folder. Then rename this `template/` folder that you copied with the LSP name.

```bash
cp -r template packages/lsp-name
```

2. Update the `"name"` and `"description"` field inside the `package.json` for this LSP package you just created.

3. Setup the dependencies

If this LSP uses external dependencies like `@openzeppelin/contracts`, put them under `dependencies` with the version number.

```json
"@openzeppelin/contracts": "^4.9.3"
```

If this LSP uses other LSP as dependencies, put each LSP dependency as shown below. This will use the current code in the package:

```json
"@lsp2": "*"
```

4. Setup the npm commands for linting, building, testing, etc... under the `"scripts"` in the `package.json`

5. Test that all commands you setup run successfully

By running the commands below, your LSP package should come up in the list of packages that Turbo is running this command for.

```bash
turbo build
turbo lint
turbo lint:solidity
turbo test
turbo test:foundry
```
