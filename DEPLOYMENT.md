
# Deployment

You can find a deployment utility with hardhat to easily deploy the smart contracts locally or on our L14 test network,
if you don't have some LYX test token visit [LUKSO l14 Faucet](http://faucet.l14.lukso.network/), for faucet.

All the deployment scripts for `base` contracts initialize the contract after deployment to the zero address for security.

&nbsp;
## How to deploy on L14 with Hardhat?

1. write a private key for an address you control in the `hardhat.config.ts` file. For instance for L16 network:

```ts
    // public L14 test network
    luksoL16: {
      live: true,
      url: "https://rpc.l16.lukso.network",
      chainId: 2828,
      accounts: ["0xaabbccddeeff..."] // your private key here
    },
```

&nbsp;

2. run the command using one of the available `--tags`

```
npx hardhat deploy --network luksoL14 --tags <options> --reset
```

Available `--tags <options>` are:

- `UniversalProfile`: deploy a Universal Profile with the deployer as the owner

- `UniversalProfileInit`: deploy + initialize (= lock) a Universal Profile as a base contract that can be used as implementation behind proxy.

- `LSP6KeyManager`: deploy a `UniversalProfile` + `KeyManager`, with the Universal Profile address linked to the Key Manager.     

- `LSP6KeyManagerInit`: deploy + initialize (= lock) both a `UniversalProfileInit` + `KeyManagerInit`, as base contracts (**NB:** the Key Manager will be initialized with reference to `address(0)`).   

- `LSP1UniversalReceiverDelegateUP`: deploy a Universal Receiver Delegate contract that can be used to register assets received by a Universal Profile.

- `LSP7Mintable`: deploy a `LSP7Mintable` contract (Token), using the deployer address as the owner and allowing this deployer address to then mint tokens. The `isNFT_` parameter is set to `false`, making the token divisible.

- `LSP8Mintable`: deploy a `LSP7Mintable` contract (NFT), using the deployer address as the owner and allowing this deployer address to then mint tokens.

- `LSP7MintableInit`: deploy + initialize (= lock) a `LSP7MintableInit` contract (Token), that can be used as implementation behind proxy.  The base contract is deployed with the `isNFT_` parameter set to `false`, making the implementation token divisible.

- `LSP8MintableInit`: deploy + initialize (= lock) a `LSP8MintableInit` contract, that can be used as implementation behind proxy.


- `standard`: deploy the 4 standard contract above.

- `base`: deploy the 4 base contract above (for proxy use)

&nbsp;

**Examples**

```
// Deploy the 3 contracts
npx hardhat deploy --network luksoL14 --tags standard --reset


// Deploy the 3 contracts as base contracts (to be used behind proxies)
npx hardhat deploy --network luksoL14 --tags base --reset

// Deploy a specific contract
npx hardhat deploy --network luksoL14 --tags UniversalProfile --reset
```
