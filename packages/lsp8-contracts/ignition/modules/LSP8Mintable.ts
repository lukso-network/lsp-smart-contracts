import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * Ignition module for deploying LSP8Mintable
 *
 * This module deploys the standard (non-proxy) version of LSP8Mintable NFT.
 *
 * @example
 * ```bash
 * npx hardhat ignition deploy ignition/modules/LSP8Mintable.ts \
 *   --parameters '{"LSP8Mintable": {"name": "My NFT", "symbol": "MNFT", "newOwner": "0x...", "lsp4TokenType": 1, "lsp8TokenIdFormat": 0}}'
 * ```
 */
const LSP8MintableModule = buildModule('LSP8Mintable', (m) => {
  const name = m.getParameter<string>('name');
  const symbol = m.getParameter<string>('symbol');
  const newOwner = m.getParameter<string>('newOwner');
  const lsp4TokenType = m.getParameter<number>('lsp4TokenType');
  const lsp8TokenIdFormat = m.getParameter<number>('lsp8TokenIdFormat');

  const contractDeployer = m.getAccount(0);
  const lsp8Mintable = m.contract(
    'LSP8Mintable',
    [name, symbol, newOwner, lsp4TokenType, lsp8TokenIdFormat],
    {
      from: contractDeployer,
    },
  );

  return { lsp8Mintable };
});

export default LSP8MintableModule;
