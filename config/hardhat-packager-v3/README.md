# @lukso/hardhat-packager-v3

A Hardhat v3 compatible plugin for preparing smart contract artifacts and typechain-like bindings for npm package deployment. This plugin filters and packages only the contracts you specify, reducing bundle size and improving package quality.

## Features

- ✅ **Hardhat v3 Compatible** - Built specifically for Hardhat v3
- 🎯 **Selective Packaging** - Only include the contracts you want
- 🏭 **Strongly typed contracts and factories** - Filters _"typechain-like"_ bindings and factories
- 🧹 **Clean Output** - Automatically removes empty directories
- 🚀 **Easy to Use** - Simple configuration and task execution

## Installation

```bash
npm install --save-dev @lukso/hardhat-packager-v3
```

## Usage

### 1. Import the plugin in your `hardhat.config.ts`:

```typescript
import "@lukso/hardhat-packager-v3";
```

### 2. Configure the plugin:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@lukso/hardhat-packager-v3";

const config: HardhatUserConfig = {
  // ... other config

  packager: {
    // List of contract names to include in the package
    contracts: [
      "UniversalProfile",
      "LSP6KeyManager",
      "LSP7DigitalAsset",
      // ... more contracts
    ],

    // Optional: Include typechain-like factory files (default: false)
    includeFactories: false,
  },
};

export default config;
```

### 3. Run the packaging task:

```bash
npx hardhat prepare-package
```

This will:

1. Compile your contracts (if needed)
2. Filter artifacts to only include specified contracts
3. Filter typechain-like bindings to match
4. Remove empty directories
5. Prepare your package for npm deployment

## Configuration Options

### `contracts` (required)

An array of contract names to include in the package. All other contract artifacts and bindings will be removed.

```typescript
packager: {
  contracts: ["MyContract", "AnotherContract"];
}
```

### `includeFactories` (optional)

Whether to include typechain-like factory files in the package. Default: `false`

```typescript
packager: {
  contracts: ["MyContract"],
  includeFactories: true  // Include typechain-like factories
}
```

## How It Works

The plugin performs the following steps:

1. **Compilation**: Runs `hardhat compile` to ensure all artifacts are up to date
2. **Artifact Filtering**: Removes all contract artifacts (`.json` and `.dbg.json` files) that are not in your `contracts` list
3. **Typechain Filtering**: Removes typechain-like bindings (`.ts` files) for contracts not in your list
4. **Factory Handling**: Optionally removes or filters the typechain-like `factories/` directory
5. **Cleanup**: Removes empty directories left after filtering

### What Gets Kept

```
- artifacts/
|---- UniversalProfile.json
|---- UniversalProfile.d.ts
|---- AnotherContract.json
|---- AnotherContract.d.ts
|---- etc...
- types/ethers-contracts/
|---- UniversalProfile.ts
|---- AnotherContract.ts
|---- common.ts
|---- etc...
```

- Contract artifacts (`.json` files) for contracts in your list
- Typescript types (`.d.ts` files) for contracts in your list
- Typechain-like bindings for included contracts
- `common.ts` typechain-like files
- Typechain-like factories (if `includeFactories: true`)

### What Gets Removed

- Contract artifacts not in your list
- Typechain-like bindings for excluded contracts
- Typechain-like factories (unless `includeFactories: true`)
- Empty directories after cleanup

## Example Workflow

```bash
# 1. Build your contracts
npx hardhat compile

# 3. Prepare the package
npx hardhat prepare-package

# 4. Publish to npm
npm publish
```

## Integration with Your Build Process

Add to your `package.json`:

```json
{
  "scripts": {
    "build": "hardhat compile",
    "build:types": "hardhat typechain",
    "build:package": "hardhat prepare-package",
    "prepublishOnly": "npm run build && npm run build:types && npm run build:package"
  }
}
```

## Comparison with hardhat-packager

This plugin provides the same core functionality as the [hardhat-packager](https://github.com/PaulRBerg/hardhat-packager) plugin but is built for Hardhat v3:

| Feature            | hardhat-packager | @lukso/hardhat-packager-v3 |
| ------------------ | ---------------- | -------------------------- |
| Hardhat v2 Support | ✅               | ❌                         |
| Hardhat v3 Support | ❌               | ✅                         |
| Filter Artifacts   | ✅               | ✅                         |
| Filter Typechain   | ✅               | ✅                         |
| Factory Control    | ✅               | ✅                         |
| Clean Empty Dirs   | ✅               | ✅                         |

## Troubleshooting

### "Artifacts directory not found"

Make sure to run `hardhat compile` before running `prepare-package`, or just run `prepare-package` which will automatically compile for you.

### "No contracts specified"

Add contracts to your `packager.contracts` array in your Hardhat config.

### TypeChain bindings not being filtered

Ensure TypeChain is properly configured in your `hardhat.config.ts` with an `outDir` specified.

## License

Apache-2.0

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Credits

Inspired by [hardhat-packager](https://github.com/PaulRBerg/hardhat-packager) by Paul Razvan Berg.
