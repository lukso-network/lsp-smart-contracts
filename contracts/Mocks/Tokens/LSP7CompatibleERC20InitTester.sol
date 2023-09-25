// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// modules
import {
    LSP7CompatibleERC20InitAbstract
} from "../../LSP7DigitalAsset/extensions/LSP7CompatibleERC20InitAbstract.sol";

contract LSP7CompatibleERC20InitTester is LSP7CompatibleERC20InitAbstract {
    /**
     * @dev initialize (= lock) base implementation contract on deployment
     */
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) public initializer {
        LSP7CompatibleERC20InitAbstract._initialize(name_, symbol_, newOwner_);
    }

    function mint(address to, uint256 amount, bytes calldata data) public {
        // using force=true so we can send to EOA in test
        _mint(to, amount, true, data);
    }

    function burn(address from, uint256 amount, bytes calldata data) public {
        _burn(from, amount, data);
    }
}
