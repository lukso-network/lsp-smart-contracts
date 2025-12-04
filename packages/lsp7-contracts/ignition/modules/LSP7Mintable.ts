import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP7Mintable
 *
 * This module deploys the standard (non-proxy) version of LSP7Mintable token.
 *
 * @example
 * ```bash
 * npx hardhat ignition deploy ignition/modules/LSP7Mintable.ts \
 *   --parameters '{"LSP7Mintable": {"name": "My Token", "symbol": "MTK", "newOwner": "0x...", "lsp4TokenType": 0, "isNonDivisible": false}}'
 * ```
 */
const LSP7MintableModule = buildModule('LSP7Mintable', (m) => {
  const name = m.getParameter<string>('name');
  const symbol = m.getParameter<string>('symbol');
  const newOwner = m.getParameter<string>('newOwner');
  const lsp4TokenType = m.getParameter<number>('lsp4TokenType');
  const isNonDivisible = m.getParameter<boolean>('isNonDivisible');

  const contractDeployer = m.getAccount(0);
  const lsp7Mintable = m.contract(
    'LSP7Mintable',
    [name, symbol, newOwner, lsp4TokenType, isNonDivisible],
    {
      from: contractDeployer,
    },
  );

  return { lsp7Mintable };
});

export default LSP7MintableModule;
