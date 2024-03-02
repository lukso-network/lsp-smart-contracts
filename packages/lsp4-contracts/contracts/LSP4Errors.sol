// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized.
 * The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract.
 * It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.
 */
error LSP4TokenNameNotEditable();

/**
 * @dev Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized.
 * The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract.
 * It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.
 */
error LSP4TokenSymbolNotEditable();

/**
 * @dev Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized.
 * The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract.
 * It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.
 */
error LSP4TokenTypeNotEditable();
