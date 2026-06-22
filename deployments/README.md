# Deploying Universal Profile smart contracts infrastructure on new EVM networks

This guide covers how to deploy the LUKSO smart contract infrastructure (**LSP23 factory, post deployment module, and base contracts**) on a new EVM-compatible network.

Deployments rely on the [Nick Factory](https://github.com/Arachnid/deterministic-deployment-proxy) and CREATE2 for deterministic address, so that each contract is deployed at the same address across chains.

All contract build artifacts (creation bytecodes, runtime bytecodes, salts, compiler settings) are stored in [`deployments/contracts.json`](./contracts.json).

Below are the step-by-step procedure for deploying each contracts on a new EVM chain.

## Related documentation

- [SETTINGS.md](./SETTINGS.md) — deployment salts, compiler settings, initialization details, and `contracts.json` schema.
- [TUTORIAL.md](./TUTORIAL.md) — guide to learn how to deploy a Universal Profile via the LSP23 factory once the smart contract infrastructure is on-chain.

## Supported EVM Networks

See [DEPLOYED_CHAINS.md](./DEPLOYED_CHAINS.md) for the per-contract address and per-chain deployment registry.

## Contracts Overview

There are two categories of contracts:

- **LSP23 Factory & Post-Deployment Modules** — Used to deploy Universal Profiles & LSP26 Key Managers, and initialize them via the `UniversalProfileInitPostDeploymentModule`.
- **Base Implementation Contracts** — Base implementation contracts that can be used behind [ERC-1167](https://eips.ethereum.org/EIPS/eip-1167) minimal proxies.

### 🏭 LSP23 Factory & Post-Deployment Modules

The `LSP23LinkedContractsFactory` is the central factory for deploying linked contract pairs. See the [LSP-23 spec](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#lsp23linkedcontractsfactory-deployment) for the full deployment transaction data.

The `UniversalProfileInitPostDeploymentModule` is called by the LSP23 after deploying a UP + KeyManager proxy pair. Sets initial data keys via `delegatecall` on the UP, then transfers ownership to the KeyManager. See [deployment details](../packages/lsp23-contracts/contracts/modules/deployment-UP-init-module.md).

The `UniversalProfilePostDeploymentModule` is the same role as above, but for non-proxy (direct) UP deployments. See [deployment details](../packages/lsp23-contracts/contracts/modules/deployment-UP-module.md).

| Contract                                 | Address                                      | Purpose                                                                  |
| ---------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| LSP23LinkedContractsFactory              | `0x2300000A84D25dF63081feAa37ba6b62C4c89a30` | Factory for deploying linked contract pairs (UP + KeyManager)            |
| UniversalProfileInitPostDeploymentModule | `0x000000000066093407b6704B89793beFfD0D8F00` | Sets initial data keys and transfers ownership after UP proxy deployment |
| UniversalProfilePostDeploymentModule     | `0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7` | Same as above but for non-proxy UP deployments                           |

### 🆙 Universal Profile - Base Implementation Contracts

The Universal Profile implementation contracts are base contracts used behind ERC-1167 minimal proxies. Each disables initializers in its `constructor` — only proxies should be initialized via their `initialize(...)` function.

- **UniversalProfileInit** — Proxy-deployable Universal Profile (ERC725Account + LSP1 + LSP3).
- **LSP6KeyManagerInit** — Proxy-deployable Key Manager (permission controller for ERC725Account).
- **LSP1UniversalReceiverDelegateUP** — Stateless delegate that auto-registers LSP5 ReceivedAssets and LSP10 ReceivedVaults data keys.

| Contract                        | Version | Address                                      | Source                                                                                                                                                                                                                |
| ------------------------------- | ------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UniversalProfileInit            | 0.12.1  | `0x52c90985AF970D4E0DC26Cb5D052505278aF32A9` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/v0.12.1/contracts/UniversalProfileInit.sol)                                                                                      |
| UniversalProfileInit            | 0.14.0  | `0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp-smart-contracts-v0.14.0/contracts/UniversalProfileInit.sol)                                                                  |
| LSP6KeyManagerInit              | 0.12.1  | `0xa75684d7D048704a2DB851D05Ba0c3cbe226264C` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/v0.12.1/contracts/LSP6KeyManager/LSP6KeyManagerInit.sol)                                                                         |
| LSP6KeyManagerInit              | 0.14.0  | `0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp-smart-contracts-v0.14.0/contracts/LSP6KeyManager/LSP6KeyManagerInit.sol)                                                     |
| LSP1UniversalReceiverDelegateUP | 0.12.1  | `0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/v0.12.1/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol)                     |
| LSP1UniversalReceiverDelegateUP | 0.14.0  | `0x7870C5B8BC9572A8001C3f96f7ff59961B23500D` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp-smart-contracts-v0.14.0/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol) |

### 🪙 Tokens - Base Implementation Contracts

- **LSP7MintableInit / LSP8MintableInit** — Proxy-deployable mintable token implementations (fungible / non-fungible).

| Contract                                   | Version | Address                                      | Source                                                                                                                                                                                |
| ------------------------------------------ | ------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LSP7MintableInit                           | 0.14.0  | `0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp-smart-contracts-v0.14.0/contracts/LSP7DigitalAsset/presets/LSP7MintableInit.sol)             |
| LSP7MintableInit (with `disableMinting()`) | 0.17.3  | `0xf006554F96bf91616dAda3FdB73Ca213874DcFF9` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp7-contracts-v0.17.3/packages/lsp7-contracts/contracts/presets/LSP7MintableInit.sol)           |
| LSP7CustomizableTokenInit                  | 0.18.1  | `0x2803BA6e11Bb5fD9fDd3aFba653428f341df5A0F` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp7-contracts-v0.18.1/packages/lsp7-contracts/contracts/presets/LSP7CustomizableTokenInit.sol)  |
| LSP8MintableInit                           | 0.14.0  | `0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp-smart-contracts-v0.14.0/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8MintableInit.sol) |
| LSP8MintableInit (with `disableMinting()`) | 0.17.3  | `0xE0835D37b9b2Ed3719409B52499Af6411CEF49eB` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp8-contracts-v0.17.3/packages/lsp8-contracts/contracts/presets/LSP8MintableInit.sol)           |
| LSP8CustomizableTokenInit                  | 0.18.1  | `0xc95b5e293d6f1BfcedB803c763A5B83A6484B5b8` | [**Solidity source code**](https://github.com/lukso-network/lsp-smart-contracts/blob/lsp8-contracts-v0.18.1/packages/lsp8-contracts/contracts/presets/LSP8CustomizableTokenInit.sol)  |

---

## Overview

Deployments use bytecode of each contract read from the JSON file `contracts.json`, and verification uses an
archived standard JSON input (the build file generated by `solc`).

This enables to deploy directly the contract through the Nick Factory and verify the source code easily without needing to re-compile v0.14.0 at all.

The high-level deployment flow works as follow:

1. The Foundry script `./scripts/DeployFromArtifact.s.sol` reads the artifacts of the specific contract from `contracts.json`
2. The Foundry script then grab for this artifact the salt and the creation bytecode
3. The Foundry script then **deploys the raw creation bytecode** through the
   [Nick Factory](https://github.com/Arachnid/deterministic-deployment-proxy)
   (`CREATE2`) so the contract lands at the **same address on every chain**.
4. **Verify the contracts on block explorers using the solc standard JSON input**, so the explorer shows the
   source as **multiple browsable files**.

Contract verifications works using Etherscan or Blockscout API (depending on the block explorer used by the target chain to deploy onto). Contract verification data is also submitted on Sourcify

> **Note**: deploying the raw bytecode and using Solc Standard JSON input for contract verification provides a better deployment experience. This flow leads to:
>
> - not have to checkout at the old repository tag / commit hash at which the contracts were deployed
> - not have to re-install the dependencies
> - not have to recompile the smart contracts

---

## Pre-requisites

1. **[Foundry](https://getfoundry.sh)** installed (specifically `cast`)
2. **A funded deployer account** on the target network
3. **An RPC endpoint** for the target network
4. **The Nick Factory** contract must exist on the target network at address `0x4e59b44847b379578588920cA78FbF26c0B4956C`. To check if it exists, follow the next section.

### Verify Nick Factory is deployed on the target chain

> **Note:** the Foundry deployment scripts check automatically for this.

Confirm the Nick Factory exists on the target chain (it must, for the address
to be identical):

```bash
cast code 0x4e59b44847b379578588920cA78FbF26c0B4956C --rpc-url "$RPC_URL"
```

If it returns `0x`, deploy it first by funding `0x3fab184622dc19b6109349b94811493bf2a45362` with ~`0.0247 ETH` (or the native token) and broadcast the [pre-signed transaction](https://github.com/Arachnid/deterministic-deployment-proxy?tab=readme-ov-file#deployment-transaction). Some networks include the Nick Factory at genesis.

### Setup environnement

1. Create a new `.env` file.

```bash
cp deployments/.env.example deployments/.env
```

2. Fill in the right environment variables. Set the target chain's RPC, your funded deployer private key, and the block explorer settings used to verify the contract after deployment. Use:

- `ETHERSCAN_API_KEY` for Etherscan-family explorers, or
- `BLOCKSCOUT_BASE_URL` (the explorer host URL) for Blockscout instances. Do not append `/api` at the end of the URL.

```
RPC_URL=
DEPLOYER_PK=

