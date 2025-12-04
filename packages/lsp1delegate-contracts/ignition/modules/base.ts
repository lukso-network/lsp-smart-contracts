import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import LSP1UniversalReceiverDelegateUPModule from './LSP1UniversalReceiverDelegateUP.js';

/**
 * Module that deploys all LSP1 base contracts for proxies
 *
 * This module deploys contracts that are used as implementation/base contracts
 * for proxy patterns (ERC1167 minimal proxies, etc.)
 *
 * ## Included Contracts
 * - LSP1UniversalReceiverDelegateUP
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
const LSP1BaseModule = buildModule('LSP1Base', (m) => {
  const { lsp1UniversalReceiverDelegateUP } = m.useModule(LSP1UniversalReceiverDelegateUPModule);

  return {
    lsp1UniversalReceiverDelegateUP,
  };
});

export default LSP1BaseModule;
