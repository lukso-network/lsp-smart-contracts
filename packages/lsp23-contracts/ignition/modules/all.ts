import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import LSP23LinkedContractsFactoryModule from './LSP23LinkedContractsFactory.js';
import UniversalProfileInitPostDeploymentModuleModule from './UniversalProfileInitPostDeploymentModule.js';
import UniversalProfilePostDeploymentModuleModule from './UniversalProfilePostDeploymentModule.js';

/**
 * Aggregate module that deploys all LSP23 contracts
 *
 * This module composes all individual LSP23 modules and deploys them together.
 * Use this for deploying the complete LSP23 package.
 *
 * ## Included Contracts
 * - LSP23LinkedContractsFactory
 * - UniversalProfileInitPostDeploymentModule
 * - UniversalProfilePostDeploymentModule
 *
 * @example
 * ```bash
 * # Deploy all LSP23 contracts
 * npx hardhat ignition deploy ignition/modules/all.ts
 *
 * # Deploy all with CREATE2
 * npx hardhat ignition deploy ignition/modules/all.ts --strategy create2
 * ```
 */
const LSP23AllModule = buildModule('LSP23All', (m) => {
  const { lsp23Factory } = m.useModule(LSP23LinkedContractsFactoryModule);
  const { upInitPostDeploymentModule } = m.useModule(
    UniversalProfileInitPostDeploymentModuleModule,
  );
  const { upPostDeploymentModule } = m.useModule(UniversalProfilePostDeploymentModuleModule);

  return {
    lsp23Factory,
    upInitPostDeploymentModule,
    upPostDeploymentModule,
  };
});

export default LSP23AllModule;
