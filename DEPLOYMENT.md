
# Deployment

You can find a deployment utility with hardhat to easily deploy the smart contracts locally or on our L14 test network.

All the deployment scripts for `base` contracts initialize the contract after deployment to the zero address for security.

&nbsp;
## How to deploy on L14 with Hardhat?

1. write a private key for an address you control in the `hardhat.config.ts` file.

```ts
    // public L14 test network
    luksoL14: {
      live: true,
      url: "https://rpc.l14.lukso.network",
      chainId: 22,
      accounts: ["0xaabbccddeeff..."] // your private key here
    },
```

&nbsp;

Skip the next two steps (2 & 3) if you already have some LYX test token.

2. Visit [LUKSO l14 Fauset](http://faucet.l14.lukso.network/), for fauset.

3. In other to verify you recieved some fauset [L14 Public Testnet Config](https://docs.lukso.tech/networks/l14-testnet) 

4. run the command using one of the available `--tags`

```
npx hardhat deploy --network luksoL14 --tags <options> --reset
```

Available `--tags <options>` are:

- `UniversalProfile`: deploy a Universal Profile with the deployer as the owner

- `UniversalProfileInit`: deploy a Universal Profile as a base contract (for proxy use)

- `LSP6KeyManager`: deploy a `UniversalProfile` + `KeyManager`, with the Universal Profile address linked to the Key Manager.     

- `LSP6KeyManagerInit`: deploy a `UniversalProfileInit` + `KeyManagerInit`, as base contracts (**NB:** the Key Manager will be initialized with reference to `address(0)`).   

- `LSP1UniversalReceiverDelegate`: deploy a Universal Receiver Delegate contract

- `LSP1UniversalReceiverDelegateInit`: deploy a Universal Receiver Delegate as a base contract.

- `standard`: deploy the 3 standard contract above.

- `base`: deploy the 3 base contract above (for proxy use)

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
