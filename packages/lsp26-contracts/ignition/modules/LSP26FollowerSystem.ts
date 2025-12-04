import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP26FollowerSystem
 *
 * This module deploys the LSP26 Follower System contract.
 *
 * Note: For production deployments with specific deterministic addresses,
 * use the scripts/deploy-lsp26-nick-factory.ts script which handles
 * Nick Factory CREATE2 deployments with pre-calculated addresses.
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/LSP26FollowerSystem.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/LSP26FollowerSystem.ts --strategy create2
 * ```
 */
const LSP26FollowerSystemModule = buildModule('LSP26FollowerSystem', (m) => {
  const contractDeployer = m.getAccount(0);
  const followerSystem = m.contract('LSP26FollowerSystem', [], {
    from: contractDeployer,
  });

  return { followerSystem };
});

export default LSP26FollowerSystemModule;
