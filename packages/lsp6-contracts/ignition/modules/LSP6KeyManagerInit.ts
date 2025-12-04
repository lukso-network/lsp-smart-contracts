import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP6KeyManagerInit (base contract for proxies)
 *
 * This module deploys the initializable base contract version of LSP6KeyManager,
 * intended for use with proxy patterns.
 *
 * For deterministic (CREATE2) deployment, use the --strategy create2 flag
 * and configure the salt in hardhat.config.ts:
 *
 * @example
 * ```bash
 * # Standard deployment
 * npx hardhat ignition deploy ignition/modules/LSP6KeyManagerInit.ts
 *
 * # Deterministic CREATE2 deployment
 * npx hardhat ignition deploy ignition/modules/LSP6KeyManagerInit.ts --strategy create2
 * ```
 */
const LSP6KeyManagerInitModule = buildModule('LSP6KeyManagerInit', (m) => {
  const contractDeployer = m.getAccount(0);
  const lsp6KeyManagerInit = m.contract('LSP6KeyManagerInit', [], {
    from: contractDeployer,
  });

  return { lsp6KeyManagerInit };
});

export default LSP6KeyManagerInitModule;
