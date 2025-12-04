import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP1UniversalReceiverDelegateUP
 *
 * This contract handles universal receiver notifications for Universal Profiles.
 *
 * For deterministic (CREATE2) deployment, use the --strategy create2 flag
 * and configure the salt in hardhat.config.ts:
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/LSP1UniversalReceiverDelegateUP.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/LSP1UniversalReceiverDelegateUP.ts --strategy create2
 * ```
 */
const LSP1UniversalReceiverDelegateUPModule = buildModule(
  'LSP1UniversalReceiverDelegateUP',
  (m) => {
    const contractDeployer = m.getAccount(0);
    const lsp1UniversalReceiverDelegateUP = m.contract('LSP1UniversalReceiverDelegateUP', [], {
      from: contractDeployer,
    });

    return { lsp1UniversalReceiverDelegateUP };
  },
);

export default LSP1UniversalReceiverDelegateUPModule;
