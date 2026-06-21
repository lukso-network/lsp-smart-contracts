# Tutorial - Deploy a Universal Profile with the LSP23 Factory

Once singletons and implementations are deployed, create Universal Profile + Key Manager pairs using `deployERC1167Proxies`:

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

### How it works

1. LSP23 deploys two ERC-1167 proxies — one for the UP (primary) and one for the Key Manager (secondary)
2. The UP proxy is initialized with the PostDeploymentModule as its temporary owner
3. The KM proxy is initialized with the UP address as its target (via `addPrimaryContractAddress = true`)
4. LSP23 calls the PostDeploymentModule which:
   - Decodes `postDeploymentModuleCalldata` as `(bytes32[] dataKeys, bytes[] dataValues)`
   - `delegatecall`s into the UP to set all data keys (LSP3 profile, LSP1 delegate, controller permissions)
   - Transfers UP ownership to the Key Manager

### Parameters

| Parameter                                                   | Value                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `primaryContractDeploymentInit.implementationContract`      | UniversalProfileInit address                                                    |
| `primaryContractDeploymentInit.initializationCalldata`      | `abi.encodeWithSignature("initialize(address)", postDeploymentModuleAddress)`   |
| `secondaryContractDeploymentInit.implementationContract`    | LSP6KeyManagerInit address                                                      |
| `secondaryContractDeploymentInit.initializationCalldata`    | `abi.encodeWithSignature("initialize(address)")` — UP address appended by LSP23 |
| `secondaryContractDeploymentInit.addPrimaryContractAddress` | `true`                                                                          |
| `postDeploymentModule`                                      | `0x000000000066093407b6704B89793beFfD0D8F00`                                    |
| `postDeploymentModuleCalldata`                              | ABI-encoded `(bytes32[], bytes[])` — the data keys/values to set on the UP      |

The `postDeploymentModuleCalldata` typically sets:

- `SupportedStandards:LSP3Profile` — profile metadata
- `LSP1UniversalReceiverDelegate` — points to the LSP1 delegate address
- `AddressPermissions:Permissions:<controller>` — permissions for the controller EOA
- `AddressPermissions[]` — the array of controllers

> See the [LSP23 modules README](../packages/lsp23-contracts/contracts/modules/README.md) and the [PostDeploymentModule source](../packages/lsp23-contracts/contracts/modules/UniversalProfileInitPostDeploymentModule.sol) for the complete flow.

---

## Further Reading

- [LSP-23 Linked Contracts Factory spec](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md)
- [LSP23 modules README](../packages/lsp23-contracts/contracts/modules/README.md)
- [PostDeploymentModule (Init) deployment guide](../packages/lsp23-contracts/contracts/modules/deployment-UP-init-module.md)
- [PostDeploymentModule deployment guide](../packages/lsp23-contracts/contracts/modules/deployment-UP-module.md)
- [Nick Factory / Deterministic Deployment Proxy](https://github.com/Arachnid/deterministic-deployment-proxy)
