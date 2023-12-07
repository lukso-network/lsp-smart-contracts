# LSP Package Template

This project can be used as a skeleton to build a package for a LSP implementation in Solidity (LUKSO Standard Proposal)

It is based on Hardhat.

## How to setup a LSP as a package?

1. Copy the `template/` folder and paste it under the `packages/` folder. Then rename this `template/` folder that you copied with the LSP name.

```
cp template/ packages/lsp-name/
```

2. Update the `"name"` and `"description"` field inside the `package.json` for this LSP package you just created.
