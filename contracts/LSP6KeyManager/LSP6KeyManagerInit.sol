// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.6;

// modules
import "./LSP6KeyManagerInitAbstract.sol";

/**
 * @title Proxy implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller, Jean Cavallera
 * @dev all the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
contract LSP6KeyManagerInit is LSP6KeyManagerInitAbstract {
    /**
     * @inheritdoc LSP6KeyManagerInitAbstract
     */
    function initialize(address _account) public virtual override initializer {
        LSP6KeyManagerInitAbstract.initialize(_account);
    }
}