ETHERSCAN_API_KEY=
BLOCKSCOUT_BASE_URL=
```

1. Export the environnement variables into the shell.

```bash
source deployments/.env
```

---

## Deployment Flow

### 1 — 🗃️ Get the deployment artifact (creation bytecode + salt + address)

The artifacts containing the raw creation bytecode + salt for each contracts are located inside the `contracts.json` file. You can deploy by pointing the script at the right contract.

Do this by using the right environnement variable for the contract to deploy.

```
# Versioned implementation
CONTRACT_TO_DEPLOY=UniversalProfileInit-v0.14.0
CONTRACT_TO_DEPLOY=LSP6KeyManagerInit-v0.12.1

# Flat singleton (no version suffix)
CONTRACT_TO_DEPLOY=LSP23LinkedContractsFactory
CONTRACT_TO_DEPLOY=UniversalProfileInitPostDeploymentModule
```

Then run the command

```bash
# UniversalProfileInit v0.14.0
FOUNDRY_PROFILE=deployments \
CONTRACT_TO_DEPLOY=UniversalProfileInit-v0.14.0 \
  forge script deployments/scripts/DeployFromArtifact.s.sol \
  --rpc-url "$RPC_URL" --broadcast --private-key "$DEPLOYER_PK"
```

### 2 — 🔍 Sanity check (the input reproduces the bytecode)

This is the check that guarantees verification will succeed before you deploy and spend
gas:

```bash
SOLC="$HOME/.svm/0.8.17/solc-0.8.17"      # the solc Foundry manages
"$SOLC" --standard-json deployments/scripts/solc-inputs/DummyPingRegistry.json \
  | python3 -c "import sys,json;o=json.load(sys.stdin);print('0x'+o['contracts']['deployments/scripts/contracts/DummyPingRegistry.sol']['DummyPingRegistry']['evm']['bytecode']['object'])" \
  > /tmp/from_input.txt
