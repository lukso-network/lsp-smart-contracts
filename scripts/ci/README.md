# CI Scripts

> You might experience errors if running these files outside of a CI environnement (like GitHub actions) for the reason below.

The following folder contains 3 files intended to be used as part of the CI/CD of the repository.

- `android-artifacts.ts`: used to prepare the contracts' ABIs + Binaries to generate the Java [web3j-based wrappers](https://docs.web3j.io/4.8.7/).
- `ios-artifacts.ts`: used to generate the contracts' ABIs so that they can be used in Swift.
- `deploy-verify.sh`: shell utility command to deploy + verify a smart contract on a specified network.

## `deploy-verify.sh`

The `deploy-verify.sh` command can also be used standalone (outside of the CI) from the root folder of the repository as follows.

```
./scripts/ci/deploy-verify.sh -n luksoL16 -c UniversalProfile
```

It requires to specify a private key in a local `.env` file under the global variable `CONTRACT_VERIFICATION_PK`.

```
CONTRACT_VERIFICATION_PK=0x...
```

The following arguments must be specified:

- `-n`: network to deploy on. **MUST be configured in the `hardhat.config.ts`**
- `-c`: contract to be deployed + verified. See [`DEPLOYMENT.md`](../../DEPLOYMENT.md) for more details of the available options.
