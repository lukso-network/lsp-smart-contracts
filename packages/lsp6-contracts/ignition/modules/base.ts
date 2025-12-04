import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import LSP6KeyManagerInitModule from './LSP6KeyManagerInit.js';

/**
 * Module that deploys all LSP6 base contracts for proxies
 *
 * This module deploys contracts that are used as implementation/base contracts
 * for proxy patterns (ERC1167 minimal proxies, etc.)
 *
 * ## Included Contracts
 * - LSP6KeyManagerInit
 *
 * @example
 * ```bash
 * # Deploy base contracts
 * npx hardhat ignition deploy ignition/modules/base.ts
 *
 * # Deploy with CREATE2 for deterministic addresses
 * npx hardhat ignition deploy ignition/modules/base.ts --strategy create2
 * ```
 */
const LSP6BaseModule = buildModule('LSP6Base', (m) => {
  const { lsp6KeyManagerInit } = m.useModule(LSP6KeyManagerInitModule);

  return {
    lsp6KeyManagerInit,
  };
});

export default LSP6BaseModule;