python3 -c "import json;print(json.load(open('deployments/scripts/artifacts/DummyPingRegistry.json'))['creationBytecode'])" \
  > /tmp/from_artifact.txt
diff /tmp/from_input.txt /tmp/from_artifact.txt && echo "EXACT MATCH" || echo "MISMATCH"
```

### 3 — 🚀 Deploy the contract

The `DeployFromArtifact.s.sol` script reads the artifact, computes the predicted
`CREATE2` address, **reverts if it does not equal the expected `address` mentioned in the
artifact**, skips if already deployed, otherwise sends `salt ++ creationBytecode`
to the Nick Factory.

Make sure you have exported in your shell the following environnement variable

```
FOUNDRY_PROFILE=
CONTRACT_TO_DEPLOY=
RPC_URL=
DEPLOYER_PK=
```

Then run the script.

```bash
FOUNDRY_PROFILE=deployments CONTRACT_TO_DEPLOY=UniversalProfileInit-v0.14.0 \
  forge script deployments/scripts/DeployFromArtifact.s.sol \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --private-key "$DEPLOYER_PK"
```

> Tip: drop `--broadcast` first to do a dry run (simulation only, no transaction sent).

### 4 — ⛓️ Confirm the contract is on-chain

```bash
cast code 0x<contract-address> --rpc-url "$RPC_URL"
# non-empty bytecode == deployed
```

### 5 — 📄 Verify the contract on Block explorer with the standard JSON input

Run the dedicated shell script below with the right parameters to verify the contract on the block explorer of the target chain.

> Note that the contract verification shell script **always submits to Sourcify** (chain-agnostic; many wallets/explorers read from it):

```bash
# Run from the repository root
# e.g: verify `UniversalProfileInit` (v0.14.0) on Etherscan for Ethereum Mainnet
# --explorer <etherscan|blockscout>
deployments/verify-contract.sh \
  --address "0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F" \
  --chain 1 \
  --explorer etherscan
