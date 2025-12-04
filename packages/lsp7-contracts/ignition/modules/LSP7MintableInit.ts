import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP7MintableInit (base contract for proxies)
 *
 * This module deploys the initializable base contract version of LSP7Mintable,
 * intended for use with proxy patterns.
 *
 * For deterministic (CREATE2) deployment, use the --strategy create2 flag
 * and configure the salt in hardhat.config.ts:
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/LSP7MintableInit.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/LSP7MintableInit.ts --strategy create2
 * ```
 */
const LSP7MintableInitModule = buildModule('LSP7MintableInit', (m) => {
  const contractDeployer = m.getAccount(0);
  const lsp7MintableInit = m.contract('LSP7MintableInit', [], {
    from: contractDeployer,
  });

  return { lsp7MintableInit };
});

export default LSP7MintableInitModule;
