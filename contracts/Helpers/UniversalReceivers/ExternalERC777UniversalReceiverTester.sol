// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../../../submodules/ERC725/implementations/contracts/interfaces/ILSP1_UniversalReceiverDelegate.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

contract ExternalERC777UniversalReceiverTester is ERC165Storage, ILSP1Delegate {

    bytes4 internal constant _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    bytes32 internal constant _TOKENS_SENDER_INTERFACE_HASH =
        0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895; // keccak256("ERC777TokensSender")

    bytes32 internal constant _TOKENS_RECIPIENT_INTERFACE_HASH =
        0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b; // keccak256("ERC777TokensRecipient")

    constructor() {
        _registerInterface(_INTERFACE_ID_LSP1DELEGATE);
    }

    event ReceivedERC777(
        address indexed token, 
        address indexed _operator, 
        address indexed _from, 
        address _to, 
        uint256 _amount
    );

    function universalReceiverDelegate(
        address sender, 
        bytes32 typeId, 
        bytes memory data
    ) 
        external 
        override 
        returns (bytes memory)
    {

        if (typeId == _TOKENS_RECIPIENT_INTERFACE_HASH) {
            (address _operator, address _from, address _to, uint256 _amount) = _toERC777Data(data);

            emit ReceivedERC777(sender, _operator, _from, _to, _amount);

            return "";

        } else if(typeId == _TOKENS_SENDER_INTERFACE_HASH) {

            return "";

        } else {
            revert("UniversalReceiverDelegate: Given typeId not supported.");
        }
    }


    function _toERC777Data(bytes memory _bytes) 
        internal 
        pure 
        returns(
            address _operator, 
            address _from, 
            address _to, 
            uint256 _amount
        ) 
    {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            _operator := mload(add(add(_bytes, 0x14), 0x0))
            _from := mload(add(add(_bytes, 0x14), 0x14))
            _to := mload(add(add(_bytes, 0x28), 0x28))
            _amount := mload(add(add(_bytes, 0x20), 0x42))
        }
    }
}