```

**If the chain's explorer is an Etherscan-family explorer** (Etherscan,
Basescan, Arbiscan, Polygonscan, BscScan, Lineascan, …) — one API key works
across all of them via Etherscan API v2.

**If the chain's explorer is a Blockscout instance** — set `BLOCKSCOUT_BASE_URL` env variable to
the explorer host from the `explorers` array in `deployed-chains.json`.

```bash
BLOCKSCOUT_BASE_URL=https://eth.blockscout.com
```

> Important:
>
> - `BLOCKSCOUT_BASE_URL` is just the host (e.g. `https://eth.blockscout.com` for Ethereum,
>   or `https://explorer.execution.testnet.lukso.network` for LUKSO Testnet).
>   Do **not** append `/api` — the path below already adds `/api/v2/...`.
> - Do **not** use an `api.` sub-domain; use the explorer host itself.
> - Use `curl -sS` (capital S), not `-s`. With plain `-s`, connection errors
>   (like a wrong host → `exit code 35`, an SSL error) are printed nowhere and
>   the command appears to "do nothing".

With Blockscout, a successful submission returns `{"message":"Smart-contract verification started"}`
with `http=200`. Poll the result (or just open the contract page):

```bash
curl -sS "$BLOCKSCOUT_BASE_URL/api/v2/smart-contracts/$ADDRESS" \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('verified:', d.get('is_verified'))"
```

### 6 — ✅ Confirm verification

Open the contract page on the explorer — you should see the source files
listed separately. Or check Sourcify:

```bash
curl -sS "https://sourcify.dev/server/v2/contract/$CHAIN_ID/$ADDRESS?fields=match"
```

---

## Deploying the whole stack on a new chain

To deploy the whole stack (LSP23 factory + post-deployment module + the three
v0.14.0 implementations) in one run, use the convenience script:

```bash
forge script deployments/scripts/DeployUPStack.s.sol \
  --rpc-url "$RPC_URL" --broadcast --private-key "$DEPLOYER_PK"
```

<!-- ### Always run the sanity check (Step 2) before submitting

Confirm the standard JSON input reproduces the canonical creation bytecode in
`deployments/contracts.json`. If it matches, verification is guaranteed to
succeed on every chain. Example for `UniversalProfileInit`:

```bash
SOLC="$HOME/.svm/0.8.17/solc-0.8.17"
"$SOLC" --standard-json deployments/scripts/solc-inputs/UniversalProfileInit.json \
  | python3 -c "import sys,json;o=json.load(sys.stdin);print('0x'+o['contracts']['contracts/UniversalProfileInit.sol']['UniversalProfileInit']['evm']['bytecode']['object'])"
# Compare with .UniversalProfileInit.versions[1].creationBytecode in deployments/contracts.json
``` -->

---

## Deploy to many chains at once (optional)

Once the single-chain flow works, loop Step 3 over `deployments/deployed-chains.json`
(from the repository root), skipping zkSync-stack chains (different `CREATE2`
derivation) and chains without the Nick Factory:

