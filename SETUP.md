# Files to move:

- build.config.ts
- foundry.toml
- slither.config.json

# Files to remove at root:

- [x] hardhat.config.ts
- [x] tsconfig.json
- [x] tsconfig.module.json
- [x] constants.ts
- [x] mythx.yaml

# Not sure

- release-please-config.json?
- .release-please-manifest.json
- turbo.json
- vite.config.json
- gitignore and gitmodules
- prettierignore and prettierrc, or per package that can be extended?

# Scripts to have per package (do it for other packages)

- prepare-package
- build:docs
- build:js

# devDependencies to add per package

- "hardhat-packager": "^1.4.2",
- "unbuild": "^2.0.0",

# devDependencies for lsp-smart-contracts package

- "@defi-wonderland/smock": "^2.3.4",
- "@erc725/erc725.js": "0.17.2",
- "@lukso/eip191-signer.js": "^0.2.2",
- "@typechain/ethers-v5": "^10.2.0",
- "dotenv": "^16.0.3",
- "esbuild": "^0.17.15",
- "eth-create2-calculator": "^1.1.5",
- "hardhat-deploy": "^0.11.25",
- "hardhat-deploy-ethers": "^0.3.0-beta.13",
- "hardhat-gas-reporter": "^1.0.9",
- "markdown-table-ts": "^1.0.3",
- "hardhat-contract-sizer": "^2.8.0",

# devDependencies for root

- "all-contributors-cli": "^6.24.0",
- "@turbo/gen": "^1.9.7",
- "ts-node": "^10.2.0",
- "turbo": "latest",
- "typescript": "^5.3.3",

# devDependencies to throw away

- "@remix-project/remixd": "^0.6.12",
- "keccak256": "1.0.6",
- "merkletreejs": "0.2.32",
- "npm-run-all": "^4.1.5",
- "pluralize": "^8.0.0",

# Not sure???

"eslint-config-custom": "\*",
"eslint": "^7.32.0",
"ethers": "^5.7.2",
"prettier": "^2.8.8",
"prettier-plugin-solidity": "^1.1.3"
