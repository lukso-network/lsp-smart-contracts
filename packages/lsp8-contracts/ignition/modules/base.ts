import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import LSP8MintableInitModule from './LSP8MintableInit.js';

/**
 * Module that deploys all LSP8 base contracts for proxies
 *
 * This module deploys contracts that are used as implementation/base contracts
 * for proxy patterns (ERC1167 minimal proxies, etc.)
 *
 * ## Included Contracts
 * - LSP8MintableInit
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
const LSP8BaseModule = buildModule('LSP8Base', (m) => {
  const { lsp8MintableInit } = m.useModule(LSP8MintableInitModule);

  return {
    lsp8MintableInit,
  };
});

export default LSP8BaseModule;
