import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP1UniversalReceiverDelegateVault
 *
 * This contract handles universal receiver notifications for Vaults (LSP9).
 *
 * For deterministic (CREATE2) deployment, use the --strategy create2 flag
 * and configure the salt in hardhat.config.ts:
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/LSP1UniversalReceiverDelegateVault.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/LSP1UniversalReceiverDelegateVault.ts --strategy create2
 * ```
 */
const LSP1UniversalReceiverDelegateVaultModule = buildModule(
  'LSP1UniversalReceiverDelegateVault',
  (m) => {
    const contractDeployer = m.getAccount(0);
    const lsp1UniversalReceiverDelegateVault = m.contract(
      'LSP1UniversalReceiverDelegateVault',
      [],
      {
        from: contractDeployer,
      },
    );

    return { lsp1UniversalReceiverDelegateVault };
  },
);

export default LSP1UniversalReceiverDelegateVaultModule;
