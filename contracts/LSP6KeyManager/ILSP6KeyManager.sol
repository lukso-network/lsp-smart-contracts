// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "@erc725/smart-contracts/contracts/interfaces/IERC1271.sol";

/**
 * @dev Contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 */
interface ILSP6KeyManager is IERC1271 /* is ERC165 */ {
        
    event Executed(uint256 indexed  _value, bytes _data); 
    
    
    function getNonce(address _address, uint256 _channel) external view returns (uint256);
    
    function execute(bytes calldata _data) external payable returns (bytes memory);
    
    function executeRelayCall(address _signedFor, uint256 _nonce, bytes calldata _data, bytes memory _signature) external payable returns (bytes memory);
 
}