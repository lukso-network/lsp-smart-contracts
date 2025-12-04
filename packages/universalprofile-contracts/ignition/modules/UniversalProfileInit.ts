import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying UniversalProfileInit (base contract for proxies)
 *
 * This module deploys the initializable base contract version of UniversalProfile,
 * intended for use with proxy patterns.
 *
 * For deterministic (CREATE2) deployment, use the --strategy create2 flag
 * and configure the salt in hardhat.config.ts:
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/UniversalProfileInit.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/UniversalProfileInit.ts --strategy create2
 * ```
 */
const UniversalProfileInitModule = buildModule('UniversalProfileInit', (m) => {
  const universalProfileInit = m.contract('UniversalProfileInit');

  return { universalProfileInit };
});

export default UniversalProfileInitModule;
