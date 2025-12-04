import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying UniversalProfile
 *
 * This module deploys the standard (non-proxy) version of UniversalProfile.
 *
 * @example
 * ```bash
 * npx hardhat ignition deploy ignition/modules/UniversalProfile.ts \
 *   --parameters '{"UniversalProfile": {"initialOwner": "0x..."}}'
 * ```
 */
const UniversalProfileModule = buildModule('UniversalProfile', (m) => {
  const initialOwner = m.getParameter<string>('initialOwner');

  const universalProfile = m.contract('UniversalProfile', [initialOwner]);

  return { universalProfile };
});

export default UniversalProfileModule;
