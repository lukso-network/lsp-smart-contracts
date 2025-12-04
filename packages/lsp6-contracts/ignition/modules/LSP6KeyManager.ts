import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP6KeyManager
 *
 * This module deploys the standard (non-proxy) version of LSP6KeyManager.
 * It requires the address of a UniversalProfile to be passed as a parameter.
 *
 * @example
 * ```bash
 * npx hardhat ignition deploy ignition/modules/LSP6KeyManager.ts --parameters '{"LSP6KeyManager": {"target": "0x..."}}'
 * ```
 */
const LSP6KeyManagerModule = buildModule('LSP6KeyManager', (m) => {
  // The target contract (UniversalProfile) address that this KeyManager will control
  const target = m.getParameter<string>('target');

  const contractDeployer = m.getAccount(0);
  const keyManager = m.contract('LSP6KeyManager', [target], {
    from: contractDeployer,
  });

  return { keyManager };
});

export default LSP6KeyManagerModule;
