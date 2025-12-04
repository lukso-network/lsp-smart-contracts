import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP9Vault
 *
 * This module deploys the standard (non-proxy) version of LSP9Vault.
 *
 * @example
 * ```bash
 * npx hardhat ignition deploy ignition/modules/LSP9Vault.ts \
 *   --parameters '{"LSP9Vault": {"newOwner": "0x..."}}'
 * ```
 */
const LSP9VaultModule = buildModule('LSP9Vault', (m) => {
  const newOwner = m.getParameter<string>('newOwner');

  const contractDeployer = m.getAccount(0);
  const vault = m.contract('LSP9Vault', [newOwner], {
    from: contractDeployer,
  });

  return { vault };
});

export default LSP9VaultModule;
