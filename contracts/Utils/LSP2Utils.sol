// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

/**
 * @title ERC725 Utility library to encode key types
 * @dev based on LSP2 - ERC725Y JSON Schema
 *      https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#array
 */
library LSP2Utils {

    function generateSingletonKey(string memory _keyName)
        public 
        pure
        returns (bytes32)
    {
        return keccak256(bytes(_keyName));
    }   

    function generateArrayKey(string memory _keyName)
        public
        pure
        returns (bytes32)
    {
        bytes memory keyName = bytes(_keyName);
        
        require(
            keyName[keyName.length - 2] == 0x5b // "[" in utf8 encoded
            && keyName[keyName.length - 1] == 0x5d,  // "]" in utf8
            "Missing empty square brackets \"[]\" at the end of the key name"
        );

        return keccak256(keyName);
    }
    
    function generateMappingKey(string memory _firstWord, string memory _lastWord)
        public
        pure
        returns (bytes32 key_)
    {
        bytes32 firstWordHash = keccak256(bytes(_firstWord));
        bytes32 lastWordHash = keccak256(bytes(_lastWord));
        
        bytes memory temporaryBytes = abi.encodePacked(
            bytes16(firstWordHash), 
            bytes12(0), 
            bytes4(lastWordHash)
        );
        
        assembly {
            key_ := mload(add(temporaryBytes, 32))
        }
    
    }

    function generateAddressMappingKey(string memory _firstWord, address _address)
        public 
        pure
        returns (bytes32 key_)
    {   
        bytes32 firstWordHash = keccak256(bytes(_firstWord));

        bytes memory temporaryBytes = abi.encodePacked(
            bytes8(firstWordHash), 
            bytes4(0), 
            _address
        );

        assembly {
            key_ := mload(add(temporaryBytes, 32))
        }

    }

    function generateAddressMappingGroupingKey(
        string memory _firstWord, 
        string memory _secondWord, 
        address _address
    )
        public
        pure
        returns (bytes32 key_)
    {
        bytes32 firstWordHash = keccak256(bytes(_firstWord));
        bytes32 secondWordHash = keccak256(bytes(_secondWord));

        bytes memory temporaryBytes = abi.encodePacked(
            bytes4(firstWordHash),
            bytes4(0),
            bytes2(secondWordHash),
            bytes2(0),
            _address
        );

        assembly {
            key_ := mload(add(temporaryBytes, 32))
        }
    }

}