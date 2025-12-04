import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP23LinkedContractsFactory
 *
 * This module deploys the LSP23 Linked Contracts Factory.
 *
 * ## Standardized Deployment
 * For production deployments, use Nick's Factory with the following parameters:
 * - **Standardized Address**: `0x2300000A84D25dF63081feAa37ba6b62C4c89a30`
 * - **Standardized Salt**: `0x12a6712f113536d8b01d99f72ce168c7e1090124db54cd16f03c20000022178c`
 *
 * ## Related Modules
 * After deploying LSP23, you may need to deploy the post-deployment modules:
 * - UniversalProfileInitPostDeploymentModule (for proxy UPs)
 * - UniversalProfilePostDeploymentModule (for standard UPs)
 *
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-23-LinkedContractsFactory.md
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/LSP23LinkedContractsFactory.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/LSP23LinkedContractsFactory.ts --strategy create2
 * ```
 */
const LSP23LinkedContractsFactoryModule = buildModule('LSP23LinkedContractsFactory', (m) => {
  const contractDeployer = m.getAccount(0);
  const lsp23Factory = m.contract('LSP23LinkedContractsFactory', [], {
    from: contractDeployer,
  });

  return { lsp23Factory };
});

export default LSP23LinkedContractsFactoryModule;
