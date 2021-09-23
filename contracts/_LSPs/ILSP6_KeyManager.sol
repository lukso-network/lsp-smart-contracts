// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../../submodules/ERC725/implementations/contracts/IERC1271.sol";

/**
 * @dev Contract module that allows to receive arbitrary messages when assets are sent or received.
 *
 * TODO: ERC 165 interface id: 
 */
interface ILSP6 is IERC1271 /* is ERC165 */ {
        
    event Executed(uint256 indexed  _value, bytes _data); 
    
    
    function getNonce(address _address, uint128 _channelId) external view returns (uint256);
    
    function execute(bytes calldata _data) external payable returns (bool);
    
    function executeRelayCall(bytes calldata _data, address _signedFor, uint256 _nonce, bytes memory _signature) external payable returns (bool);
 
}