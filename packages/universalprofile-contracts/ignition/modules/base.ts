import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import UniversalProfileInitModule from './UniversalProfileInit.js';

/**
 * Module that deploys all UniversalProfile base contracts for proxies
 *
 * This module deploys contracts that are used as implementation/base contracts
 * for proxy patterns (ERC1167 minimal proxies, etc.)
 *
 * ## Included Contracts
 * - UniversalProfileInit (base contract for UP proxies)
 *
 * @example
 * ```bash
 * # Deploy base contracts
 * npx hardhat ignition deploy ignition/modules/base.ts
 *
 * # Deploy with CREATE2 for deterministic addresses
 * npx hardhat ignition deploy ignition/modules/base.ts --strategy create2
 * ```
 */
const UniversalProfileBaseModule = buildModule('UniversalProfileBase', (m) => {
  const { universalProfileInit } = m.useModule(UniversalProfileInitModule);

  return {
    universalProfileInit,
  };
});

export default UniversalProfileBaseModule;
