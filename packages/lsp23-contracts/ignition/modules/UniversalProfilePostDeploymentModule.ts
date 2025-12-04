import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying UniversalProfilePostDeploymentModule
 *
 * This module deploys the post-deployment module for standard (non-proxy) Universal Profiles.
 *
 * ## Standardized Deployment
 * For production deployments, use Nick's Factory with the following parameters:
 * - **Standardized Address**: `0x0000005aD606bcFEF9Ea6D0BbE5b79847054BcD7`
 * - **Standardized Salt**: `0x42ff55d7957589c62da54a4368b10a2bc549f2038bbb6880ec6b3e0ecae2ba58`
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/UniversalProfilePostDeploymentModule.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/UniversalProfilePostDeploymentModule.ts --strategy create2
 * ```
 */
const UniversalProfilePostDeploymentModuleModule = buildModule(
  'UniversalProfilePostDeploymentModule',
  (m) => {
    const contractDeployer = m.getAccount(0);
    const upPostDeploymentModule = m.contract('UniversalProfilePostDeploymentModule', [], {
      from: contractDeployer,
    });

    return { upPostDeploymentModule };
  },
);

export default UniversalProfilePostDeploymentModuleModule;
