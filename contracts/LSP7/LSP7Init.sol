// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "./LSP7Constants.sol";
import "../LSP4/LSP4Constants.sol";

// modules
import "./LSP7Core.sol";
import "../LSP4/LSP4Init.sol";

/**
 * @dev Implementation of a LSP7 compliant contract.
 */
contract LSP7Init is Initializable, LSP4Init, LSP7Core {
    //
    // --- Initialize
    //

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_
    )
        public
        virtual
        override
        initializer
    {
        LSP4Init.initialize(name_, symbol_, newOwner_);

        // TODO: when ERC725Y has been updated
        // bytes32[] keys = new bytes32[](2);
        // bytes[] values = new bytes[](2);
        //
        // keys.push(_LSP7_SUPPORTED_STANDARD_KEY);
        // values.push(abi.encodePacked(_LSP7_SUPPORTED_STANDARD_VALUE));
        //
        // setDataFromMemory(keys, values);
        setDataFromMemory(_LSP7_SUPPORTED_STANDARDS_KEY, abi.encodePacked(_LSP7_SUPPORTED_STANDARDS_VALUE));
    }

    //
    // --- Overrides
    //

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Storage, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _msgData()
        internal
        view
        virtual
        override(Context, ContextUpgradeable)
        returns (bytes calldata)
    {
        return super._msgData();
    }

    function _msgSender()
        internal
        view
        virtual
        override(Context, ContextUpgradeable)
        returns (address)
    {
        return super._msgSender();
    }
}