```bash
# Run from the repository root
export FOUNDRY_PROFILE=deployments
export CONTRACT_TO_DEPLOY=UniversalProfileInit-v0.14.0
ZK_DENYLIST="324 50104 232"   # zkSync Era, Sophon, Lens

jq -c '.[]' deployments/deployed-chains.json | while read -r chain; do
  CHAIN_ID=$(echo "$chain" | jq -r '.chainId')
  NAME=$(echo "$chain" | jq -r '.name')
  RPC=$(echo "$chain" | jq -r '.rpcUrl')
  case " $ZK_DENYLIST " in *" $CHAIN_ID "*) echo "skip (zk): $NAME"; continue;; esac
  if [ "$(cast code 0x4e59b44847b379578588920cA78FbF26c0B4956C --rpc-url "$RPC" 2>/dev/null)" = "0x" ]; then
    echo "skip (no Nick Factory): $NAME ($CHAIN_ID)"; continue
  fi
  echo "==> $NAME ($CHAIN_ID)"
  forge script deployments/scripts/DeployFromArtifact.s.sol \
    --rpc-url "$RPC" --broadcast --private-key "$DEPLOYER_PK" || echo "FAILED: $NAME"
done
```

---

## Manual deployment via `cast send`

All contracts can also be deployed manually via Foundry `cast` by sending `salt + creationBytecode` as calldata to the Nick Factory. The salt and creation bytecodes are in the [`contracts.json`](./contracts.json) file.

```bash
# Generic pattern — send (salt ++ creationBytecode) to Nick Factory
cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

**Verify each deployment:**

```bash
# Should return non-empty bytecode
cast code 0x2300000A84D25dF63081feAa37ba6b62C4c89a30 --rpc-url $RPC_URL
cast code 0x000000000066093407b6704B89793beFfD0D8F00 --rpc-url $RPC_URL
cast code 0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7 --rpc-url $RPC_URL
```

### Bytecode Comparison

After deployment, verify the on-chain bytecode matches `./contracts.json`.

For the LSP23 factory and the post-deployment module.

```bash
ON_CHAIN=$(cast code $CONTRACT_ADDRESS --rpc-url $RPC_URL)
EXPECTED=$(python3 -c "import json; print(json.load(open('./contracts.json'))['LSP23LinkedContractsFactory']['bytecode'])")
[ "$ON_CHAIN" = "$EXPECTED" ] && echo "Bytecode matches" || echo "Bytecode mismatch"
```

For implementation contracts, they are nested under `['<name>']['versions'][i]['bytecode']`.

```bash
ON_CHAIN=$(cast code $CONTRACT_ADDRESS --rpc-url $RPC_URL)
EXPECTED=$(python3 -c "import json; d=json.load(open('./contracts.json')); print(next(v for v in d['UniversalProfileInit']['versions'] if v['version']=='0.14.0')['bytecode'])")
[ "$ON_CHAIN" = "$EXPECTED" ] && echo "Bytecode matches" || echo "Bytecode mismatch"
```

---

## Notes & caveats

- **Editing a contract changes its address.** Any source change alters the
  metadata hash → different bytecode → different `CREATE2` address. Freeze the
  sources before deploying widely.
- **zkSync-stack chains** (zkSync Era `324`, Sophon `50104`, Lens `232`) cannot
  reproduce the same address (different derivation + zksolc). Excluded.
- **EIP-155-strict chains** may reject the Nick Factory presigned tx; if the
  factory can't be deployed there, the chain can't be supported.
- **Non-Etherscan/Blockscout/Sourcify explorers** (OKLink, Subscan, Teloscan,
  Ronin) must be verified manually.
- `forge verify-contract` is **not** used here for the legacy contracts because
  it recompiles the current project to build the payload; it cannot submit an
  archived standard JSON input. The `curl` submissions above are what let you
  verify a contract whose sources are not in this repo.

---

## Further Reading

- [LSP-23 Linked Contracts Factory spec](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md)
- [LSP23 modules README](../packages/lsp23-contracts/contracts/modules/README.md)
- [PostDeploymentModule (Init) deployment guide](../packages/lsp23-contracts/contracts/modules/deployment-UP-init-module.md)
- [PostDeploymentModule deployment guide](../packages/lsp23-contracts/contracts/modules/deployment-UP-module.md)
- [Nick Factory / Deterministic Deployment Proxy](https://github.com/Arachnid/deterministic-deployment-proxy)
