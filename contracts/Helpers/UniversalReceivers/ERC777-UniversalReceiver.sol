// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../../../submodules/ERC725/implementations/contracts/interfaces/ILSP1_UniversalReceiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// modules
import "@openzeppelin/contracts/utils/Address.sol";
import "./ERC777.sol";

/**
 * @dev Implementation of the `IERC777` interface. WITHOUT the use of ERC1820, but LSP1UniversalReceiver.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using `_mint`.
 *
 * Support for ERC20 is included in this contract, as specified by the EIP: both
 * the ERC777 and ERC20 interfaces can be safely used when interacting with it.
 * Both `IERC777.Sent` and `IERC20.Transfer` events are emitted on token
 * movements.
 *
 * Additionally, the `granularity` value is hard-coded to `1`, meaning that there
 * are no special restrictions in the amount of tokens that created, moved, or
 * destroyed. This makes integration with ERC20 applications seamless.
 */
contract ERC777UniversalReceiver is ERC777 {
    using Address for address;

    bytes4 private constant _INTERFACE_ID_LSP1 = 0x6bb56a14;

    bytes32 constant internal _TOKENS_SENDER_INTERFACE_HASH =
    0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895; // keccak256("ERC777TokensSender")

    bytes32 constant internal _TOKENS_RECIPIENT_INTERFACE_HASH =
    0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b; // keccak256("ERC777TokensRecipient")

    /**
     * @dev `defaultOperators` may be an empty array.
     */
    constructor(
        string memory name,
        string memory symbol,
        address[] memory defaultOperators
    ) {
        _name = name;
        _symbol = symbol;

        _defaultOperatorsArray = defaultOperators;
        for (uint256 i = 0; i < _defaultOperatorsArray.length; i++) {
            _defaultOperators[_defaultOperatorsArray[i]] = true;
        }
    }

    function mint(address _address, uint256 _amount) external virtual {
        require(_defaultOperators[_msgSender()], "Only default operators can mint");
        _mint(_address, _amount, "", "");
    }

    // add to expose for inheriting contracts
    function _move(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    )
        internal
        virtual
        override
    {
        ERC777._move(operator, from, to, amount, userData, operatorData);
    }

    /**
     * @dev Call from.tokensToSend() if the interface is registered
     * @param operator address operator requesting the transfer
     * @param from address token holder address
     * @param to address recipient address
     * @param amount uint256 amount of tokens to transfer
     * @param userData bytes extra information provided by the token holder (if any)
     * @param operatorData bytes extra information provided by the operator (if any)
     */
    function _callTokensToSend(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData
    )
        internal
        override
    {

        if (ERC165Checker.supportsERC165(from) && ERC165Checker.supportsInterface(from, _INTERFACE_ID_LSP1)) {
            bytes memory data = abi.encodePacked(operator, from, to, amount, userData, operatorData);
            ILSP1(from).universalReceiver(_TOKENS_SENDER_INTERFACE_HASH, data);
        }

        /* solhint-disable */
        // bytes memory data = abi.encodePacked(operator, from, to, amount, userData, operatorData);
        // (bool succ, bytes memory ret) = to.call(
        //     abi.encodeWithSignature("universalReceiver(bytes32,bytes)", 
        //     _TOKENS_SENDER_INTERFACE_HASH,data)
        // );
        // if(requireReceptionAck && from.isContract()) {
        //     bytes32 returnHash;
        //     assembly {
        //         returnHash := mload(add(ret, 32))
        //     }
        //     require(
        //         succ && returnHash == _TOKENS_SENDER_INTERFACE_HASH,
        //         "ERC777: token recipient contract has no implementer for ERC777TokensSender"
        //     );
        // }
        /** solhint-enable */
    }

    /**
     * @dev Call to.tokensReceived() if the interface is registered. Reverts if the recipient is a contract but
     * tokensReceived() was not registered for the recipient
     * @param operator address operator requesting the transfer
     * @param from address token holder address
     * @param to address recipient address
     * @param amount uint256 amount of tokens to transfer
     * @param userData bytes extra information provided by the token holder (if any)
     * @param operatorData bytes extra information provided by the operator (if any)
     * @param requireReceptionAck if true, contract recipients are required to implement ERC777TokensRecipient
     */
    function _callTokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes memory userData,
        bytes memory operatorData,
        bool requireReceptionAck
    )
        internal
        override
    {
        if (ERC165Checker.supportsERC165(to) && ERC165Checker.supportsInterface(to, _INTERFACE_ID_LSP1)) {
            bytes memory data = abi.encodePacked(operator, from, to, amount, userData, operatorData);
            ILSP1(to).universalReceiver(_TOKENS_RECIPIENT_INTERFACE_HASH, data);
        } else if (requireReceptionAck) {
            require(
                !to.isContract(), 
                "ERC777: token recipient contract has no universal receiver for 'ERC777TokensRecipient'"
            );
        }
    }
}