import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying UniversalProfileInitPostDeploymentModule
 *
 * This module deploys the post-deployment module for initializable (proxy) Universal Profiles.
 *
 * ## Standardized Deployment
 * For production deployments, use Nick's Factory with the following parameters:
 * - **Standardized Address**: `0x000000000066093407b6704B89793beFfD0D8F00`
 * - **Standardized Salt**: `0x12a6712f113536d8b01d99f72ce168c7e10901240d73e80eeb821d01aa4c2b1a`
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/UniversalProfileInitPostDeploymentModule.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/UniversalProfileInitPostDeploymentModule.ts --strategy create2
 * ```
 */
const UniversalProfileInitPostDeploymentModuleModule = buildModule(
  'UniversalProfileInitPostDeploymentModule',
  (m) => {
    const contractDeployer = m.getAccount(0);
    const upInitPostDeploymentModule = m.contract('UniversalProfileInitPostDeploymentModule', [], {
      from: contractDeployer,
    });

    return { upInitPostDeploymentModule };
  },
);

export default UniversalProfileInitPostDeploymentModuleModule;
