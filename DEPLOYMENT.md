# Deploying LUKSO Smart Contracts on a New Network

This guide explains how to deploy the full LUKSO smart contract infrastructure on any EVM-compatible network. It covers singleton contracts (deterministic CREATE2 addresses), implementation contracts (behind ERC1167 proxies), and a complete end-to-end example of deploying a Universal Profile via the LSP23 factory.

## Contract Categories

There are two categories of contracts to deploy:

1. **Singletons** — Deployed once via the Nick Factory (CREATE2). They get the **same address on every chain** because the same salt + creation bytecode always produces the same address. These include the LSP23 factory itself and the post-deployment module.

2. **Implementation Contracts** — Base contracts that live behind ERC1167 minimal proxies. Each proxy `delegatecall`s into the implementation. These are also deployed via CREATE2 for deterministic addresses. Includes UniversalProfileInit, LSP6KeyManagerInit, LSP1UniversalReceiverDelegateUP, and token implementations.

---

## Prerequisites

Before deploying, ensure you have:

- **A funded deployer account** on the target network (needs ETH/native token for gas + deployment value)
- **RPC endpoint** for the target network
- **Foundry installed** — specifically `cast` for sending transactions ([getfoundry.sh](https://getfoundry.sh))
- **The Nick Factory** deployed at `0x4e59b44847b379578588920cA78FbF26c0B4956C` on the target network

### Deploying the Nick Factory

The Nick Factory (also called the CREATE2 deployer, per [EIP-2470](https://eips.ethereum.org/EIPS/eip-2470) / Nick Johnson's method) must exist on the target chain. It is a keyless deployment — the deployer address is derived from a pre-signed transaction.

Check if it exists:

```bash
cast code 0x4e59b44847b379578588920cA78FbF26c0B4956C --rpc-url $RPC_URL
```

If the output is `0x` (empty), you need to deploy it:

1. Fund the keyless deployer address `0x3fab184622dc19b6109349b94811493bf2a45362` with exactly `0.0247 ETH`
2. Broadcast the pre-signed transaction:

```bash
cast publish --rpc-url $RPC_URL \
  0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222
```

> **Note:** Some networks pre-deploy the Nick Factory at genesis. Check before attempting deployment.

---

## Contract Overview

All contract data (bytecodes, salts, addresses, compiler settings) is stored in [`deployments/contracts.json`](./deployments/contracts.json).

| Contract                                 | Type           | Version(s)     | Expected Address                             | Source                                                                                    |
| ---------------------------------------- | -------------- | -------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| LSP23LinkedContractsFactory              | Singleton      | —              | `0x2300000A84D25dF63081feAa37ba6b62C4c89a30` | `packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol`                      |
| UniversalProfileInitPostDeploymentModule | Singleton      | —              | `0x000000000066093407b6704B89793beFfD0D8F00` | `packages/lsp23-contracts/contracts/modules/UniversalProfileInitPostDeploymentModule.sol` |
| UniversalProfileInit                     | Implementation | 0.12.1, 0.14.0 | `0x52c9...32A9`, `0x3024...ED4F`             | `packages/universalprofile-contracts/contracts/UniversalProfileInit.sol`                  |
| LSP6KeyManagerInit                       | Implementation | 0.12.1, 0.14.0 | `0xa756...64C`, `0x2Fe3...BF8a4`             | `packages/lsp6-contracts/contracts/LSP6KeyManagerInit.sol`                                |
| LSP1UniversalReceiverDelegateUP          | Implementation | 0.12.1, 0.14.0 | `0xA546...18c8`, `0x7870...500D`             | `packages/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateUP.sol`           |
| LSP7MintableInit                         | Implementation | 0.14.0         | `0x28B7...B2d8`                              | `packages/lsp7-contracts/contracts/presets/LSP7MintableInit.sol`                          |
| LSP8MintableInit                         | Implementation | 0.14.0         | `0xd787...7997`                              | `packages/lsp8-contracts/contracts/presets/LSP8MintableInit.sol`                          |

### Full Addresses

| Contract                                 | Version | Address                                      |
| ---------------------------------------- | ------- | -------------------------------------------- |
| LSP23LinkedContractsFactory              | —       | `0x2300000A84D25dF63081feAa37ba6b62C4c89a30` |
| UniversalProfileInitPostDeploymentModule | —       | `0x000000000066093407b6704B89793beFfD0D8F00` |
| UniversalProfileInit                     | 0.12.1  | `0x52c90985AF970D4E0DC26Cb5D052505278aF32A9` |
| UniversalProfileInit                     | 0.14.0  | `0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F` |
| LSP6KeyManagerInit                       | 0.12.1  | `0xa75684d7D048704a2DB851D05Ba0c3cbe226264C` |
| LSP6KeyManagerInit                       | 0.14.0  | `0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4` |
| LSP1UniversalReceiverDelegateUP          | 0.12.1  | `0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8` |
| LSP1UniversalReceiverDelegateUP          | 0.14.0  | `0x7870C5B8BC9572A8001C3f96f7ff59961B23500D` |
| LSP7MintableInit                         | 0.14.0  | `0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8` |
| LSP8MintableInit                         | 0.14.0  | `0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997` |

---

## Step 1: Deploy Singleton Contracts

Singletons are deployed once per network using the Nick Factory's CREATE2. Because the same `salt + creationBytecode` always produces the same address, these contracts will have identical addresses on every chain.

The deployment pattern is:

```bash
cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

The Nick Factory takes the concatenation of `salt (32 bytes) + creationBytecode` as raw calldata and deploys using CREATE2.

### 1.1 LSP23LinkedContractsFactory

The LSP23 factory is the central contract for deploying linked contract pairs (e.g., Universal Profile + Key Manager). It supports both direct deployment (`deployContracts`) and proxy deployment (`deployERC1167Proxies`).

- **Expected address:** `0x2300000A84D25dF63081feAa37ba6b62C4c89a30`
- **Salt:** `0x12a6712f113536d8b01d99f72ce168c7e1090124db54cd16f03c20000022178c`
- **Compiler:** solc 0.8.17, 1,000 optimization runs

**Deploy:**

```bash
# Extract salt and creation bytecode from contracts.json
SALT=$(python3 -c "import json; d=json.load(open('deployments/contracts.json')); print(d['LSP23LinkedContractsFactory']['salt'])")
CREATION_BYTECODE=$(python3 -c "import json; d=json.load(open('deployments/contracts.json')); print(d['LSP23LinkedContractsFactory']['creationBytecode'])")

# Deploy via Nick Factory
cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

**Verify deployment:**

```bash
cast code 0x2300000A84D25dF63081feAa37ba6b62C4c89a30 --rpc-url $RPC_URL
# Should return non-empty bytecode
```

### 1.2 UniversalProfileInitPostDeploymentModule

The post-deployment module is called by LSP23 after deploying a UP + KeyManager proxy pair. It executes a `delegatecall` on the UP to set initial data keys (LSP3 profile metadata, LSP1 delegate, permission keys) and then transfers ownership from the module to the Key Manager.

- **Expected address:** `0x000000000066093407b6704B89793beFfD0D8F00`
- **Salt:** `0x12a6712f113536d8b01d99f72ce168c7e10901240d73e80eeb821d01aa4c2b1a`
- **Compiler:** solc 0.8.17, 9,999,999 optimization runs

> **Note:** This contract uses a much higher optimization run count (9,999,999) than other contracts because it is called frequently via delegatecall during UP creation.

**Deploy:**

```bash
SALT=$(python3 -c "import json; d=json.load(open('deployments/contracts.json')); print(d['UniversalProfileInitPostDeploymentModule']['salt'])")
CREATION_BYTECODE=$(python3 -c "import json; d=json.load(open('deployments/contracts.json')); print(d['UniversalProfileInitPostDeploymentModule']['creationBytecode'])")

cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

**Verify:**

```bash
cast code 0x000000000066093407b6704B89793beFfD0D8F00 --rpc-url $RPC_URL
```

---

## Step 2: Deploy Implementation Contracts

Implementation contracts are the base contracts behind ERC1167 minimal proxies. They are deployed once and then used as the implementation target for many proxy instances. Each implementation disables initializers in its constructor to prevent direct use — only proxies pointing to them should be initialized.

All implementation contracts use:

- **Salt:** `0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed`
- **Compiler:** solc 0.8.17, 1,000 optimization runs

The deployment pattern is the same as singletons — deploy via the Nick Factory's CREATE2:

```bash
cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

### 2.1 UniversalProfileInit

Proxy-deployable Universal Profile implementing ERC725Account (ERC725X + ERC725Y), LSP0 (Universal Profile standard), LSP1 (Universal Receiver), and LSP3 (Profile Metadata).

- **Source:** `packages/universalprofile-contracts/contracts/UniversalProfileInit.sol`
- **Constructor:** Calls `_disableInitializers()` — no constructor parameters
- **Initialization:** `initialize(address initialOwner)` — sets the initial owner of the UP

| Version | Address                                      |
| ------- | -------------------------------------------- |
| 0.12.1  | `0x52c90985AF970D4E0DC26Cb5D052505278aF32A9` |
| 0.14.0  | `0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F` |

**Deploy v0.14.0:**

```bash
SALT="0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed"
CREATION_BYTECODE=$(python3 -c "
import json
d = json.load(open('deployments/contracts.json'))
versions = d['UniversalProfileInit']['versions']
v = next(v for v in versions if v['version'] == '0.14.0')
print(v['creationBytecode'])
")

cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

**Verify:**

```bash
cast code 0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F --rpc-url $RPC_URL
```

### 2.2 LSP6KeyManagerInit

Proxy-deployable Key Manager that acts as the permission controller for an ERC725Account (Universal Profile). It verifies that callers have the required permissions (via LSP6 permission keys stored in the UP's ERC725Y data store) before forwarding calls.

- **Source:** `packages/lsp6-contracts/contracts/LSP6KeyManagerInit.sol`
- **Constructor:** Calls `_disableInitializers()`
- **Initialization:** `initialize(address target_)` — sets the UP address this Key Manager controls

| Version | Address                                      |
| ------- | -------------------------------------------- |
| 0.12.1  | `0xa75684d7D048704a2DB851D05Ba0c3cbe226264C` |
| 0.14.0  | `0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4` |

**Deploy v0.14.0:**

```bash
SALT="0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed"
CREATION_BYTECODE=$(python3 -c "
import json
d = json.load(open('deployments/contracts.json'))
versions = d['LSP6KeyManagerInit']['versions']
v = next(v for v in versions if v['version'] == '0.14.0')
print(v['creationBytecode'])
")

cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

**Verify:**

```bash
cast code 0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4 --rpc-url $RPC_URL
```

### 2.3 LSP1UniversalReceiverDelegateUP

Universal Receiver Delegate that automatically registers:

- **LSP5 ReceivedAssets** — tracks received LSP7/LSP8 tokens in the UP's data store
- **LSP10 ReceivedVaults** — tracks received LSP9 Vaults in the UP's data store

This is a stateless contract (no initialization needed). It is set as the UP's Universal Receiver delegate via the `LSP1UniversalReceiverDelegate` data key.

- **Source:** `packages/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateUP.sol`
- **No initialization** — stateless, deployed once and referenced by data key

| Version | Address                                      |
| ------- | -------------------------------------------- |
| 0.12.1  | `0xA5467dfe7019bF2C7C5F7A707711B9d4cAD118c8` |
| 0.14.0  | `0x7870C5B8BC9572A8001C3f96f7ff59961B23500D` |

**Deploy v0.14.0:**

```bash
SALT="0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed"
CREATION_BYTECODE=$(python3 -c "
import json
d = json.load(open('deployments/contracts.json'))
versions = d['LSP1UniversalReceiverDelegateUP']['versions']
v = next(v for v in versions if v['version'] == '0.14.0')
print(v['creationBytecode'])
")

cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

### 2.4 LSP7MintableInit

Proxy-deployable mintable LSP7 token (fungible digital asset). Provides `mint()` function restricted to the contract owner.

- **Source:** `packages/lsp7-contracts/contracts/presets/LSP7MintableInit.sol`
- **Version:** 0.14.0 only
- **Address:** `0x28B7CcdaD1E15cCbDf380c439Cc1F2EBe7f5B2d8`

**Deploy:**

```bash
SALT="0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed"
CREATION_BYTECODE=$(python3 -c "
import json
d = json.load(open('deployments/contracts.json'))
v = d['LSP7MintableInit']['versions'][0]
print(v['creationBytecode'])
")

cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

### 2.5 LSP8MintableInit

Proxy-deployable mintable LSP8 token (identifiable/non-fungible digital asset). Provides `mint()` function restricted to the contract owner.

- **Source:** `packages/lsp8-contracts/contracts/presets/LSP8MintableInit.sol`
- **Version:** 0.14.0 only
- **Address:** `0xd787a2f6B14d4dcC2fb897f40b87f2Ff63a07997`

**Deploy:**

```bash
SALT="0xfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeedfeed"
CREATION_BYTECODE=$(python3 -c "
import json
d = json.load(open('deployments/contracts.json'))
v = d['LSP8MintableInit']['versions'][0]
print(v['creationBytecode'])
")

cast send 0x4e59b44847b379578588920cA78FbF26c0B4956C \
  "$(cast concat-hex $SALT $CREATION_BYTECODE)" \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PK
```

---

## Step 3: Deploy a Universal Profile via LSP23

Once the singletons and implementations are deployed, you can create Universal Profile + Key Manager pairs using the LSP23 factory's `deployERC1167Proxies` function.

### How it works

1. **LSP23 deploys two ERC1167 proxies** — one for the UP (primary) and one for the Key Manager (secondary)
2. **The UP proxy is initialized** with the PostDeploymentModule as its initial owner
3. **The KM proxy is initialized** with the UP proxy's address as its target
4. **The PostDeploymentModule runs** — it delegatecalls into the UP to set data keys (profile metadata, LSP1 delegate, controller permissions) and then transfers ownership to the Key Manager

### Function Signature

```solidity
function deployERC1167Proxies(
  PrimaryContractDeploymentInit calldata primaryContractDeploymentInit,
  SecondaryContractDeploymentInit calldata secondaryContractDeploymentInit,
  address postDeploymentModule,
  bytes calldata postDeploymentModuleCalldata
)
  external
  payable
  returns (address primaryContractAddress, address secondaryContractAddress);
```

### Parameter Breakdown

#### PrimaryContractDeploymentInit (Universal Profile proxy)

```solidity
struct PrimaryContractDeploymentInit {
  bytes32 salt; // Unique salt for deterministic proxy address
  uint256 fundingAmount; // ETH to send to the UP (usually 0)
  address implementationContract; // UniversalProfileInit address
  bytes initializationCalldata; // abi.encodeWithSignature("initialize(address)", postDeploymentModule)
}
```

The `initializationCalldata` encodes `initialize(address)` with the **PostDeploymentModule address** as the initial owner. This is temporary — the module will transfer ownership to the Key Manager after setting data.

#### SecondaryContractDeploymentInit (Key Manager proxy)

```solidity
struct SecondaryContractDeploymentInit {
  uint256 fundingAmount; // ETH to send to KM (always 0)
  address implementationContract; // LSP6KeyManagerInit address
  bytes initializationCalldata; // abi.encodeWithSignature("initialize(address)")
  bool addPrimaryContractAddress; // true — appends UP address to init calldata
  bytes extraInitializationParams; // empty — no extra params needed
}
```

Setting `addPrimaryContractAddress = true` makes LSP23 append the deployed UP proxy address to the initialization calldata. This way the Key Manager is automatically initialized with the correct UP target.

#### postDeploymentModule

```
0x000000000066093407b6704B89793beFfD0D8F00
```

The UniversalProfileInitPostDeploymentModule singleton address.

#### postDeploymentModuleCalldata

ABI-encoded `(bytes32[], bytes[])` containing the data keys and values to set on the UP. The module's `executePostDeployment(address universalProfile, address keyManager, bytes calldata setDataBatchBytes)` function is called by LSP23 with the UP and KM addresses.

The module then:

1. Decodes `setDataBatchBytes` into `(bytes32[] dataKeys, bytes[] dataValues)`
2. Calls `UP.execute(DELEGATECALL, postDeploymentModule, 0, abi.encodeWithSignature("setDataAndTransferOwnership(bytes32[],bytes[],address)", dataKeys, dataValues, keyManager))`
3. Inside the delegatecall, it sets all data keys on the UP and transfers ownership to the Key Manager

### Complete Example

This example deploys a UP with:

- Controller address `0xYourControllerAddress` with ALL_PERMISSIONS
- LSP1 Universal Receiver Delegate set to the v0.14.0 delegate
- LSP3 Profile metadata

```bash
# Contract addresses (from deployments/contracts.json)
LSP23_FACTORY="0x2300000A84D25dF63081feAa37ba6b62C4c89a30"
POST_DEPLOYMENT_MODULE="0x000000000066093407b6704B89793beFfD0D8F00"
UP_IMPLEMENTATION="0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F"       # v0.14.0
KM_IMPLEMENTATION="0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4"       # v0.14.0
LSP1_DELEGATE="0x7870C5B8BC9572A8001C3f96f7ff59961B23500D"           # v0.14.0

# Your controller address (the EOA that will control the UP via the Key Manager)
CONTROLLER="0xYourControllerAddress"

# A unique salt for this specific UP deployment
DEPLOY_SALT="0x$(cast keccak 'my-unique-up-deployment-salt')"
```

#### Encode the initialization calldata

```bash
# UP initialization: initialize(address) with PostDeploymentModule as initial owner
UP_INIT_CALLDATA=$(cast calldata "initialize(address)" $POST_DEPLOYMENT_MODULE)

# KM initialization: initialize(address) — the UP address will be appended by LSP23
KM_INIT_CALLDATA=$(cast calldata "initialize(address)" "0x0000000000000000000000000000000000000000")
# Note: The trailing 32 zero bytes will be replaced by LSP23 with the actual UP address
# because addPrimaryContractAddress=true. Only the 4-byte selector matters.
# Alternatively, use just the selector: 0xc4d66de8 (padded to include the placeholder)
```

#### Encode the post-deployment data

The post-deployment calldata is ABI-encoded `(bytes32[], bytes[])` containing the data keys and values to set on the UP:

```bash
# Data keys to set:
# 1. LSP3Profile metadata
# 2. LSP1UniversalReceiverDelegate
# 3. AddressPermissions:Permissions:<controller> (ALL_PERMISSIONS)
# 4. AddressPermissions[] length
# 5. AddressPermissions[0] (first controller address)

# LSP3Profile key
LSP3_KEY="0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5"

# LSP1UniversalReceiverDelegate key
LSP1_DELEGATE_KEY="0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47"

# AddressPermissions:Permissions:<controller> key
# = keccak256("AddressPermissions:Permissions") + <controller-address-bytes>
PERMISSIONS_KEY="0x4b80742de2bf82acb3630000${CONTROLLER:2}"

# AddressPermissions[] length key
AP_ARRAY_KEY="0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3"

# AddressPermissions[0] key
AP_INDEX_0_KEY="0xdf30dba06db6a30e65354d9a64c60986000000000000000000000000000000000"

# Values:
# LSP3Profile: your IPFS hash or metadata (example)
LSP3_VALUE="0x"  # Replace with actual LSP3 metadata

# LSP1 delegate address (left-padded to 20 bytes)
LSP1_VALUE="0x0000000000000000000000007870C5B8BC9572A8001C3f96f7ff59961B23500D"

# ALL_PERMISSIONS = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
PERMISSIONS_VALUE="0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

# Array length = 1
AP_ARRAY_VALUE="0x0000000000000000000000000000000000000000000000000000000000000001"

# First controller address
AP_INDEX_0_VALUE="0x000000000000000000000000${CONTROLLER:2}"
```

#### Encode and send the transaction

Using a script or inline encoding:

```python
# deploy_up.py
from web3 import Web3
import json

w3 = Web3(Web3.HTTPProvider("$RPC_URL"))

# Load LSP23 ABI (or use the function signature directly)
lsp23 = w3.eth.contract(
    address="0x2300000A84D25dF63081feAa37ba6b62C4c89a30",
    abi=[{
        "inputs": [
            {"components": [
                {"name": "salt", "type": "bytes32"},
                {"name": "fundingAmount", "type": "uint256"},
                {"name": "implementationContract", "type": "address"},
                {"name": "initializationCalldata", "type": "bytes"}
            ], "name": "primaryContractDeploymentInit", "type": "tuple"},
            {"components": [
                {"name": "fundingAmount", "type": "uint256"},
                {"name": "implementationContract", "type": "address"},
                {"name": "initializationCalldata", "type": "bytes"},
                {"name": "addPrimaryContractAddress", "type": "bool"},
                {"name": "extraInitializationParams", "type": "bytes"}
            ], "name": "secondaryContractDeploymentInit", "type": "tuple"},
            {"name": "postDeploymentModule", "type": "address"},
            {"name": "postDeploymentModuleCalldata", "type": "bytes"}
        ],
        "name": "deployERC1167Proxies",
        "outputs": [
            {"name": "primaryContractAddress", "type": "address"},
            {"name": "secondaryContractAddress", "type": "address"}
        ],
        "type": "function"
    }]
)

# Addresses
POST_DEPLOYMENT_MODULE = "0x000000000066093407b6704B89793beFfD0D8F00"
UP_IMPL = "0x3024D38EA2434BA6635003Dc1BDC0daB5882ED4F"
KM_IMPL = "0x2Fe3AeD98684E7351aD2D408A43cE09a738BF8a4"
LSP1_DELEGATE = "0x7870C5B8BC9572A8001C3f96f7ff59961B23500D"
CONTROLLER = "0xYourControllerAddress"

# Encode UP initialization
up_init = w3.eth.contract(abi=[{
    "inputs": [{"name": "initialOwner", "type": "address"}],
    "name": "initialize",
    "type": "function"
}]).encodeABI(fn_name="initialize", args=[POST_DEPLOYMENT_MODULE])

# Encode KM initialization (UP address will be appended by LSP23)
km_init = w3.eth.contract(abi=[{
    "inputs": [{"name": "target_", "type": "address"}],
    "name": "initialize",
    "type": "function"
}]).encodeABI(fn_name="initialize", args=["0x0000000000000000000000000000000000000000"])

# Prepare post-deployment data (data keys and values for the UP)
data_keys = [
    bytes.fromhex("5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5"),  # LSP3Profile
    bytes.fromhex("0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47"),  # LSP1Delegate
    bytes.fromhex("4b80742de2bf82acb3630000" + CONTROLLER[2:].lower()),                    # Permissions
    bytes.fromhex("df30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3"),  # AP[] length
    bytes.fromhex("df30dba06db6a30e65354d9a64c6098600000000000000000000000000000000"),   # AP[0]
]
data_values = [
    b"",  # LSP3Profile value — replace with actual metadata
    bytes.fromhex("0000000000000000000000007870C5B8BC9572A8001C3f96f7ff59961B23500D"),
    bytes.fromhex("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
    (1).to_bytes(32, "big"),
    bytes.fromhex("000000000000000000000000" + CONTROLLER[2:].lower()),
]

post_deployment_calldata = w3.codec.encode(
    ["bytes32[]", "bytes[]"],
    [data_keys, data_values]
)

# Build the transaction
salt = b"\x00" * 32  # Replace with your desired salt
tx = lsp23.functions.deployERC1167Proxies(
    (salt, 0, UP_IMPL, up_init),
    (0, KM_IMPL, km_init, True, b""),
    POST_DEPLOYMENT_MODULE,
    post_deployment_calldata
).build_transaction({
    "from": CONTROLLER,
    "gas": 1_000_000,
    "gasPrice": w3.eth.gas_price,
    "nonce": w3.eth.get_transaction_count(CONTROLLER),
})

# Sign and send
signed = w3.eth.account.sign_transaction(tx, private_key="0xYourPrivateKey")
tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

print(f"UP deployed at: {receipt.logs[0].address}")
print(f"KM deployed at: {receipt.logs[1].address}")
```

### What the PostDeploymentModule Does

After LSP23 deploys both proxies and initializes them, it calls the PostDeploymentModule's `executePostDeployment(address universalProfile, address keyManager, bytes calldata setDataBatchBytes)`:

1. **Decodes the calldata** — Extracts `(bytes32[] dataKeys, bytes[] dataValues)` from `setDataBatchBytes`
2. **Delegatecalls into the UP** — Calls `UP.execute(OPERATION_4_DELEGATECALL, postDeploymentModule, 0, abi.encodeWithSignature("setDataAndTransferOwnership(bytes32[],bytes[],address)", dataKeys, dataValues, keyManager))`
3. **Inside the delegatecall:**
   - Sets all data keys on the UP (LSP3 metadata, LSP1 delegate, controller permissions, etc.)
   - Transfers ownership of the UP from the PostDeploymentModule to the Key Manager via `_setOwner(keyManager)`

After this, the UP is fully configured and controlled by the Key Manager.

---

## Verification

### Block Explorer Verification

To verify contracts on block explorers (Etherscan, Blockscout, etc.):

1. **Use Standard JSON Input** — Generate the standard JSON input for the Solidity compiler:

   ```bash
   # Using Hardhat (from this repository)
   npx hardhat compile
   # The standard JSON input is in artifacts/build-info/*.json
   ```

2. **Verify via Foundry:**

   ```bash
   forge verify-contract \
     --chain-id $CHAIN_ID \
     --compiler-version v0.8.17+commit.8df45f5f \
     --optimizer-runs 1000 \
     --watch \
     $CONTRACT_ADDRESS \
     ContractName \
     --etherscan-api-key $ETHERSCAN_API_KEY
   ```

3. **Verify via Blockscout API:**
   ```bash
   curl -X POST "https://$BLOCKSCOUT_URL/api?module=contract&action=verifysourcecode" \
     -d "addressHash=$CONTRACT_ADDRESS" \
     -d "compilerVersion=v0.8.17+commit.8df45f5f" \
     -d "optimization=true" \
     -d "optimizationRuns=1000" \
     -d "contractSourceCode=$(cat standard-input.json)"
   ```

### Source Files

All contract source files are in this repository:

| Contract                                 | Source Path                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| LSP23LinkedContractsFactory              | `packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol`                      |
| UniversalProfileInitPostDeploymentModule | `packages/lsp23-contracts/contracts/modules/UniversalProfileInitPostDeploymentModule.sol` |
| UniversalProfileInit                     | `packages/universalprofile-contracts/contracts/UniversalProfileInit.sol`                  |
| LSP6KeyManagerInit                       | `packages/lsp6-contracts/contracts/LSP6KeyManagerInit.sol`                                |
| LSP1UniversalReceiverDelegateUP          | `packages/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateUP.sol`           |
| LSP7MintableInit                         | `packages/lsp7-contracts/contracts/presets/LSP7MintableInit.sol`                          |
| LSP8MintableInit                         | `packages/lsp8-contracts/contracts/presets/LSP8MintableInit.sol`                          |

### Verifying Deployed Bytecode

After deployment, verify the on-chain bytecode matches the expected runtime bytecode from `deployments/contracts.json`:

```bash
# Get on-chain bytecode
ON_CHAIN=$(cast code $CONTRACT_ADDRESS --rpc-url $RPC_URL)

# Compare with expected bytecode from contracts.json
EXPECTED=$(python3 -c "
import json
d = json.load(open('deployments/contracts.json'))
print(d['LSP23LinkedContractsFactory']['bytecode'])
")

[ "$ON_CHAIN" = "$EXPECTED" ] && echo "✅ Bytecode matches" || echo "❌ Bytecode mismatch"
```

---

## Compiler Settings Reference

All contracts are compiled with Solidity 0.8.17 and optimization enabled.

| Contract                                  | solc Version | Optimization | Runs      |
| ----------------------------------------- | ------------ | ------------ | --------- |
| LSP23LinkedContractsFactory               | 0.8.17       | Enabled      | 1,000     |
| UniversalProfileInitPostDeploymentModule  | 0.8.17       | Enabled      | 9,999,999 |
| UniversalProfileInit (v0.12.1)            | 0.8.17       | Enabled      | 1,000     |
| UniversalProfileInit (v0.14.0)            | 0.8.17       | Enabled      | 1,000     |
| LSP6KeyManagerInit (v0.12.1)              | 0.8.17       | Enabled      | 1,000     |
| LSP6KeyManagerInit (v0.14.0)              | 0.8.17       | Enabled      | 1,000     |
| LSP1UniversalReceiverDelegateUP (v0.12.1) | 0.8.17       | Enabled      | 1,000     |
| LSP1UniversalReceiverDelegateUP (v0.14.0) | 0.8.17       | Enabled      | 1,000     |
| LSP7MintableInit (v0.14.0)                | 0.8.17       | Enabled      | 1,000     |
| LSP8MintableInit (v0.14.0)                | 0.8.17       | Enabled      | 1,000     |

---

## Reference: `deployments/contracts.json`

The [`deployments/contracts.json`](./deployments/contracts.json) file contains all contract build artifacts needed for deployment.

### Structure

```json
{
  "ContractName": {
    "type": "Singleton | Implementation",

    // Flat structure (Singletons without versions):
    "version": "none",
    "address": "0x...",
    "salt": "0x...",
    "compilerSettings": {
      "solcVersion": "0.8.17",
      "optimisation": { "enabled": true, "runs": "1000" }
    },
    "creationBytecode": "0x...",
    "bytecode": "0x...",

    // Versioned structure (Implementation contracts):
    "versions": [
      {
        "version": "0.14.0",
        "address": "0x...",
        "salt": "0x...",
        "compilerSettings": { ... },
        "creationBytecode": "0x...",
        "bytecode": "0x...",
        "releaseurl": "https://..."
      }
    ]
  }
}
```

### Field Reference

| Field               | Description                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `type`              | `"Singleton"` (deterministic address, one per network) or `"Implementation"` (behind proxies) |
| `address`           | The expected deployment address (deterministic via CREATE2)                                   |
| `salt`              | The CREATE2 salt — concatenate with `creationBytecode` and send to the Nick Factory           |
| `creationBytecode`  | The full contract creation bytecode (constructor + contract code). This is what you deploy.   |
| `bytecode`          | The runtime bytecode (what ends up on-chain after deployment). Use for verification.          |
| `compilerSettings`  | Solidity compiler version and optimization settings for verification                          |
| `constructorParams` | Constructor parameters (if any) — currently only present on UniversalProfileInit entries      |
| `releaseurl`        | Link to the release notes (on versioned contracts)                                            |

### Extracting Bytecodes

```bash
# Singleton (flat structure)
python3 -c "
import json
d = json.load(open('deployments/contracts.json'))
c = d['LSP23LinkedContractsFactory']
print('Salt:', c['salt'])
print('Creation bytecode:', c['creationBytecode'][:40], '...')
"

# Implementation (versioned structure)
python3 -c "
import json
d = json.load(open('deployments/contracts.json'))
versions = d['UniversalProfileInit']['versions']
for v in versions:
    print(f'v{v[\"version\"]}: {v[\"address\"]}')
    print(f'  Salt: {v[\"salt\"]}')
    print(f'  Creation bytecode: {v[\"creationBytecode\"][:40]}...')
"
```
