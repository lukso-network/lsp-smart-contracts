import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP8MintableInit (base contract for proxies)
 *
 * This module deploys the initializable base contract version of LSP8Mintable,
 * intended for use with proxy patterns.
 *
 * For deterministic (CREATE2) deployment, use the --strategy create2 flag
 * and configure the salt in hardhat.config.ts:
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/LSP8MintableInit.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/LSP8MintableInit.ts --strategy create2
 * ```
 */
const LSP8MintableInitModule = buildModule('LSP8MintableInit', (m) => {
  const contractDeployer = m.getAccount(0);
  const lsp8MintableInit = m.contract('LSP8MintableInit', [], {
    from: contractDeployer,
  });

  return { lsp8MintableInit };
});

export default LSP8MintableInitModule;
