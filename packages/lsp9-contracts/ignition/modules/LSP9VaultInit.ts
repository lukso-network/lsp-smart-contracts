import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP9VaultInit (base contract for proxies)
 *
 * This module deploys the initializable base contract version of LSP9Vault,
 * intended for use with proxy patterns.
 *
 * For deterministic (CREATE2) deployment, use the --strategy create2 flag
 * and configure the salt in hardhat.config.ts:
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/LSP9VaultInit.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/LSP9VaultInit.ts --strategy create2
 * ```
 */
const LSP9VaultInitModule = buildModule('LSP9VaultInit', (m) => {
  const contractDeployer = m.getAccount(0);
  const vaultInit = m.contract('LSP9VaultInit', [], {
    from: contractDeployer,
  });

  return { vaultInit };
});

export default LSP9VaultInitModule;
