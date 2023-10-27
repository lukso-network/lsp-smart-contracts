# LSP23 Linked Contracts Deployment Module

This folder contains modules related to the deployment of LSP23 Linked Contracts. The modules are essential for initializing and post-deploying actions for Universal Profiles.

## Modules

- **UniversalProfileInitPostDeploymentModule**: This module is responsible for the initial setup after the deployment of a Universal Profile Init contract.

  - **Standardized Address**: `0x000000000066093407b6704B89793beFfD0D8F00`
  - **Standardized Salt**: `0x12a6712f113536d8b01d99f72ce168c7e10901240d73e80eeb821d01aa4c2b1a`
  - [More Details](./deployment-UP-init-module.md)

- **UniversalProfilePostDeploymentModule**: This module is responsible for the initial setup after the deployment of a Universal Profile contract.
  - **Standardized Address**: `0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7`
  - **Standardized Salt**: `0x42ff55d7957589c62da54a4368b10a2bc549f2038bbb6880ec6b3e0ecae2ba58`
  - [More Details](./deployment-UP-module.md)

## Setup

Before deploying any of these modules, make sure that the following contracts are already deployed on the same network:

- [Nick's Factory contract](https://github.com/Arachnid/deterministic-deployment-proxy/tree/master)
- [LSP23 Linked Contracts Factory](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md#lsp23linkedcontractsfactory-deployment)
